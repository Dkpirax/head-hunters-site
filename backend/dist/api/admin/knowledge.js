"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.knowledgeRouter = void 0;
const express_1 = require("express");
const db_1 = require("../../lib/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
const multer_1 = __importDefault(require("multer"));
const { PDFParse } = require('pdf-parse');
const mammoth = __importStar(require("mammoth"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const vector_store_1 = require("../../lib/vector-store");
exports.knowledgeRouter = (0, express_1.Router)();
// Store documents securely outside public folders
const uploadDir = process.env.KNOWLEDGE_UPLOAD_DIR || path_1.default.resolve(process.cwd(), '../private_uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: uploadDir,
        filename: (req, file, cb) => {
            cb(null, `${crypto_1.default.randomUUID()}-${file.originalname}`);
        },
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only PDF and DOCX are allowed.'));
        }
    }
});
function normalizeText(text) {
    return text
        .replace(/\s+/g, ' ')
        .trim();
}
function chunkText(text, maxTokens = 600, overlap = 100) {
    // A simple word-based chunking strategy for Phase 1. 1 token ~= 0.75 words.
    // So 600 tokens ~= 450 words.
    const words = text.split(' ');
    const chunks = [];
    const maxWords = Math.floor(maxTokens * 0.75);
    const overlapWords = Math.floor(overlap * 0.75);
    let i = 0;
    while (i < words.length) {
        const chunk = words.slice(i, i + maxWords).join(' ');
        chunks.push(chunk);
        i += (maxWords - overlapWords);
    }
    return chunks;
}
exports.knowledgeRouter.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file)
            return res.status(400).json({ error: 'No file uploaded' });
        let rawText = '';
        if (file.mimetype === 'application/pdf') {
            const dataBuffer = fs_1.default.readFileSync(file.path);
            const parser = new PDFParse({ data: dataBuffer });
            const pdfData = await parser.getText();
            rawText = pdfData.text;
        }
        else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const result = await mammoth.extractRawText({ path: file.path });
            rawText = result.value;
        }
        if (!rawText.trim()) {
            return res.status(400).json({ error: 'No extractable text found in the document.' });
        }
        const checksum = crypto_1.default.createHash('sha256').update(rawText).digest('hex');
        const version = `v${Date.now()}`;
        // Save to DB as DRAFT
        await db_1.db.insert(schema_1.knowledgeDocument).values({
            title: req.body.title || file.originalname,
            fileName: file.filename,
            version: version,
            status: 'DRAFT',
            checksum: checksum,
            uploadedBy: 'ADMIN' // or req.user.id
        });
        const docId = (await db_1.db.select().from(schema_1.knowledgeDocument).where((0, drizzle_orm_1.eq)(schema_1.knowledgeDocument.version, version)))[0].id;
        // Chunk and save to KnowledgeChunk in PROCESSING state
        const normalized = normalizeText(rawText);
        const chunks = chunkText(normalized);
        for (let i = 0; i < chunks.length; i++) {
            const chunkHash = crypto_1.default.createHash('sha256').update(chunks[i]).digest('hex');
            const tokenCount = Math.floor(chunks[i].split(' ').length / 0.75);
            await db_1.db.insert(schema_1.knowledgeChunk).values({
                documentId: docId,
                documentVersion: version,
                chunkIndex: i,
                contentHash: chunkHash,
                tokenCount: tokenCount,
                vectorRecordId: `chk_${version}_${i}`,
                status: 'ACTIVE'
            });
            // We don't save the chunk content in MySQL as requested: "LanceDB stores vectors and searchable chunk content."
        }
        res.json({ success: true, message: 'Document uploaded and chunked.', version });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.knowledgeRouter.post('/reindex', async (req, res) => {
    const { version } = req.body;
    if (!version)
        return res.status(400).json({ error: 'Version required' });
    try {
        const doc = await db_1.db.select().from(schema_1.knowledgeDocument).where((0, drizzle_orm_1.eq)(schema_1.knowledgeDocument.version, version)).then((r) => r[0]);
        if (!doc)
            return res.status(404).json({ error: 'Document not found' });
        // Mark as PROCESSING
        await db_1.db.update(schema_1.knowledgeDocument).set({ status: 'PROCESSING' }).where((0, drizzle_orm_1.eq)(schema_1.knowledgeDocument.id, doc.id));
        // For reindexing, we should retrieve the text again or we should have saved it?
        // Wait, we didn't save chunk content to DB, and LanceDB doesn't have it yet!
        // We must parse the file again.
        const filePath = path_1.default.join(uploadDir, doc.fileName);
        let rawText = '';
        if (doc.fileName.endsWith('.pdf')) {
            const dataBuffer = fs_1.default.readFileSync(filePath);
            const parser = new PDFParse({ data: dataBuffer });
            const pdfData = await parser.getText();
            rawText = pdfData.text;
        }
        else {
            const result = await mammoth.extractRawText({ path: filePath });
            rawText = result.value;
        }
        const normalized = normalizeText(rawText);
        const textChunks = chunkText(normalized);
        const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
        const embeddingModel = process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text';
        const apiKey = process.env.OLLAMA_API_KEY || ''; // Usually empty for local
        const lanceChunks = [];
        // Process embeddings
        for (let i = 0; i < textChunks.length; i++) {
            const response = await fetch(`${baseUrl}/api/embed`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
                },
                body: JSON.stringify({
                    model: embeddingModel,
                    input: textChunks[i]
                })
            });
            if (!response.ok) {
                throw new Error(`Ollama embedding failed: ${response.statusText}`);
            }
            const data = await response.json();
            lanceChunks.push({
                vector: data.embeddings[0],
                chunkId: `chk_${version}_${i}`,
                documentId: doc.id,
                documentVersion: version,
                status: 'ACTIVE',
                checksum: doc.checksum,
                content: textChunks[i]
            });
        }
        // Insert to LanceDB
        await (0, vector_store_1.createKnowledgeIndex)(version, lanceChunks);
        // Update status to INDEXED
        await db_1.db.update(schema_1.knowledgeDocument)
            .set({ status: 'INDEXED', indexedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.knowledgeDocument.id, doc.id));
        res.json({ success: true, message: 'Reindexed successfully' });
    }
    catch (error) {
        // If failed, mark as FAILED
        await db_1.db.update(schema_1.knowledgeDocument).set({ status: 'FAILED' }).where((0, drizzle_orm_1.eq)(schema_1.knowledgeDocument.version, version));
        res.status(500).json({ error: error.message });
    }
});
exports.knowledgeRouter.get('/status', async (req, res) => {
    const docs = await db_1.db.select().from(schema_1.knowledgeDocument).orderBy((0, drizzle_orm_1.desc)(schema_1.knowledgeDocument.uploadedAt));
    // Get chunk counts for each document
    const docsWithMeta = await Promise.all(docs.map(async (doc) => {
        const chunks = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.knowledgeChunk).where((0, drizzle_orm_1.eq)(schema_1.knowledgeChunk.documentVersion, doc.version));
        return {
            ...doc,
            chunkCount: chunks[0]?.count || 0,
            errorMessage: doc.status === 'FAILED' ? 'Failed to process document or communicate with Ollama API' : undefined
        };
    }));
    res.json({ documents: docsWithMeta });
});
// Endpoint to approve and activate a document version
exports.knowledgeRouter.post('/approve', async (req, res) => {
    const { version } = req.body;
    // Set all to INACTIVE
    await db_1.db.update(schema_1.knowledgeDocument).set({ status: 'INACTIVE' }).where((0, drizzle_orm_1.eq)(schema_1.knowledgeDocument.status, 'APPROVED'));
    // Set target to APPROVED
    await db_1.db.update(schema_1.knowledgeDocument).set({ status: 'APPROVED' }).where((0, drizzle_orm_1.eq)(schema_1.knowledgeDocument.version, version));
    res.json({ success: true, message: `Version ${version} is now APPROVED and active.` });
});
// Endpoint to deactivate a document version
exports.knowledgeRouter.post('/deactivate', async (req, res) => {
    const { version } = req.body;
    await db_1.db.update(schema_1.knowledgeDocument).set({ status: 'INACTIVE' }).where((0, drizzle_orm_1.eq)(schema_1.knowledgeDocument.version, version));
    res.json({ success: true, message: `Version ${version} is now INACTIVE.` });
});
