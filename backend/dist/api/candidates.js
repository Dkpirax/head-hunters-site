"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const db_1 = require("../lib/db");
const schema_1 = require("../db/schema");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
// Ensure uploads directory exists
const uploadDir = path_1.default.join(process.cwd(), 'uploads', 'cvs');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only PDF and DOCX are allowed.'));
        }
    }
});
// POST /api/candidates/upload
router.post('/upload', upload.single('cv'), async (req, res) => {
    try {
        const { name, email, phone, interestedJobs } = req.body;
        const file = req.file;
        if (!name || !email || !file) {
            return res.status(400).json({ error: 'Name, email, and CV file are required' });
        }
        const newCandidate = {
            id: crypto_1.default.randomUUID(),
            name,
            email,
            phone: phone || null,
            interestedJobs: interestedJobs || null,
            cvFileName: file.filename,
        };
        await db_1.db.insert(schema_1.candidate).values(newCandidate);
        res.status(201).json({ message: 'CV uploaded successfully', candidate: newCandidate });
    }
    catch (error) {
        console.error('Error uploading CV:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'A candidate with this email already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/candidates
// Note: In a real app this should have admin authentication middleware
router.get('/', async (req, res) => {
    try {
        const candidates = await db_1.db.select().from(schema_1.candidate).orderBy(schema_1.candidate.createdAt);
        res.json(candidates);
    }
    catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /api/candidates/download/:filename
router.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path_1.default.join(uploadDir, filename);
    if (fs_1.default.existsSync(filePath)) {
        res.download(filePath);
    }
    else {
        res.status(404).json({ error: 'File not found' });
    }
});
exports.default = router;
