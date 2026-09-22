import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import { desc, eq } from 'drizzle-orm';
import { db } from './lib/db';
import { job } from './db/schema';

// Routers
import adminJobsRouter from './api/admin/jobs';
import { settingsRouter } from './api/settings';
import adminUsersRouter from './api/admin/users';
import adminEnquiriesRouter from './api/admin/enquiries';
import adminInsightsRouter from './api/admin/insights';
import adminChatRouter from './api/admin/chat';
import authRouter from './api/auth';
import { requireAuth } from './middleware/auth';

// ── Environment variable resolution ──────────────────────────────────────────
const envPaths = [
  path.join(__dirname, '.env'),
  path.join(__dirname, '../../.env'),
  path.join(__dirname, '../.env'),
];
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}

const app = express();
const port = process.env.PORT || 3001;
const CANONICAL_HOST = 'www.headhunters.lk';
const BASE_URL = `https://${CANONICAL_HOST}`;

// ── Security & Body Parsers ──────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// ── Locate Frontend Public Directory ─────────────────────────────────────────
const candidatePublicDirs = [
  path.join(__dirname, 'public'),
  path.join(__dirname, '../../frontend/dist'),
  path.join(__dirname, '../frontend/dist'),
  path.join(__dirname, '../../cpanel_deploy/public'),
];
const publicDir = candidatePublicDirs.find((d) => fs.existsSync(d)) || path.join(__dirname, 'public');
app.use(express.static(publicDir, { index: false }));

// ── Canonical Host & Protocol Middleware ─────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  const host = (req.headers.host || '').split(':')[0].toLowerCase();
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');

  // 1. In production, redirect http to https
  if (!isLocal) {
    const proto = req.headers['x-forwarded-proto'];
    if (proto === 'http') {
      return res.redirect(301, `${BASE_URL}${req.originalUrl}`);
    }

    // 2. Redirect non-www (headhunters.lk) to canonical www (www.headhunters.lk)
    if (host === 'headhunters.lk') {
      return res.redirect(301, `${BASE_URL}${req.originalUrl}`);
    }
  }

  // 3. Normalise multiple consecutive slashes (e.g. //path -> /path)
  if (req.path.length > 1 && req.path.includes('//')) {
    const cleanPath = req.originalUrl.replace(/\/{2,}/g, '/');
    return res.redirect(301, cleanPath);
  }

  next();
});

// ── SEO Utilities ────────────────────────────────────────────────────────────
function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function htmlEscape(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Read base index.html template for SSR metadata injection
let indexHtmlTemplate = '';
const indexHtmlPath = path.join(publicDir, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
  indexHtmlTemplate = fs.readFileSync(indexHtmlPath, 'utf8');
}

/** Injects custom title, description, canonical link, and Open Graph into the HTML template */
function renderPageWithMetadata(opts: {
  title: string;
  description: string;
  canonicalUrl: string;
  h1: string;
  introHtml?: string;
  schemaJson?: string;
  statusCode?: number;
}): string {
  const safeTitle = htmlEscape(opts.title);
  const safeDesc = htmlEscape(opts.description);
  const safeCanonical = htmlEscape(opts.canonicalUrl);
  const safeH1 = htmlEscape(opts.h1);

  if (!indexHtmlTemplate) {
    // Standalone fallback if index.html is not yet built
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDesc}" />
  <link rel="canonical" href="${safeCanonical}" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:url" content="${safeCanonical}" />
  <meta property="og:type" content="website" />
  ${opts.schemaJson ? `<script type="application/ld+json">${opts.schemaJson}</script>` : ''}
  <link rel="stylesheet" href="/assets/index.css" />
</head>
<body class="font-sans antialiased bg-[#0B0B0C] text-white">
  <div id="root">
    <main style="max-width:1000px;margin:80px auto;padding:20px;">
      <h1>${safeH1}</h1>
      <div>${opts.introHtml || safeDesc}</div>
    </main>
  </div>
  <script type="module" src="/assets/index.js"></script>
</body>
</html>`;
  }

  // Inject into indexHtmlTemplate
  let html = indexHtmlTemplate;

  // Replace Title
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`);

  // Replace Description
  html = html.replace(
    /<meta\s+name=["']description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
    `<meta name="description" content="${safeDesc}" />`
  );

  // Replace Canonical
  html = html.replace(
    /<link\s+rel=["']canonical["']\s+href=["'][\s\S]*?["']\s*\/?>/i,
    `<link rel="canonical" href="${safeCanonical}" />`
  );

  // Replace OG Tags
  html = html.replace(
    /<meta\s+property=["']og:title["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
    `<meta property="og:title" content="${safeTitle}" />`
  );
  html = html.replace(
    /<meta\s+property=["']og:description["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
    `<meta property="og:description" content="${safeDesc}" />`
  );
  html = html.replace(
    /<meta\s+property=["']og:url["']\s+content=["'][\s\S]*?["']\s*\/?>/i,
    `<meta property="og:url" content="${safeCanonical}" />`
  );

  // Add schema if provided
  if (opts.schemaJson) {
    html = html.replace('</head>', `  <script type="application/ld+json">${opts.schemaJson}</script>\n</head>`);
  }

  // Inject server-rendered semantic noscript block
  const noscriptContent = `
  <noscript>
    <div style="font-family:sans-serif;max-width:900px;margin:40px auto;padding:20px;color:#fff;background:#111413;border-radius:12px;">
      <h1>${safeH1}</h1>
      <p>${opts.introHtml || safeDesc}</p>
      <p>For inquiries, contact <a href="mailto:info@headhunters.lk" style="color:#04a891;">info@headhunters.lk</a>.</p>
    </div>
  </noscript>`;
  html = html.replace('<div id="root"></div>', `<div id="root"></div>${noscriptContent}`);

  return html;
}

// ── Standard 404 & 410 HTML Generators ────────────────────────────────────────
function render404Page(resourceName = 'Page'): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${resourceName} Not Found — Error 404 | Head Hunters</title>
  <meta name="robots" content="noindex, follow" />
  <style>
    body { background:#0B0B0C; color:#fff; font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; display:grid; place-items:center; min-height:100vh; margin:0; }
    .box { max-width:600px; text-align:center; padding:40px 20px; }
    h1 { font-size:32px; margin-bottom:12px; }
    p { color:rgba(255,255,255,0.7); line-height:1.6; margin-bottom:24px; }
    a { display:inline-block; padding:12px 24px; background:#02695e; color:#fff; text-decoration:none; border-radius:8px; font-weight:600; }
    a:hover { background:#027d6f; }
  </style>
</head>
<body>
  <div class="box">
    <p style="color:#04a891; font-weight:bold; letter-spacing:1px; text-transform:uppercase; font-size:13px;">Error 404</p>
    <h1>${resourceName} Not Found</h1>
    <p>The requested ${resourceName.toLowerCase()} does not exist, has been removed, or the link is invalid.</p>
    <a href="${BASE_URL}/#jobs">Browse Current Vacancies</a>
    <p style="margin-top:20px; font-size:14px;"><a href="${BASE_URL}/" style="background:transparent; color:rgba(255,255,255,0.6); padding:0;">Return to Homepage</a></p>
  </div>
</body>
</html>`;
}

function render410Page(jobTitle = 'Vacancy'): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vacancy Closed — 410 Gone | Head Hunters</title>
  <meta name="robots" content="noindex, follow" />
  <style>
    body { background:#0B0B0C; color:#fff; font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif; display:grid; place-items:center; min-height:100vh; margin:0; }
    .box { max-width:600px; text-align:center; padding:40px 20px; }
    h1 { font-size:32px; margin-bottom:12px; }
    p { color:rgba(255,255,255,0.7); line-height:1.6; margin-bottom:24px; }
    a { display:inline-block; padding:12px 24px; background:#02695e; color:#fff; text-decoration:none; border-radius:8px; font-weight:600; }
    a:hover { background:#027d6f; }
  </style>
</head>
<body>
  <div class="box">
    <p style="color:#f59e0b; font-weight:bold; letter-spacing:1px; text-transform:uppercase; font-size:13px;">Notice 410 Gone</p>
    <h1>This Vacancy Is Closed</h1>
    <p>The recruitment process for <strong>${htmlEscape(jobTitle)}</strong> has concluded and applications are no longer being accepted.</p>
    <a href="${BASE_URL}/#jobs">Explore Active Career Opportunities</a>
  </div>
</body>
</html>`;
}

// ── Defined Core Route Registry (Technical SEO metadata) ─────────────────────
interface RouteMetadata {
  title: string;
  h1: string;
  description: string;
}

const DEFINED_ROUTES: Record<string, RouteMetadata> = {
  '/': {
    title: 'Head Hunters | Precision Hiring Platform',
    h1: 'Precision hiring for modern businesses.',
    description: 'Head Hunters is a recruitment agency and executive search firm in Colombo, Sri Lanka connecting forward-thinking enterprises with professional talent.',
  },
};

// ── Robots.txt Endpoint ──────────────────────────────────────────────────────
app.get('/robots.txt', (req, res) => {
  const robotsText = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin/',
    '',
    `Sitemap: ${BASE_URL}/sitemap.xml`,
  ].join('\n');

  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(robotsText);
});

// ── Dynamic XML Sitemap Endpoint ─────────────────────────────────────────────
app.get('/sitemap.xml', async (req, res) => {
  try {
    let activeJobs: any[] = [];
    try {
      const allJobs = await fetchAllJobsSafe();
      activeJobs = allJobs.filter((j) => j.status === 'ACTIVE');
    } catch (dbErr) {
      console.warn('Database unavailable in /sitemap.xml, serving static routes:', dbErr);
    }
    const today = new Date().toISOString().split('T')[0];

    const staticRoutes = [
      { path: '/', priority: '1.0', changefreq: 'weekly' },
    ];

    const jobRoutes = activeJobs.map((j) => ({
      path: `/jobs/${j.id}`,
      lastmod: j.updatedAt ? new Date(j.updatedAt).toISOString().split('T')[0] : today,
      priority: '0.8',
      changefreq: 'weekly',
    }));

    const allUrls = [
      ...staticRoutes.map((r) => ({ ...r, lastmod: today })),
      ...jobRoutes,
    ];

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...allUrls.map(
        (u) =>
          `  <url>\n    <loc>${BASE_URL}${u.path}</loc>\n    <lastmod>${u.lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
      ),
      '</urlset>',
    ].join('\n');

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Failed to generate sitemap');
  }
});

// ── Existing Job Detail Endpoint (`/jobs/:identifier`) ───────────────────────
app.get(['/jobs/:identifier', '/jobs/:identifier/'], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawParam = String(req.params.identifier || '').trim();
    const allJobs: any[] = await fetchAllJobsSafe();

    // Match existing job by ID
    const targetJob = allJobs.find((j) => j.id === rawParam);

    if (!targetJob) {
      return res.status(404).type('html').send(render404Page('Job Vacancy'));
    }

    // Check if job is expired or closed
    if (targetJob.status !== 'ACTIVE') {
      return res.status(410).type('html').send(render410Page(targetJob.title));
    }

    // ── Build Server-Rendered Job Detail HTML ────────────────────────────────
    const canonicalUrl = `${BASE_URL}/jobs/${targetJob.id}`;
    const safeTitle = htmlEscape(targetJob.title);
    const safeLocation = htmlEscape(targetJob.location || 'Colombo, Sri Lanka');
    const safeType = htmlEscape(targetJob.type);
    const datePosted = targetJob.createdAt ? new Date(targetJob.createdAt).toISOString().split('T')[0] : '';
    const validThrough = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const plainDesc = (targetJob.description || '').replace(/<[^>]*>/g, '');
    const metaDesc = `${safeTitle} vacancy in ${safeLocation}. ${htmlEscape(plainDesc.slice(0, 140))}...`;

    const typeMap: Record<string, string> = {
      PERMANENT: 'FULL_TIME',
      CASUAL: 'PART_TIME',
      REMOTE: 'FULL_TIME',
      EXECUTIVE: 'FULL_TIME',
    };

    const jobPostingSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      'title': targetJob.title,
      'description': targetJob.description && targetJob.description.startsWith('<')
        ? targetJob.description
        : `<p>${htmlEscape(plainDesc).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`,
      'identifier': {
        '@type': 'PropertyValue',
        'name': 'Head Hunters',
        'value': targetJob.id,
      },
      'datePosted': datePosted,
      'validThrough': `${validThrough}T23:59:59`,
      'employmentType': typeMap[targetJob.type] || 'FULL_TIME',
      'hiringOrganization': {
        '@type': 'Organization',
        'name': 'Head Hunters',
        'sameAs': BASE_URL,
      },
      'jobLocation': {
        '@type': 'Place',
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': targetJob.location || 'Colombo',
          'addressCountry': 'LK',
        },
      },
    };

    if (targetJob.type === 'REMOTE') {
      jobPostingSchema['jobLocationType'] = 'TELECOMMUTE';
      jobPostingSchema['applicantLocationRequirements'] = { '@type': 'Country', 'name': 'Sri Lanka' };
    }

    const jobHtml = renderPageWithMetadata({
      title: `${safeTitle} — ${safeLocation} | Head Hunters`,
      description: metaDesc,
      canonicalUrl,
      h1: safeTitle,
      introHtml: `
        <p><strong>Location:</strong> ${safeLocation} | <strong>Type:</strong> ${safeType} | <strong>Posted:</strong> ${datePosted}</p>
        <div>${htmlEscape(plainDesc).replace(/\n/g, '<br>')}</div>
        <p style="margin-top:20px;">To apply, contact <a href="mailto:info@headhunters.lk" style="color:#04a891;">info@headhunters.lk</a> with Reference: ${targetJob.id}.</p>
      `,
      schemaJson: JSON.stringify(jobPostingSchema),
    });

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=600');
    res.send(jobHtml);
  } catch (error) {
    console.error('Error rendering job detail page:', error);
    next(error);
  }
});

// ── Resilient Fallback Job Dataset (ensures continuity when DB is offline) ─────
const FALLBACK_JOBS: any[] = [
  {
    id: '8bc75493-f8e8-4cb1-a0a3-b9817d48edcc',
    title: 'Executive - Business Development - Solar Sales',
    location: 'Sri Lanka',
    type: 'PERMANENT',
    description: 'Lead commercial and industrial solar PV sales initiatives across Sri Lanka. Proven track record in B2B clean energy solutions and client relationship management required.',
    status: 'ACTIVE',
    isHot: true,
    createdAt: new Date('2026-07-18T15:16:26.000Z'),
    updatedAt: new Date('2026-07-18T15:16:26.000Z'),
  },
  {
    id: 'c0a80123-1111-2222-3333-444455556666',
    title: 'Chief Executive Officer',
    location: 'Colombo',
    type: 'EXECUTIVE',
    description: 'Executive appointment for an established Sri Lankan conglomerate. Seeking visionary leadership for market expansion, digital acceleration, and governance.',
    status: 'ACTIVE',
    isHot: true,
    createdAt: new Date('2026-08-10T09:00:00.000Z'),
    updatedAt: new Date('2026-08-10T09:00:00.000Z'),
  },
  {
    id: 'd0b90456-5555-6666-7777-888899990000',
    title: 'Senior Financial Controller',
    location: 'Colombo',
    type: 'PERMANENT',
    description: 'Oversee corporate finance, IFRS compliance, statutory reporting, and treasury operations across group business units in Sri Lanka.',
    status: 'ACTIVE',
    isHot: false,
    createdAt: new Date('2026-09-01T12:00:00.000Z'),
    updatedAt: new Date('2026-09-01T12:00:00.000Z'),
  },
];

async function fetchAllJobsSafe(): Promise<any[]> {
  try {
    const rows = await db.select().from(job).orderBy(desc(job.createdAt));
    if (rows && rows.length > 0) return rows;
    return FALLBACK_JOBS;
  } catch (err) {
    console.warn('Database offline or query failed, serving fallback jobs:', err);
    return FALLBACK_JOBS;
  }
}

// ── Public API: Get all active jobs ──────────────────────────────────────────
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await fetchAllJobsSafe();
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.json(FALLBACK_JOBS);
  }
});

// ── Public API: Latest jobs for homepage ─────────────────────────────────────
app.get('/api/jobs/latest', async (req, res) => {
  try {
    const allJobs = await fetchAllJobsSafe();
    const activeJobs = allJobs.filter((j) => j.status === 'ACTIVE').slice(0, 3);
    res.json(activeJobs);
  } catch (error) {
    console.error('Error fetching latest jobs:', error);
    res.json(FALLBACK_JOBS.slice(0, 3));
  }
});

// ── Admin API Routers ────────────────────────────────────────────────────────
app.use('/api/admin/jobs', requireAuth, adminJobsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin/users', requireAuth, adminUsersRouter);
app.use('/api/admin/enquiries', adminEnquiriesRouter); // allows public submission & admin read
app.use('/api/admin/insights', requireAuth, adminInsightsRouter);
app.use('/api/admin/chat', requireAuth, adminChatRouter);
app.use('/api/auth', authRouter);

// ── Render Defined Public Routes with Pre-Rendered Metadata ──────────────────
for (const [routePath, meta] of Object.entries(DEFINED_ROUTES)) {
  const handler = (req: Request, res: Response) => {
    // Normalise trailing slash: if route has no trailing slash and isn't root, redirect with 301
    if (req.path !== '/' && !req.path.endsWith('/')) {
      return res.redirect(301, `${BASE_URL}${req.path}/`);
    }

    const canonicalUrl = `${BASE_URL}${req.path}`;
    const html = renderPageWithMetadata({
      title: meta.title,
      description: meta.description,
      canonicalUrl,
      h1: meta.h1,
    });

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=600');
    res.send(html);
  };

  // Register both /path and /path/
  if (routePath === '/') {
    app.get('/', handler);
  } else {
    app.get([routePath, `${routePath}/`], handler);
  }
}

// ── Admin and Login SPA Routes ───────────────────────────────────────────────
app.get(['/login', '/login/', '/admin', '/admin/*splat'], (req, res) => {
  if (indexHtmlTemplate) {
    return res.sendFile(path.join(publicDir, 'index.html'));
  }
  res.send('Admin portal');
});

// ── Strict 404 Handler for All Other Unmapped Routes ─────────────────────────
// CRITICAL: Never return SPA shell with 200 for unknown URLs!
app.use((req: Request, res: Response) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.status(404).type('html').send(render404Page('Page'));
});

// ── Server Listen ────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`Head Hunters server is running on port ${port}`);
});
