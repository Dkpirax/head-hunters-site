import { Router } from 'express';
import { db } from '../../lib/db';
import { enquiry } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth';

export const adminEnquiriesRouter = Router();

adminEnquiriesRouter.use(requireAuth);

adminEnquiriesRouter.get('/', async (req, res) => {
  try {
    const enquiries = await db.select().from(enquiry).orderBy(desc(enquiry.createdAt));
    return res.json(enquiries);
  } catch (error) {
    console.error('Failed to fetch enquiries:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminEnquiriesRouter.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    await db.update(enquiry).set({ status }).where(eq(enquiry.id, id));
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update enquiry status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminEnquiriesRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(enquiry).where(eq(enquiry.id, id));
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete enquiry:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
