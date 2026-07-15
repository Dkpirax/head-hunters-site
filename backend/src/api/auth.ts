import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (email !== adminEmail) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValidPassword = await bcrypt.compare(password, adminPasswordHash || '');

  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { email: adminEmail, role: 'admin' },
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
