# Head Hunters Sri Lanka — Deployment & Verification Checklist

**Branch:** `si/bug/SEO` | **Release Version:** 1.0.0-SEO

---

## 1. Pre-Deployment Build Verification

Execute in your local environment prior to packaging:

```bash
# 1. Frontend Build & Typecheck
cd frontend
npm run build
# Expected output: Built in X seconds with 0 errors.

# 2. Backend Build & Typecheck
cd ../backend
npm run build
# Expected output: tsc completes with 0 errors.
```

---

## 2. Server & Routing Verification Tests

Start local server (`npm run dev` or `node dist/index.js` in `backend`):

```bash
# Test 1: Robots.txt content and Content-Type
curl -I http://localhost:3001/robots.txt
# Expected: HTTP/1.1 200 OK, Content-Type: text/plain; charset=utf-8
curl -s http://localhost:3001/robots.txt
# Expected: User-agent: * \n Allow: / \n Disallow: /admin/ \n Sitemap: https://www.headhunters.lk/sitemap.xml

# Test 2: Sitemap XML validity and Content-Type
curl -I http://localhost:3001/sitemap.xml
# Expected: HTTP/1.1 200 OK, Content-Type: application/xml; charset=utf-8
curl -s http://localhost:3001/sitemap.xml | grep -E 'loc|lastmod'

# Test 3: Defined Public Page Metadata (e.g. /executive-search-sri-lanka/)
curl -s http://localhost:3001/executive-search-sri-lanka/ | grep -E '<title>|<link rel="canonical"|<h1>'
# Expected:
# <title>Executive Search Sri Lanka | Head Hunters</title>
# <link rel="canonical" href="https://www.headhunters.lk/executive-search-sri-lanka/" />
# <h1>Executive Search for Senior and Leadership Roles</h1>

# Test 4: Trailing Slash Normalization
curl -I http://localhost:3001/executive-search-sri-lanka
# Expected: HTTP/1.1 301 Moved Permanently, Location: https://www.headhunters.lk/executive-search-sri-lanka/

# Test 5: Real HTTP 404 for Unknown Routes (No soft 404)
curl -I http://localhost:3001/non-existent-random-route
# Expected: HTTP/1.1 404 Not Found (NOT 200 OK!)

# Test 6: Legacy UUID Job Redirection
curl -I http://localhost:3001/jobs/8bc75493-f8e8-4cb1-a0a3-b9817d48edcc
# Expected: HTTP/1.1 301 Moved Permanently, Location: /jobs/executive-business-development-solar-sales--8bc75493-f8e8-4cb1-a0a3-b9817d48edcc

# Test 7: Canonical Job Detail Page
curl -s http://localhost:3001/jobs/executive-business-development-solar-sales--8bc75493-f8e8-4cb1-a0a3-b9817d48edcc | grep -E 'JobPosting|canonical'
# Expected: Valid JobPosting schema with datePosted, validThrough, and canonical link

# Test 8: Unknown Job ID
curl -I http://localhost:3001/jobs/00000000-0000-0000-0000-000000000000
# Expected: HTTP/1.1 404 Not Found

# Test 9: Canonical Host Redirection (in production)
curl -I -H "Host: headhunters.lk" http://localhost:3001/
# Expected: HTTP/1.1 301 Moved Permanently, Location: https://www.headhunters.lk/
```

---

## 3. Schema.org & Rich Results Testing

1. Open Google's Rich Results Test tool: `https://search.google.com/test/rich-results`
2. Test the following URLs:
   * Homepage: `https://www.headhunters.lk/`
     * Expected: Valid `Organization` and `EmploymentAgency` schema without warnings.
   * Active Vacancy: `https://www.headhunters.lk/jobs/executive-business-development-solar-sales--8bc75493-f8e8-4cb1-a0a3-b9817d48edcc`
     * Expected: Valid `JobPosting` schema.
     * Confirm `hiringOrganization` is non-empty.
     * Confirm `validThrough` date is detected.
     * Confirm zero unescaped HTML errors.

---

## 4. Rollback Procedure

If unexpected behavior occurs in production:
1. Re-upload previous backup zip file from cPanel file manager (`cpanel_deploy_backup.zip`).
2. In cPanel Node.js Selector, restart the application.
3. If database migration was executed, run the rollback statements in `backend/drizzle/0001_seo_job_fields.sql`:
   ```sql
   ALTER TABLE `Job` DROP COLUMN IF EXISTS `slug`;
   ALTER TABLE `Job` DROP COLUMN IF EXISTS `closingDate`;
   ALTER TABLE `Job` DROP COLUMN IF EXISTS `salaryRange`;
   ALTER TABLE `Job` DROP COLUMN IF EXISTS `isConfidential`;
   ```
