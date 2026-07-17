import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './lib/db';
import { job } from './db/schema';
import { desc, sql } from 'drizzle-orm';

import fs from 'fs';
import path from 'path';

// Support both local dev (../.env) and production deploy (.env is in same dir)
const envPath = fs.existsSync(path.join(__dirname, '.env')) 
  ? path.join(__dirname, '.env')
  : path.join(__dirname, '../../.env');

dotenv.config({ path: envPath });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

import cookieParser from 'cookie-parser';
import authRouter from './api/auth';
import { settingsRouter } from './api/settings';
import { dashboardRouter } from './api/dashboard';
import adminJobsRouter from './api/admin/jobs';
import { adminConversationsRouter } from './api/admin/conversations';
import { adminArticlesRouter } from './api/admin/articles';
import { adminEnquiriesRouter } from './api/admin/enquiries';
import { adminUsersRouter } from './api/admin/users';
import { adminNotificationsRouter } from './api/admin/notifications';
import { enquiriesRouter } from './api/enquiries';
import { chatRouter } from './api/chat';

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Public routes
app.use('/api/auth', authRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/enquiries', enquiriesRouter);
app.use('/api/chat', chatRouter);

// Protected Admin Routes
app.use('/api/admin/dashboard', dashboardRouter);
app.use('/api/admin/jobs', adminJobsRouter);
app.use('/api/admin/conversations', adminConversationsRouter);
app.use('/api/admin/articles', adminArticlesRouter);
app.use('/api/admin/enquiries', adminEnquiriesRouter);
app.use('/api/admin/users', adminUsersRouter);
app.use('/api/admin/notifications', adminNotificationsRouter);

// Endpoint: Get latest 3 active jobs for homepage
app.get('/api/jobs/latest', async (req, res) => {
  try {
    const { eq } = await import('drizzle-orm');
    const jobs = await db.select()
      .from(job)
      .where(eq(job.status, "ACTIVE"))
      .orderBy(desc(job.createdAt))
      .limit(3);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching latest jobs:', error);
    res.status(500).json({ error: 'Failed to fetch latest jobs' });
  }
});

// Example endpoint: Get all Jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await db.select().from(job).orderBy(desc(job.createdAt));
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Endpoint: Get all published articles
app.get('/api/articles', async (req, res) => {
  try {
    const { eq } = await import('drizzle-orm');
    const { article } = await import('./db/schema');
    const articles = await db.select()
      .from(article)
      .where(eq(article.isPublished, true))
      .orderBy(desc(article.createdAt));
    res.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// Health check endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', server: 'running' });
});

app.get('/api/health/database', async (req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Database connection failed'); // Do not log raw errors or connection strings
    res.status(503).json({ error: 'Database is temporarily unavailable' });
  }
});

// React SPA fallback: always serve index.html for non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Frontend not built yet. Please use the Vite dev server (usually http://localhost:5173) during development.');
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
