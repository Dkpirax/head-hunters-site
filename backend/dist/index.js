"use strict";
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
const fs_1 = __importDefault(require("fs"));
const envPaths = [
    path_1.default.join(__dirname, '.env'), // cPanel deploy (index.js at root)
    path_1.default.join(__dirname, '../../.env'), // local dev (backend/src -> project root)
    path_1.default.join(__dirname, '../.env') // fallback
];
let envLoaded = false;
for (const envPath of envPaths) {
    if (fs_1.default.existsSync(envPath)) {
        dotenv_1.default.config({ path: envPath });
        envLoaded = true;
        break;
    }
}
if (!envLoaded) {
    dotenv_1.default.config(); // fallback to current working directory
}
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const jobs_1 = __importDefault(require("./api/admin/jobs"));
const settings_1 = require("./api/settings");
const users_1 = __importDefault(require("./api/admin/users"));
const enquiries_1 = __importDefault(require("./api/admin/enquiries"));
const insights_1 = __importDefault(require("./api/admin/insights"));
const chat_1 = __importDefault(require("./api/admin/chat"));
const auth_1 = __importDefault(require("./api/auth"));
const auth_2 = require("./middleware/auth");
// Serve static frontend files
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.use((0, cookie_parser_1.default)());
app.use("/api/admin/jobs", auth_2.requireAuth, jobs_1.default);
app.use("/api/settings", settings_1.settingsRouter);
app.use("/api/admin/users", auth_2.requireAuth, users_1.default);
app.use("/api/admin/enquiries", auth_2.requireAuth, enquiries_1.default);
app.use("/api/admin/insights", auth_2.requireAuth, insights_1.default);
app.use("/api/admin/chat", auth_2.requireAuth, chat_1.default);
app.use('/api/auth', auth_1.default);
// Endpoint: Get latest 3 active jobs for homepage
app.get('/api/jobs/latest', async (req, res) => {
    try {
        const jobs = await db_1.db.select()
            .from(schema_1.job)
            .where((0, drizzle_orm_1.eq)(schema_1.job.status, "ACTIVE"))
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
// React SPA fallback: always serve index.html for non-API routes
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
