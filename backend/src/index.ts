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
    <a href="${BASE_URL}/jobs/">Browse Current Vacancies</a>
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
    <a href="${BASE_URL}/jobs/">Explore Active Career Opportunities</a>
  </div>
</body>
</html>`;
}

// ── Defined Commercial & Core Route Registry ─────────────────────────────────
interface RouteMetadata {
  title: string;
  h1: string;
  description: string;
}

const DEFINED_ROUTES: Record<string, RouteMetadata> = {
  '/': {
    title: 'Head Hunters | Recruitment & Executive Search Sri Lanka',
    h1: 'Recruitment and Executive Search in Sri Lanka',
    description: 'Head Hunters is a leading recruitment agency and executive search consultancy in Sri Lanka. Connecting forward-thinking enterprises with exceptional leadership and professional talent across Colombo.',
  },
  '/employers': {
    title: 'Recruitment Services for Employers | Head Hunters Sri Lanka',
    h1: 'Find the Right People for Critical Roles',
    description: 'Comprehensive recruitment, headhunting, and staffing solutions for Sri Lankan employers and multinational organizations in Colombo.',
  },
  '/executive-search-sri-lanka': {
    title: 'Executive Search Sri Lanka | Head Hunters',
    h1: 'Executive Search for Senior and Leadership Roles',
    description: 'Retained executive search firm in Colombo. Identifying, assessing, and securing transformational CEOs, directors, and functional leaders across Sri Lanka.',
  },
  '/confidential-recruitment-sri-lanka': {
    title: 'Confidential Recruitment Sri Lanka | Head Hunters',
    h1: 'Confidential Recruitment for Sensitive Appointments',
    description: 'Discreet, NDA-protected executive search for sensitive leadership succession, incumbent replacement, and unannounced expansion in Sri Lanka.',
  },
  '/ceo-recruitment-sri-lanka': {
    title: 'CEO Recruitment Sri Lanka | Head Hunters',
    h1: 'CEO and C-Suite Recruitment',
    description: 'Appointing visionary Chief Executive Officers, Managing Directors, and board leadership for Sri Lankan corporations and conglomerates.',
  },
  '/finance-recruitment-sri-lanka': {
    title: 'Finance & Accounting Recruitment Sri Lanka | Head Hunters',
    h1: 'Finance and Accounting Recruitment',
    description: 'Specialized recruitment for Chief Financial Officers, Financial Controllers, Treasury Managers, and senior chartered accountants across Sri Lanka.',
  },
  '/internal-audit-recruitment-sri-lanka': {
    title: 'Internal Audit Recruitment Sri Lanka | Head Hunters',
    h1: 'Internal Audit Recruitment',
    description: 'Connecting boards and audit committees with Heads of Internal Audit, Risk Managers, and Compliance Directors in Colombo and nationwide.',
  },
  '/legal-recruitment-sri-lanka': {
    title: 'Legal Recruitment Sri Lanka | Head Hunters',
    h1: 'Legal Recruitment',
    description: 'Placing General Counsels, In-House Legal Officers, and corporate legal specialists with leading enterprises and firms across Sri Lanka.',
  },
  '/hr-recruitment-sri-lanka': {
    title: 'HR Recruitment Sri Lanka | Head Hunters',
    h1: 'HR Recruitment',
    description: 'Strategic recruitment for Chief People Officers, HR Directors, Talent Acquisition heads, and industrial relations specialists in Sri Lanka.',
  },
  '/fmcg-recruitment-sri-lanka': {
    title: 'FMCG Recruitment Sri Lanka | Head Hunters',
    h1: 'FMCG and Manufacturing Recruitment',
    description: 'Securing plant directors, supply chain leaders, and national sales managers for Sri Lanka’s FMCG and industrial manufacturing sectors.',
  },
  '/candidates': {
    title: 'Find Recruitment Opportunities | Head Hunters Sri Lanka',
    h1: 'Explore Career Opportunities',
    description: 'Take the next step in your professional career. Submit your confidential CV to Head Hunters Sri Lanka to be matched against premier leadership roles.',
  },
  '/jobs': {
    title: 'Current Job Vacancies in Sri Lanka | Head Hunters',
    h1: 'Current Opportunities',
    description: 'Browse active executive, management, and professional vacancies in Colombo and across Sri Lanka. Apply confidentially with Head Hunters.',
  },
  '/contact': {
    title: 'Contact Head Hunters Sri Lanka',
    h1: 'Talk to Our Recruitment Team',
    description: 'Contact our executive search and recruitment consultants in Colombo, Sri Lanka. Submit an employer hiring brief or general inquiry.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Head Hunters Sri Lanka',
    h1: 'Privacy Policy',
    description: 'Head Hunters Sri Lanka privacy policy regarding client non-disclosure, candidate data protection, and executive recruitment ethics.',
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
      activeJobs = await db.select().from(job).where(eq(job.status, 'ACTIVE'));
    } catch (dbErr) {
      console.warn('Database unavailable in /sitemap.xml, serving static routes:', dbErr);
    }
    const today = new Date().toISOString().split('T')[0];

    const staticRoutes = [
      { path: '/', priority: '1.0', changefreq: 'weekly' },
      { path: '/employers/', priority: '0.9', changefreq: 'weekly' },
      { path: '/executive-search-sri-lanka/', priority: '0.9', changefreq: 'monthly' },
      { path: '/confidential-recruitment-sri-lanka/', priority: '0.9', changefreq: 'monthly' },
      { path: '/ceo-recruitment-sri-lanka/', priority: '0.8', changefreq: 'monthly' },
      { path: '/finance-recruitment-sri-lanka/', priority: '0.8', changefreq: 'monthly' },
      { path: '/internal-audit-recruitment-sri-lanka/', priority: '0.8', changefreq: 'monthly' },
      { path: '/legal-recruitment-sri-lanka/', priority: '0.8', changefreq: 'monthly' },
      { path: '/hr-recruitment-sri-lanka/', priority: '0.8', changefreq: 'monthly' },
      { path: '/fmcg-recruitment-sri-lanka/', priority: '0.8', changefreq: 'monthly' },
      { path: '/candidates/', priority: '0.8', changefreq: 'weekly' },
      { path: '/jobs/', priority: '0.9', changefreq: 'daily' },
      { path: '/contact/', priority: '0.8', changefreq: 'monthly' },
      { path: '/privacy-policy/', priority: '0.5', changefreq: 'yearly' },
    ];

    const jobRoutes = activeJobs.map((j) => {
      const canonicalSlug = `${toSlug(j.title)}--${j.id}`;
      return {
        path: `/jobs/${canonicalSlug}`,
        lastmod: j.updatedAt ? j.updatedAt.toISOString().split('T')[0] : today,
        priority: '0.8',
        changefreq: 'weekly',
      };
    });

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

// ── Canonical Job Detail Endpoint (`/jobs/:identifier`) ──────────────────────
app.get(['/jobs/:identifier', '/jobs/:identifier/'], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawParam = String(req.params.identifier || '');
    let allJobs: any[] = [];
    try {
      allJobs = await db.select().from(job);
    } catch (dbErr) {
      console.error('Database unavailable in /jobs/:identifier:', dbErr);
      return res.status(503).type('html').send(render404Page('Job Service Temporarily Unavailable'));
    }

    let targetJob: any = null;

    // Pattern 1: Canonical /jobs/[title-slug]--[uuid]
    if (rawParam.includes('--')) {
      const parts = rawParam.split('--');
      const uuidPart = parts[parts.length - 1];
      targetJob = allJobs.find((j) => j.id === uuidPart);

      if (!targetJob) {
        return res.status(404).type('html').send(render404Page('Job Vacancy'));
      }

      // Check if job is expired/closed
      if (targetJob.status !== 'ACTIVE') {
        return res.status(410).type('html').send(render410Page(targetJob.title));
      }

      // Ensure slug matches expected title slug
      const expectedSlug = `${toSlug(targetJob.title)}--${targetJob.id}`;
      if (rawParam !== expectedSlug) {
        return res.redirect(301, `${BASE_URL}/jobs/${expectedSlug}`);
      }
    }
    // Pattern 2: Legacy UUID /jobs/[uuid]
    else if (UUID_RE.test(rawParam)) {
      targetJob = allJobs.find((j) => j.id === rawParam);

      if (!targetJob) {
        return res.status(404).type('html').send(render404Page('Job Vacancy'));
      }

      if (targetJob.status !== 'ACTIVE') {
        return res.status(410).type('html').send(render410Page(targetJob.title));
      }

      // Permanent 301 Redirect from legacy UUID URL to canonical format
      const canonicalSlug = `${toSlug(targetJob.title)}--${targetJob.id}`;
      return res.redirect(301, `${BASE_URL}/jobs/${canonicalSlug}`);
    }
    // Pattern 3: Old slug format or custom query
    else {
      targetJob = allJobs.find((j) => j.slug === rawParam || toSlug(j.title) === rawParam);
      if (targetJob) {
        if (targetJob.status !== 'ACTIVE') {
          return res.status(410).type('html').send(render410Page(targetJob.title));
        }
        const canonicalSlug = `${toSlug(targetJob.title)}--${targetJob.id}`;
        return res.redirect(301, `${BASE_URL}/jobs/${canonicalSlug}`);
      }
      return res.status(404).type('html').send(render404Page('Job Vacancy'));
    }

    // ── Build Server-Rendered Job Detail HTML ────────────────────────────────
    const canonicalUrl = `${BASE_URL}/jobs/${toSlug(targetJob.title)}--${targetJob.id}`;
    const safeTitle = htmlEscape(targetJob.title);
    const safeLocation = htmlEscape(targetJob.location || 'Colombo, Sri Lanka');
    const safeType = htmlEscape(targetJob.type);
    const datePosted = targetJob.createdAt ? targetJob.createdAt.toISOString().split('T')[0] : '';
    const validThrough = targetJob.closingDate
      ? targetJob.closingDate.toISOString().split('T')[0]
      : new Date(targetJob.createdAt.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const plainDesc = targetJob.description.replace(/<[^>]*>/g, '');
    const metaDesc = `${safeTitle} vacancy in ${safeLocation}. ${htmlEscape(plainDesc.slice(0, 140))}...`;

    // JobPosting Schema per Google Search Central Guidelines
    const hiringOrg = targetJob.isConfidential
      ? {
          '@type': 'Organization',
          'name': 'confidential', // Google official requirement for anonymous employers
        }
      : {
          '@type': 'Organization',
          'name': 'Head Hunters',
          'sameAs': BASE_URL,
        };

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
      'description': targetJob.description.startsWith('<')
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
      'hiringOrganization': hiringOrg,
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

    if (targetJob.salaryRange && targetJob.salaryRange.trim()) {
      jobPostingSchema['baseSalary'] = {
        '@type': 'MonetaryAmount',
        'currency': 'LKR',
        'value': {
          '@type': 'QuantitativeValue',
          'value': targetJob.salaryRange,
          'unitText': 'MONTH',
        },
      };
    }

    const jobHtml = renderPageWithMetadata({
      title: `${safeTitle} — ${safeLocation} | Head Hunters`,
      description: metaDesc,
      canonicalUrl,
      h1: safeTitle,
      introHtml: `
        <p><strong>Location:</strong> ${safeLocation} | <strong>Type:</strong> ${safeType} | <strong>Posted:</strong> ${datePosted}</p>
        <div>${htmlEscape(plainDesc).replace(/\n/g, '<br>')}</div>
        <p style="margin-top:20px;">To apply confidentially, email <a href="mailto:info@headhunters.lk" style="color:#04a891;">info@headhunters.lk</a> with Ref: ${targetJob.id}.</p>
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

// ── Public API: Get single job by slug or ID (for React SPA) ─────────────────
app.get('/api/jobs/by-slug/:slug', async (req, res) => {
  try {
    const rawParam = String(req.params.slug || '');
    const id = rawParam.includes('--') ? rawParam.split('--').pop() : rawParam;
    const allJobs = await db.select().from(job);
    const found = allJobs.find(
      (j) => j.id === id || j.slug === rawParam || j.id === rawParam
    );

    if (!found) return res.status(404).json({ error: 'Job not found' });
    if (found.status !== 'ACTIVE') return res.status(410).json({ error: 'Job is closed or expired' });

    res.json(found);
  } catch (error) {
    console.error('Error in /api/jobs/by-slug:', error);
    res.status(500).json({ error: 'Failed to retrieve job' });
  }
});

// ── Public API: Get all active jobs ──────────────────────────────────────────
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await db.select().from(job).orderBy(desc(job.createdAt));
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// ── Public API: Latest jobs for homepage ─────────────────────────────────────
app.get('/api/jobs/latest', async (req, res) => {
  try {
    const jobs = await db
      .select()
      .from(job)
      .where(eq(job.status, 'ACTIVE'))
      .orderBy(desc(job.createdAt))
      .limit(3);
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching latest jobs:', error);
    res.status(500).json({ error: 'Failed to fetch latest jobs' });
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
