import { Router, Request } from 'express';
import { db } from '../../lib/db';
import { knowledgeDocument, knowledgeChunk } from '../../db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import crypto from 'crypto';
import multer from 'multer';
const { PDFParse } = require('pdf-parse');
import * as mammoth from 'mammoth';
import fs from 'fs';
import path from 'path';
import { createKnowledgeIndex } from '../../lib/vector-store';

export const knowledgeRouter = Router();

// Store documents securely outside public folders
const uploadDir = process.env.KNOWLEDGE_UPLOAD_DIR || path.resolve(process.cwd(), '../private_uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      cb(null, `${crypto.randomUUID()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOCX are allowed.'));
    }
  }
});

function normalizeText(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .trim();
}

function chunkText(text: string, maxTokens = 600, overlap = 100): string[] {
  // A simple word-based chunking strategy for Phase 1. 1 token ~= 0.75 words.
  // So 600 tokens ~= 450 words.
  const words = text.split(' ');
  const chunks: string[] = [];
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

knowledgeRouter.post('/upload', upload.single('file'), async (req: Request, res) => {
  try {
    const file = req.file as Express.Multer.File;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    let rawText = '';
    if (file.mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(file.path);
      const parser = new PDFParse({ data: dataBuffer });
      const pdfData = await parser.getText();
      rawText = pdfData.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ path: file.path });
      rawText = result.value;
    }

    if (!rawText.trim()) {
      return res.status(400).json({ error: 'No extractable text found in the document.' });
    }

    const checksum = crypto.createHash('sha256').update(rawText).digest('hex');
    const version = `v${Date.now()}`;

    // Save to DB as DRAFT
    await db.insert(knowledgeDocument).values({
      title: req.body.title || file.originalname,
      fileName: file.filename,
      version: version,
      status: 'DRAFT',
      checksum: checksum,
      uploadedBy: 'ADMIN' // or req.user.id
    });

    const docId = (await db.select().from(knowledgeDocument).where(eq(knowledgeDocument.version, version)))[0].id;

    // Chunk and save to KnowledgeChunk in PROCESSING state
    const normalized = normalizeText(rawText);
    const chunks = chunkText(normalized);

    for (let i = 0; i < chunks.length; i++) {
      const chunkHash = crypto.createHash('sha256').update(chunks[i]).digest('hex');
      const tokenCount = Math.floor(chunks[i].split(' ').length / 0.75);
      
      await db.insert(knowledgeChunk).values({
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

knowledgeRouter.post('/reindex', async (req, res) => {
  const { version } = req.body;
  if (!version) return res.status(400).json({ error: 'Version required' });

  try {
    const doc = await db.select().from(knowledgeDocument).where(eq(knowledgeDocument.version, version)).then((r: any[]) => r[0]);
    if (!doc) return res.status(404).json({ error: 'Document not found' });

    // Mark as PROCESSING
    await db.update(knowledgeDocument).set({ status: 'PROCESSING' }).where(eq(knowledgeDocument.id, doc.id));

    // For reindexing, we should retrieve the text again or we should have saved it?
    // Wait, we didn't save chunk content to DB, and LanceDB doesn't have it yet!
    // We must parse the file again.
    const filePath = path.join(uploadDir, doc.fileName);
    let rawText = '';
    if (doc.fileName.endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const parser = new PDFParse({ data: dataBuffer });
      const pdfData = await parser.getText();
      rawText = pdfData.text;
    } else {
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
    await createKnowledgeIndex(version, lanceChunks);

    // Update status to INDEXED
    await db.update(knowledgeDocument)
      .set({ status: 'INDEXED', indexedAt: new Date() })
      .where(eq(knowledgeDocument.id, doc.id));

    res.json({ success: true, message: 'Reindexed successfully' });
  } catch (error: any) {
    // If failed, mark as FAILED
    await db.update(knowledgeDocument).set({ status: 'FAILED' }).where(eq(knowledgeDocument.version, version));
    res.status(500).json({ error: error.message });
  }
});

knowledgeRouter.get('/status', async (req, res) => {
  const docs = await db.select().from(knowledgeDocument).orderBy(desc(knowledgeDocument.uploadedAt));
  
  // Get chunk counts for each document
  const docsWithMeta = await Promise.all(docs.map(async (doc) => {
    const chunks = await db.select({ count: sql<number>`count(*)` }).from(knowledgeChunk).where(eq(knowledgeChunk.documentVersion, doc.version));
    return {
      ...doc,
      chunkCount: chunks[0]?.count || 0,
      errorMessage: doc.status === 'FAILED' ? 'Failed to process document or communicate with Ollama API' : undefined
    };
  }));

  res.json({ documents: docsWithMeta });
});

// Endpoint to approve and activate a document version
knowledgeRouter.post('/approve', async (req, res) => {
  const { version } = req.body;
  
  // Set all to INACTIVE
  await db.update(knowledgeDocument).set({ status: 'INACTIVE' }).where(eq(knowledgeDocument.status, 'APPROVED'));
  
  // Set target to APPROVED
  await db.update(knowledgeDocument).set({ status: 'APPROVED' }).where(eq(knowledgeDocument.version, version));
  
  res.json({ success: true, message: `Version ${version} is now APPROVED and active.` });
});

// Endpoint to deactivate a document version
knowledgeRouter.post('/deactivate', async (req, res) => {
  const { version } = req.body;
  
  await db.update(knowledgeDocument).set({ status: 'INACTIVE' }).where(eq(knowledgeDocument.version, version));
  
  res.json({ success: true, message: `Version ${version} is now INACTIVE.` });
});
