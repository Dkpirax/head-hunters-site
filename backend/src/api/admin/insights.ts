import { Router } from "express";
import { db } from "../../lib/db";
import { article } from "../../db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

// Get all articles
router.get("/", async (req, res) => {
  try {
    const articles = await db.select().from(article).orderBy(desc(article.createdAt));
    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

// Get article by slug
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const articles = await db.select().from(article).where(eq(article.slug, slug));
    
    if (articles.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }
    
    res.json(articles[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch article" });
  }
});

// Create article
router.post("/", async (req, res) => {
  try {
    const data = req.body;
    await db.insert(article).values(data);
    res.json({ success: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create article" });
  }
});

// Update article
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    await db.update(article).set(data).where(eq(article.id, id));
    res.json({ success: true, data: { id, ...data } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update article" });
  }
});

// Delete article
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(article).where(eq(article.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete article" });
  }
});

export default router;
