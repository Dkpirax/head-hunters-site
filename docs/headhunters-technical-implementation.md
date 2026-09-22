# Head Hunters — Technical Implementation & SEO Architecture Guide

**Branch:** `si/bug/SEO` | **Environment:** Node.js, Express, TypeScript, Drizzle ORM, MySQL, React, Vite

---

## 1. Overview of Technical Changes

This guide outlines the server and client-side changes implemented to resolve search crawlability blockers, establish semantic structured data, and support SEO-friendly vacancy pages with full Google Jobs eligibility.

---

## 2. Server Architecture (`backend/src/index.ts`)

### 2.1 Dynamic XML Sitemap (`GET /sitemap.xml`)
* **Endpoint:** `GET /sitemap.xml`
* **Response Header:** `Content-Type: application/xml; charset=utf-8`, `Cache-Control: public, max-age=3600` (1-hour cache).
* **Behavior:**
  1. Queries all active jobs from the database: `WHERE status = 'ACTIVE'`.
  2. Renders static high-priority routes (`/`, `/about`, `/contact`, `/privacy-policy`).
  3. Appends all active jobs with canonical URL formatted as `https://www.headhunters.lk/jobs/${job.slug || job.id}` and last modified timestamps.
  4. Returns compliant XML adhering to sitemaps.org 0.9 protocol.

### 2.2 Static Robots.txt (`frontend/public/robots.txt`)
* **File Location:** `frontend/public/robots.txt`
* **Served As:** Static text file (`Content-Type: text/plain; charset=utf-8`).
* **Content:**
  ```text
  User-agent: *
  Allow: /
  Disallow: /admin/
  Disallow: /api/
  Disallow: /login

  Sitemap: https://www.headhunters.lk/sitemap.xml
  ```
* **Explanation:** Allows all compliant crawlers (including Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, and Applebot) while protecting administrative and API endpoints.

### 2.3 Server-Rendered Job Detail Endpoint (`GET /jobs/:slug`)
To make job listings crawlable without requiring JavaScript execution, the backend intercepts `/jobs/:slug` requests before the SPA fallback:

1. **Resolution Strategy:**
   * Checks if `:slug` matches a job's `slug` column.
   * Checks if `:slug` matches a legacy `id` (UUID format).
   * Generates a computed slug fallback (`toSlug(title) + '-' + id.slice(-6)`) for backwards compatibility.

2. **Legacy UUID 301 Redirect:**
   * If a visitor or crawler requests an active job by its raw UUID (`/jobs/8bc75493-f8e8-4cb1-a0a3-b9817d48edcc`), the server issues an HTTP `301 Moved Permanently` redirecting to the canonical slug (`/jobs/:slug`), consolidating link equity and eliminating duplicate content.

3. **Status Code Handling:**
   * **Active Job:** HTTP `200 OK` serving complete semantic HTML shell with `<title>`, `<meta description>`, Open Graph tags, canonical link, and JSON-LD `JobPosting`.
   * **Expired / Inactive Job (`ARCHIVED` or `FILLED`):** HTTP `410 Gone` with a friendly page informing visitors that the role has closed and providing a link to active listings.
   * **Non-Existent Job:** HTTP `404 Not Found`.

4. **Security & XSS Prevention:**
   * All database-sourced text fields (`title`, `location`, `type`, `description`) are passed through the strict `htmlEscape()` function before being embedded into HTML attributes, `<title>`, or `<noscript>` text content.
   * `JSON.stringify()` is used for JSON-LD serialization, which automatically handles character escaping in JSON script blocks.

5. **Confidential Employer Schema Governance:**
   * When `job.isConfidential` is `true`:
     ```json
     "hiringOrganization": {
       "@type": "Organization",
       "name": "Confidential"
     }
     ```
   * *Critical Guardrail:* The `"sameAs"` property is explicitly omitted on confidential roles to prevent Google from incorrectly attributing the employer identity to Head Hunters.

---

## 3. Database Schema & Migration (`backend/drizzle/0001_seo_job_fields.sql`)

### 3.1 Migration SQL
```sql
-- Migration: 0001_seo_job_fields.sql
ALTER TABLE `Job`
  ADD COLUMN IF NOT EXISTS `slug` varchar(255) NULL UNIQUE COMMENT 'SEO-friendly URL slug, e.g. senior-finance-manager-colombo';

ALTER TABLE `Job`
  ADD COLUMN IF NOT EXISTS `closingDate` timestamp NULL COMMENT 'Optional vacancy closing date for validThrough in JobPosting schema';

ALTER TABLE `Job`
  ADD COLUMN IF NOT EXISTS `salaryRange` varchar(191) NULL COMMENT 'Optional disclosed salary range';

ALTER TABLE `Job`
  ADD COLUMN IF NOT EXISTS `isConfidential` boolean NOT NULL DEFAULT false COMMENT 'If true, hiringOrganization name is set to Confidential';
```

### 3.2 Rollback Plan
If an emergency rollback is required:
```sql
ALTER TABLE `Job` DROP COLUMN IF EXISTS `slug`;
ALTER TABLE `Job` DROP COLUMN IF EXISTS `closingDate`;
ALTER TABLE `Job` DROP COLUMN IF EXISTS `salaryRange`;
ALTER TABLE `Job` DROP COLUMN IF EXISTS `isConfidential`;
```

---

## 4. Verification & Testing Checklist

Before deploying this branch to production, run the following verification steps:

### 4.1 Curl & Response Header Verification
```bash
# 1. Verify robots.txt returns text/plain and correct content
curl -I https://www.headhunters.lk/robots.txt
# Expected: Content-Type: text/plain

# 2. Verify sitemap.xml returns application/xml
curl -I https://www.headhunters.lk/sitemap.xml
# Expected: Content-Type: application/xml

# 3. Verify server-rendered job page returns HTML with JobPosting schema
curl -s https://www.headhunters.lk/jobs/<test-slug> | grep -E 'JobPosting|canonical'

# 4. Verify legacy UUID redirects to slug with HTTP 301
curl -I https://www.headhunters.lk/jobs/8bc75493-f8e8-4cb1-a0a3-b9817d48edcc
# Expected: HTTP/1.1 301 Moved Permanently, Location: /jobs/<canonical-slug>
```

### 4.2 Rich Results Validation
1. Open Google's Rich Results Test tool: `https://search.google.com/test/rich-results`
2. Test the URL of an active vacancy.
3. Confirm that the `JobPosting` structured data validates with zero errors and that job title, date posted, valid through date, and hiring organization are properly detected.
