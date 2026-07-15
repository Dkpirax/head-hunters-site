"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../lib/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const router = (0, express_1.Router)();
// Get all articles
router.get("/", async (req, res) => {
    try {
        const articles = await db_1.db.select().from(schema_1.article).orderBy((0, drizzle_orm_1.desc)(schema_1.article.createdAt));
        res.json(articles);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch articles" });
    }
});
// Get article by slug
router.get("/:slug", async (req, res) => {
    try {
        const { slug } = req.params;
        const articles = await db_1.db.select().from(schema_1.article).where((0, drizzle_orm_1.eq)(schema_1.article.slug, slug));
        if (articles.length === 0) {
            return res.status(404).json({ error: "Article not found" });
        }
        res.json(articles[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch article" });
    }
});
// Create article
router.post("/", async (req, res) => {
    try {
        const data = req.body;
        await db_1.db.insert(schema_1.article).values(data);
        res.json({ success: true, data });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create article" });
    }
});
// Update article
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        await db_1.db.update(schema_1.article).set(data).where((0, drizzle_orm_1.eq)(schema_1.article.id, id));
        res.json({ success: true, data: { id, ...data } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update article" });
    }
});
// Delete article
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await db_1.db.delete(schema_1.article).where((0, drizzle_orm_1.eq)(schema_1.article.id, id));
        res.json({ success: true });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete article" });
    }
});
exports.default = router;
