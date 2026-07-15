import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './lib/db';
import { job } from './db/schema';
import { desc } from 'drizzle-orm';

import path from 'path';

dotenv.config({ path: '../.env' });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

import cookieParser from 'cookie-parser';
import { settingsRouter } from './api/settings';
import authRouter from './api/auth';

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/settings', settingsRouter);

import adminJobsRouter from './api/admin/jobs';
app.use('/api/admin/jobs', adminJobsRouter);

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

// React SPA fallback: always serve index.html for non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
