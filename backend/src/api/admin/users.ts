import { Router } from 'express';
import { db } from '../../lib/db';
import { adminUser, permission, userPermission } from '../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { requireAuth } from '../../middleware/auth';
import bcrypt from 'bcryptjs';

export const adminUsersRouter = Router();

adminUsersRouter.use(requireAuth);

adminUsersRouter.get('/', async (req, res) => {
  try {
    const users = await db.query.adminUser.findMany({
      orderBy: (adminUser, { desc }) => [desc(adminUser.createdAt)],
      with: {
        permissions: {
          with: {
            permission: true
          }
        }
      }
    });

    const allPermissions = await db.select().from(permission);

    // Format like old actions
    const formattedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      permissions: u.permissions.map(p => p.permission.name)
    }));

    return res.json({
      users: formattedUsers,
      permissions: allPermissions.map(p => p.name),
      currentUserEmail: (req as any).user.email
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminUsersRouter.post('/', async (req, res) => {
  try {
    const { email, name, role, password, permissions } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const existing = await db.select().from(adminUser).where(eq(adminUser.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = await db.insert(adminUser).values({
      email,
      name,
      role,
      passwordHash: hashedPassword,
    }).returning();
    
    // Assign permissions
    if (permissions && permissions.length > 0 && role !== 'SUPER_ADMIN') {
      const allPerms = await db.select().from(permission);
      const permMap = Object.fromEntries(allPerms.map(p => [p.name, p.id]));
      
      const insertData = permissions.map((pName: string) => ({
        userId: newUser[0].id,
        permissionId: permMap[pName]
      })).filter((p: any) => p.permissionId);
      
      if (insertData.length > 0) {
        await db.insert(userPermission).values(insertData);
      }
    }
    
    return res.json(newUser[0]);
  } catch (error) {
    console.error('Failed to create user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminUsersRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role, password, permissions } = req.body;
    
    if (email) {
      const existing = await db.select().from(adminUser).where(eq(adminUser.email, email)).limit(1);
      if (existing.length > 0 && existing[0].id !== id) {
        return res.status(400).json({ error: 'Email already exists' });
      }
    }
    
    const updateData: any = { updatedAt: new Date() };
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (password) updateData.passwordHash = await bcrypt.hash(password, 10);
    
    await db.update(adminUser).set(updateData).where(eq(adminUser.id, id));
    
    // Update permissions
    if (role !== 'SUPER_ADMIN' && permissions) {
      await db.delete(userPermission).where(eq(userPermission.userId, id));
      
      const allPerms = await db.select().from(permission);
      const permMap = Object.fromEntries(allPerms.map(p => [p.name, p.id]));
      
      const insertData = permissions.map((pName: string) => ({
        userId: id,
        permissionId: permMap[pName]
      })).filter((p: any) => p.permissionId);
      
      if (insertData.length > 0) {
        await db.insert(userPermission).values(insertData);
      }
    } else if (role === 'SUPER_ADMIN') {
      await db.delete(userPermission).where(eq(userPermission.userId, id));
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to update user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminUsersRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(userPermission).where(eq(userPermission.userId, id));
    await db.delete(adminUser).where(eq(adminUser.id, id));
    return res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

adminUsersRouter.post('/:id/reset', async (req, res) => {
  // Mock sending reset email
  return res.json({ success: true });
});
