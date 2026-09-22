# Head Hunters Sri Lanka — SEO & Technical Implementation Risk Register

This document tracks all identified technical, architectural, and data risks associated with the SEO and AI search recovery initiative, along with mitigation strategies and verification status.

---

## Risk Register

| Risk ID | Category | Risk Description | Severity | Likelihood | Impact | Mitigation Strategy | Status |
|---|---|---|---|---|---|---|---|
| **RSK-01** | Security | XSS vulnerability via database fields interpolated into server-rendered HTML or JSON-LD. | Critical | Low | High | Strict `htmlEscape()` utility sanitizes all database strings before output; JSON-LD serialized via `JSON.stringify()`. | **Mitigated** |
| **RSK-02** | SEO / Schema | Confidential employer schema incorrectly attributing hiring organization to Head Hunters via `sameAs`. | High | High | Medium | When `isConfidential === true`, `hiringOrganization` uses `name: "confidential"` and `sameAs` is explicitly omitted. | **Mitigated** |
| **RSK-03** | Indexing | Broken legacy URLs (`/jobs/[uuid]`) causing 404s or loss of existing search engine rankings. | High | Medium | High | Permanent HTTP `301 Moved Permanently` redirects `/jobs/[uuid]` directly to `/jobs/[slug]--[uuid]`. | **Mitigated** |
| **RSK-04** | Indexing | Soft 404s caused by the SPA fallback returning HTTP 200 for non-existent routes or expired vacancies. | High | High | Medium | Explicit server routing returns real HTTP `404 Not Found` for missing routes/IDs and `410 Gone` for expired vacancies. | **Mitigated** |
| **RSK-05** | Database | Production database queries crashing due to missing columns (`slug`, `closingDate`, etc.) before migration. | High | Medium | Critical | Schema code in `backend/src/index.ts` is defensive: it uses runtime fallback checks (`job.slug || job.id`) so it runs safely on both unmigrated and migrated databases. | **Mitigated** |
| **RSK-06** | Canonicalization | Duplicate content caused by both `headhunters.lk` and `www.headhunters.lk` serving 200 OK. | Medium | High | Medium | Canonical host middleware forces 301 redirect from non-www to `www.headhunters.lk` and http to https. | **Mitigated** |
| **RSK-07** | Performance | Heavy server rendering overhead or crawler abuse exhausting Node.js memory. | Medium | Low | Low | Server-rendered responses set HTTP `Cache-Control: public, max-age=600` (10 minutes) to allow edge/browser caching. | **Mitigated** |
| **RSK-08** | Analytics / PII | Personal identifiable information (PII) accidentally transmitted to GA4 during CV upload or enquiry. | High | Low | High | GA4 utility (`analytics.ts`) strictly forbids transmitting names, emails, phone numbers, or resume content in event parameters. | **Mitigated** |
| **RSK-09** | Deployment | Unintended code changes or broken builds breaking live recruitment flow on cPanel. | Critical | Medium | Critical | Pre-deploy build verification scripts (`npm run build` for frontend and backend), manual deployment model (`release.bat`), and full rollback procedure. | **Mitigated** |
| **RSK-10** | Schema Accuracy | Unverified countries (Australia, New Zealand) or placeholder phone numbers in public schema. | Medium | Medium | Medium | Completely purged AU/NZ from `areaServed` and meta tags; placeholder telephone numbers removed pending owner verification. | **Mitigated** |
