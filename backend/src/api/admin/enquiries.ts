import { Router } from "express";
import { db } from "../../lib/db";
import { enquiry } from "../../db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

// Get all enquiries
router.get("/", async (req, res) => {
  try {
    const enquiries = await db.select().from(enquiry).orderBy(desc(enquiry.createdAt));
    res.json(enquiries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch enquiries" });
  }
});

// Update enquiry status
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    await db.update(enquiry).set({ status }).where(eq(enquiry.id, id));
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update enquiry status" });
  }
});

// Delete an enquiry
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(enquiry).where(eq(enquiry.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete enquiry" });
  }
});

export default router;
