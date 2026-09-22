import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './lib/db';
import { job } from './db/schema';
import { desc, eq } from 'drizzle-orm';

import path from 'path';

import fs from 'fs';
const envPaths = [
  path.join(__dirname, '.env'),           // cPanel deploy (index.js at root)
  path.join(__dirname, '../../.env'),     // local dev (backend/src -> project root)
  path.join(__dirname, '../.env')         // fallback
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
  }
}
if (!envLoaded) {
  dotenv.config(); // fallback to current working directory
}

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

import cookieParser from 'cookie-parser';
import adminJobsRouter from "./api/admin/jobs";
import { settingsRouter } from './api/settings';
import adminUsersRouter from "./api/admin/users";
import adminEnquiriesRouter from "./api/admin/enquiries";
import adminInsightsRouter from "./api/admin/insights";
import adminChatRouter from "./api/admin/chat";
import authRouter from './api/auth';
import { requireAuth } from './middleware/auth';

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use("/api/admin/jobs", requireAuth, adminJobsRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/admin/users", requireAuth, adminUsersRouter);
app.use("/api/admin/enquiries", requireAuth, adminEnquiriesRouter);
app.use("/api/admin/insights", requireAuth, adminInsightsRouter);
app.use("/api/admin/chat", requireAuth, adminChatRouter);

app.use('/api/auth', authRouter);

// Endpoint: Get latest 3 active jobs for homepage
app.get('/api/jobs/latest', async (req, res) => {
  try {

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

// ── SEO: Slug utility ────────────────────────────────────────────────────────
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ── SEO: Dynamic XML sitemap ──────────────────────────────────────────────────
app.get('/sitemap.xml', async (req, res) => {
  try {
    const activeJobs = await db.select().from(job).where(eq(job.status, 'ACTIVE'));
    const baseUrl = 'https://www.headhunters.lk';
    const today = new Date().toISOString().split('T')[0];

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/jobs/', priority: '0.9', changefreq: 'daily' },
      { url: '/employers/', priority: '0.8', changefreq: 'monthly' },
      { url: '/candidates/', priority: '0.8', changefreq: 'monthly' },
      { url: '/recruitment-agency-sri-lanka/', priority: '0.9', changefreq: 'monthly' },
      { url: '/executive-search-sri-lanka/', priority: '0.9', changefreq: 'monthly' },
      { url: '/permanent-recruitment-sri-lanka/', priority: '0.8', changefreq: 'monthly' },
      { url: '/confidential-recruitment/', priority: '0.8', changefreq: 'monthly' },
      { url: '/about/', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact/', priority: '0.7', changefreq: 'monthly' },
    ];

    const jobUrls = activeJobs.map(j => {
      const slug = j.slug || toSlug(j.title) + '-' + j.id.slice(-6);
      return {
        url: `/jobs/${slug}/`,
        lastmod: j.updatedAt ? j.updatedAt.toISOString().split('T')[0] : today,
        priority: '0.8',
        changefreq: 'weekly',
      };
    });

    const allUrls = [
      ...staticPages.map(p => ({ ...p, lastmod: today })),
      ...jobUrls,
    ];

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...allUrls.map(u =>
        `  <url>\n    <loc>${baseUrl}${u.url}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
      ),
      '</urlset>',
    ].join('\n');

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Failed to generate sitemap');
  }
});

// ── SEO: Job detail — server-rendered HTML with JobPosting schema ─────────────
// This is what Googlebot and OAI-SearchBot actually read. The React SPA
// handles the user-facing UI, but this endpoint ensures crawlers can index
// individual vacancies and trigger Google Jobs rich results.
app.get('/jobs/:slug', async (req, res, next) => {
  // Skip admin and API sub-paths
  if (req.path.includes('/api/') || req.path.includes('/admin/')) {
    return next();
  }
  try {
    const slugParam = req.params.slug;
    const baseUrl = 'https://www.headhunters.lk';

    // Find by explicit slug field first, then fallback to id-based slug
    const jobs = await db.select().from(job).where(eq(job.status, 'ACTIVE'));
    const found = jobs.find(
      j => j.slug === slugParam || (toSlug(j.title) + '-' + j.id.slice(-6)) === slugParam
    );

    if (!found) {
      // Return 404 for unknown job slugs — do NOT fall through to SPA
      return res.status(404).send(`<!doctype html><html lang="en"><head><title>Job Not Found | Head Hunters</title><meta name="robots" content="noindex"/></head><body><h1>Job Not Found</h1><p>This vacancy may have been filled or closed. <a href="${baseUrl}/jobs/">View current vacancies</a>.</p></body></html>`);
    }

    // Closed/expired jobs: serve 410 Gone
    if (found.status !== 'ACTIVE') {
      return res.status(410).send(`<!doctype html><html lang="en"><head><title>Vacancy Closed | Head Hunters</title><meta name="robots" content="noindex"/></head><body><h1>This Vacancy Is Closed</h1><p><a href="${baseUrl}/jobs/">View current vacancies</a>.</p></body></html>`);
    }

    const jobSlug = found.slug || toSlug(found.title) + '-' + found.id.slice(-6);
    const jobUrl = `${baseUrl}/jobs/${jobSlug}/`;
    const datePosted = found.createdAt.toISOString().split('T')[0];
    const validThrough = found.closingDate
      ? found.closingDate.toISOString().split('T')[0]
      : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 60 days default

    const typeMap: Record<string, string> = {
      PERMANENT: 'FULL_TIME',
      CASUAL: 'PART_TIME',
      REMOTE: 'FULL_TIME',
      EXECUTIVE: 'FULL_TIME',
    };
    const employmentType = typeMap[found.type] || 'FULL_TIME';
    const hiringOrgName = found.isConfidential ? 'Confidential' : 'Head Hunters';

    const jobPostingSchema = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      'title': found.title,
      'description': `<p>${found.description.replace(/\n/g, '</p><p>')}</p>`,
      'identifier': { '@type': 'PropertyValue', 'name': 'Head Hunters', 'value': found.id },
      'datePosted': datePosted,
      'validThrough': validThrough,
      'employmentType': employmentType,
      'hiringOrganization': {
        '@type': 'Organization',
        'name': hiringOrgName,
        'sameAs': baseUrl,
      },
      'jobLocation': {
        '@type': 'Place',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': found.location || 'Colombo',
          'addressCountry': 'LK',
        },
      },
      ...(found.type === 'REMOTE' ? { 'jobLocationType': 'TELECOMMUTE', 'applicantLocationRequirements': { '@type': 'Country', 'name': 'Sri Lanka' } } : {}),
      ...(found.salaryRange ? { 'baseSalary': { '@type': 'MonetaryAmount', 'currency': 'LKR', 'value': { '@type': 'QuantitativeValue', 'value': found.salaryRange, 'unitText': 'MONTH' } } } : {}),
    };

    const pageTitle = `${found.title} — ${found.location} | Head Hunters`;
    const metaDesc = `${found.title} vacancy in ${found.location}. ${found.description.slice(0, 140)}...`;

    // Serve minimal server-rendered HTML for crawlers.
    // The React SPA will hydrate over this on the client once JS loads.
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${pageTitle.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</title>
  <meta name="description" content="${metaDesc.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="${jobUrl}" />
  <meta property="og:title" content="${pageTitle.replace(/"/g, '&quot;')}" />
  <meta property="og:description" content="${metaDesc.replace(/"/g, '&quot;').slice(0, 160)}" />
  <meta property="og:url" content="${jobUrl}" />
  <meta property="og:type" content="website" />
  <script type="application/ld+json">${JSON.stringify(jobPostingSchema)}</script>
  <link rel="stylesheet" href="/assets/index.css" />
</head>
<body>
  <noscript>
    <div style="font-family:sans-serif;max-width:700px;margin:40px auto;padding:20px">
      <h1>${found.title.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h1>
      <p><strong>Location:</strong> ${found.location.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
      <p><strong>Type:</strong> ${found.type}</p>
      <p><strong>Posted:</strong> ${datePosted}</p>
      <div>${found.description.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')}</div>
      <p>To apply, email <a href="mailto:info@headhunters.lk">info@headhunters.lk</a> with the job title in the subject line.</p>
    </div>
  </noscript>
  <div id="root"></div>
  <script type="module" src="/assets/index.js"></script>
</body>
</html>`;

    res.set('Content-Type', 'text/html');
    res.set('Cache-Control', 'public, max-age=600'); // 10 min cache
    res.send(html);
  } catch (error) {
    console.error('Error rendering job page:', error);
    next(); // Fall through to SPA
  }
});

// ── Public API: Get a single job by slug (for React SPA) ──────────────────────
app.get('/api/jobs/by-slug/:slug', async (req, res) => {
  try {
    const slugParam = req.params.slug;
    const jobs = await db.select().from(job).where(eq(job.status, 'ACTIVE'));
    const found = jobs.find(
      j => j.slug === slugParam || (toSlug(j.title) + '-' + j.id.slice(-6)) === slugParam
    );
    if (!found) return res.status(404).json({ error: 'Job not found' });
    res.json(found);
  } catch (error) {
    console.error('Error fetching job by slug:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
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
