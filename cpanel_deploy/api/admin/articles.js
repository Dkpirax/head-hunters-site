"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminArticlesRouter = void 0;
const express_1 = require("express");
const db_1 = require("../../lib/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../../middleware/auth");
const crypto_1 = __importDefault(require("crypto"));
exports.adminArticlesRouter = (0, express_1.Router)();
exports.adminArticlesRouter.use(auth_1.requireAuth);
exports.adminArticlesRouter.get('/', async (req, res) => {
    try {
        const articles = await db_1.db.select().from(schema_1.article).orderBy((0, drizzle_orm_1.desc)(schema_1.article.createdAt));
        return res.json(articles);
    }
    catch (error) {
        console.error('Failed to fetch articles:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.adminArticlesRouter.post('/', async (req, res) => {
    try {
        const { title, slug, category, excerpt, content, isPublished } = req.body;
        if (!title || !slug) {
            return res.status(400).json({ error: 'Title and slug are required' });
        }
        const existing = await db_1.db.select().from(schema_1.article).where((0, drizzle_orm_1.eq)(schema_1.article.slug, slug)).limit(1);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Slug already exists' });
        }
        const articleId = crypto_1.default.randomUUID();
        await db_1.db.insert(schema_1.article).values({
            id: articleId,
            title,
            slug,
            category,
            excerpt: excerpt || '',
            content: content || '',
            isPublished: isPublished || false,
        });
        const [newArt] = await db_1.db.select()
            .from(schema_1.article)
            .where((0, drizzle_orm_1.eq)(schema_1.article.id, articleId))
            .limit(1);
        return res.json(newArt);
    }
    catch (error) {
        console.error('Failed to create article:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.adminArticlesRouter.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, slug, category, excerpt, content, isPublished } = req.body;
        // Check slug uniqueness for other articles
        if (slug) {
            const existing = await db_1.db.select().from(schema_1.article).where((0, drizzle_orm_1.eq)(schema_1.article.slug, slug)).limit(1);
            if (existing.length > 0 && existing[0].id !== id) {
                return res.status(400).json({ error: 'Slug already exists' });
            }
        }
        const updateData = { updatedAt: new Date() };
        if (title !== undefined)
            updateData.title = title;
        if (slug !== undefined)
            updateData.slug = slug;
        if (category !== undefined)
            updateData.category = category;
        if (excerpt !== undefined)
            updateData.excerpt = excerpt;
        if (content !== undefined)
            updateData.content = content;
        if (isPublished !== undefined)
            updateData.isPublished = isPublished;
        await db_1.db.update(schema_1.article).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.article.id, id));
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Failed to update article:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
exports.adminArticlesRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.db.delete(schema_1.article).where((0, drizzle_orm_1.eq)(schema_1.article.id, id));
        return res.json({ success: true });
    }
    catch (error) {
        console.error('Failed to delete article:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
