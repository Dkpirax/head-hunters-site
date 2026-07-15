import { Router } from "express";
import { db } from "../../lib/db";
import { adminUser, userPermission, permission } from "../../db/schema";
import { eq, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";

const router = Router();

// Get all admin users
router.get("/", async (req, res) => {
  try {
    const users = await db.select().from(adminUser);
    
    // In a real app we'd fetch permissions too, but to keep it simple we'll just return users
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Create a new admin user
router.post("/", async (req, res) => {
  try {
    const { email, name, role, password } = req.body;
    
    const passwordHash = await bcrypt.hash(password || "password123", 12);
    
    const [id] = await db.insert(adminUser).values({
      email,
      name,
      role,
      passwordHash,
    }).$returningId();
    
    const created = await db.query.adminUser.findFirst({
      where: eq(adminUser.id, id.id)
    });
    
    res.json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update an admin user
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role, password } = req.body;
    
    const updateData: any = {
      email,
      name,
      role,
      updatedAt: new Date(),
    };
    
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }
    
    await db.update(adminUser).set(updateData).where(eq(adminUser.id, id));
    
    const updated = await db.query.adminUser.findFirst({
      where: eq(adminUser.id, id)
    });
    
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete an admin user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(adminUser).where(eq(adminUser.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Reset password email (mock)
router.post("/:id/reset-password", async (req, res) => {
  try {
    // In a real implementation this would generate a token and send an email
    res.json({ success: true, message: "Reset email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send reset email" });
  }
});

export default router;
