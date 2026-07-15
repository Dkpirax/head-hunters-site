import { Router } from 'express';
import { db } from '../../lib/db';
import { article } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth';

export const adminArticlesRouter = Router();

adminArticlesRouter.use(requireAuth);

adminArticlesRouter.get('/', async (req, res) => {
  try {
    const articles = await db.select().from(article).orderBy(desc(article.createdAt));
    return res.json(articles);
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminArticlesRouter.post('/', async (req, res) => {
  try {
    const { title, slug, category, excerpt, content, isPublished } = req.body;
    
    if (!title || !slug) {
      return res.status(400).json({ error: 'Title and slug are required' });
    }
    
    const existing = await db.select().from(article).where(eq(article.slug, slug)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Slug already exists' });
    }
    
    const newArt = await db.insert(article).values({
      title,
      slug,
      category,
      excerpt: excerpt || '',
      content: content || '',
      isPublished: isPublished || false,
    }).returning();
    
    return res.json(newArt[0]);
  } catch (error) {
    console.error('Failed to create article:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminArticlesRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, category, excerpt, content, isPublished } = req.body;
    
    // Check slug uniqueness for other articles
    if (slug) {
      const existing = await db.select().from(article).where(eq(article.slug, slug)).limit(1);
      if (existing.length > 0 && existing[0].id !== id) {
        return res.status(400).json({ error: 'Slug already exists' });
      }
    }
    
    const updateData: any = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (category !== undefined) updateData.category = category;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    
    await db.update(article).set(updateData).where(eq(article.id, id));
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update article:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminArticlesRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(article).where(eq(article.id, id));
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete article:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
