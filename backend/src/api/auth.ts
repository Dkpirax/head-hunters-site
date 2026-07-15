import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../lib/db';
import { adminUser } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const users = await db.select().from(adminUser).where(eq(adminUser.email, email)).limit(1);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, users[0].passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email, role: users[0].role },
      process.env.AUTH_SECRET || 'fallback-secret',
      { expiresIn: '1d' }
    );

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  return res.json({ success: true });
});

router.get('/session', (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) return res.json({ user: null });

  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET || 'fallback-secret');
    return res.json({ user: decoded });
  } catch (err) {
    return res.json({ user: null });
  }
});

export default router;
