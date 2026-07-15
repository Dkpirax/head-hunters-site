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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("./lib/db");
const schema_1 = require("./db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: '../.env' });
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = __importDefault(require("./api/auth"));
const settings_1 = require("./api/settings");
const dashboard_1 = require("./api/dashboard");
const jobs_1 = __importDefault(require("./api/admin/jobs"));
const conversations_1 = require("./api/admin/conversations");
const articles_1 = require("./api/admin/articles");
const enquiries_1 = require("./api/admin/enquiries");
const users_1 = require("./api/admin/users");
const enquiries_2 = require("./api/enquiries");
const chat_1 = require("./api/chat");
// Serve static frontend files
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use((0, cookie_parser_1.default)());
// Public routes
app.use('/api/auth', auth_1.default);
app.use('/api/settings', settings_1.settingsRouter);
app.use('/api/enquiries', enquiries_2.enquiriesRouter);
app.use('/api/chat', chat_1.chatRouter);
// Protected Admin Routes
app.use('/api/admin/dashboard', dashboard_1.dashboardRouter);
app.use('/api/admin/jobs', jobs_1.default);
app.use('/api/admin/conversations', conversations_1.adminConversationsRouter);
app.use('/api/admin/articles', articles_1.adminArticlesRouter);
app.use('/api/admin/enquiries', enquiries_1.adminEnquiriesRouter);
app.use('/api/admin/users', users_1.adminUsersRouter);
// Endpoint: Get latest 3 active jobs for homepage
app.get('/api/jobs/latest', async (req, res) => {
    try {
        const { eq } = await Promise.resolve().then(() => __importStar(require('drizzle-orm')));
        const jobs = await db_1.db.select()
            .from(schema_1.job)
            .where(eq(schema_1.job.status, "ACTIVE"))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.job.createdAt))
            .limit(3);
        res.json(jobs);
    }
    catch (error) {
        console.error('Error fetching latest jobs:', error);
        res.status(500).json({ error: 'Failed to fetch latest jobs' });
    }
});
// Example endpoint: Get all Jobs
app.get('/api/jobs', async (req, res) => {
    try {
        const jobs = await db_1.db.select().from(schema_1.job).orderBy((0, drizzle_orm_1.desc)(schema_1.job.createdAt));
        res.json(jobs);
    }
    catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Failed to fetch jobs' });
    }
});
// Endpoint: Get all published articles
app.get('/api/articles', async (req, res) => {
    try {
        const { eq } = await Promise.resolve().then(() => __importStar(require('drizzle-orm')));
        const { article } = await Promise.resolve().then(() => __importStar(require('./db/schema')));
        const articles = await db_1.db.select()
            .from(article)
            .where(eq(article.isPublished, true))
            .orderBy((0, drizzle_orm_1.desc)(article.createdAt));
        res.json(articles);
    }
    catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});
// Health check endpoints
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'running' });
});
app.get('/api/health/database', async (req, res) => {
    try {
        await db_1.db.execute((0, drizzle_orm_1.sql) `SELECT 1`);
        res.json({ status: 'ok', database: 'connected' });
    }
    catch (error) {
        console.error('Database connection failed'); // Do not log raw errors or connection strings
        res.status(503).json({ error: 'Database is temporarily unavailable' });
    }
});
// React SPA fallback: always serve index.html for non-API routes
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'), (err) => {
        if (err) {
            res.status(404).send('Frontend not built yet. Please use the Vite dev server (usually http://localhost:5173) during development.');
        }
    });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
