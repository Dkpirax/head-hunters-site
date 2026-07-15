import { Router } from 'express';
import { db } from '../../lib/db';
import { job } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const jobs = await db.select().from(job).orderBy(desc(job.createdAt));
    return res.json(jobs);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    await db.insert(job).values({
      title: data.title,
      location: data.location,
      type: data.type,
      description: data.description,
      status: data.status || 'ACTIVE',
      isHot: data.isHot || false,
    });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create job' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    await db.update(job).set({
      title: data.title,
      location: data.location,
      type: data.type,
      description: data.description,
      status: data.status,
      isHot: data.isHot,
    }).where(eq(job.id, id));
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update job' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(job).where(eq(job.id, id));
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete job' });
  }
});

export default router;
