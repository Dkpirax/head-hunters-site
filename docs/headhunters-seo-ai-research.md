# Head Hunters — SEO & AI Visibility Research & Audit
**Research Date:** 2026-09-22 | **Branch:** `si/bug/SEO` | **Status:** In Review (Pre-Deployment)

---

## Executive Summary

Head Hunters (`headhunters.lk`) faces substantial search visibility and AI retrieval challenges stemming from foundational technical configuration and architecture gaps. 

Prior exploratory searches (`site:headhunters.lk`) returned limited visibility. While a small number of pages have been discoverable in search engines historically (such as the homepage, privacy policy, and a solar-sales vacancy), full indexing coverage, crawl frequency, and SERP health must be verified through authenticated Google Search Console (GSC) and Bing Webmaster Tools data.

The website currently runs as a client-side Single Page Application (SPA) built with React and Vite. When crawlers inspect the root HTML, they encounter an empty `<div id="root"></div>` shell requiring client-side JavaScript execution to render content. Furthermore, prior server configurations routed all requests—including `/robots.txt` and `/sitemap.xml`—to the SPA HTML template instead of delivering proper plain text and XML payloads. 

### What Can Be Controlled vs. What Cannot Be Guaranteed
* **Fully Controllable:** Technical rendering, correct HTTP status codes (200, 301, 404, 410), valid `robots.txt` and `sitemap.xml` payloads, structured data (`JobPosting`, `EmploymentAgency`, `Organization`), metadata hygiene, entity consistency (NAP), and crawlable server-rendered job pages.
* **Cannot Be Guaranteed:** Specific ranking positions (e.g. "#1 on Google") or algorithmic priority in AI model responses (ChatGPT, Gemini, Perplexity). AI responses depend on consensus, independent citations, regional brand prominence, customer reviews, and continuous crawlability.

---

## Section 1 — Verified Technical Architecture & Crawlability

### 1.1 Technical Findings Matrix

| Component | Historical / Pre-Fix State | Current / Target State | Impact on Crawlers |
|---|---|---|---|
| **`/robots.txt`** | Returned SPA HTML (`<!doctype html>`) with HTTP 200 | Served as static plain text (`text/plain; charset=utf-8`) from `frontend/public/robots.txt` | Eliminates parsing errors; explicitly informs crawlers of allowed routes and sitemap location. |
| **`/sitemap.xml`** | Returned SPA HTML template | Dynamic backend endpoint (`backend/src/index.ts`) returning valid XML (`Content-Type: application/xml`) listing static routes and active jobs | Enables programmatic URL discovery for search engines and AI crawlers. |
| **Homepage Shell** | Title was `"frontend"`, no meta description, no Open Graph, no JSON-LD | Updated `frontend/index.html` with curated meta tags, canonical URL, Open Graph, and `Organization` / `EmploymentAgency` schema | Supplies essential entity and preview metadata without waiting for JavaScript execution. |
| **Job Vacancies** | Accessible only via UUID (e.g. `/jobs/8bc75493...`) through client-side JS routing; no server-rendered HTML or schema | Server-rendered `/jobs/:slug` endpoints serving semantic HTML, meta tags, and schema.org `JobPosting` structured data; existing UUID URLs 301 redirect to canonical slug | Makes job listings eligible for Google Jobs rich snippets and immediate indexation by AI crawlers. |
| **Database Schema** | Minimal Job fields (id, title, department, location, type, description, status, createdAt, updatedAt) | Extensible schema adding `slug`, `closingDate`, `salaryRange`, `isConfidential` via versioned migration (`0001_seo_job_fields.sql`) | Supports SEO-friendly URLs, Google Jobs expiration rules, and privacy compliance for confidential client searches. |

### 1.2 Crawler Behavior & Rendering Clarification

1. **JavaScript Rendering in Modern Search Engines:**
   * Googlebot uses a modern Chromium rendering engine (Web Rendering Service / WRS). An initial empty HTML shell does not mean Google is permanently incapable of indexing a page.
   * However, rendering client-side JavaScript requires substantial compute resources. Google defers rendering until compute is available ("two-wave indexing"), causing significant indexing delays—often days or weeks for fast-moving job listings.
   * Non-Google search engines (Bing, DuckDuckGo) and AI crawlers (PerplexityBot, ClaudeBot, Bytespider) often do not render complex SPAs reliably or at all, causing them to index an empty page.

2. **Robots.txt Specification & AI Bots:**
   * A bot such as OpenAI's `OAI-SearchBot` or `GPTBot` does not strictly require a custom, bot-specific directive if a valid global rule (`User-agent: * Allow: /`) is in place.
   * The critical issue was that the server returned an HTML document with HTTP status 200 for `/robots.txt`. When crawlers receive HTML where plain text is expected, behavior varies: some treat the file as invalid/empty, while others may enter a cautious failure mode. Providing a standard static `robots.txt` resolves this cleanly.

---

## Section 2 — Baseline Discoverability & Measurement

| Metric / Channel | Current Baseline Observation | Verification Source / Requirement |
|---|---|---|
| **Discovered Pages** | Small footprint discoverable (Homepage, Privacy Policy, single active job URL) | Must be verified in Google Search Console once ownership is verified via DNS. |
| **Google Jobs Visibility** | None detected | Requires schema.org `JobPosting` markup and crawlable URL endpoints. |
| **AI Engine Mentions** | Absent in sample queries across ChatGPT, Perplexity, Gemini | Baseline verified in exploratory tests; full 50-prompt benchmark framework established in Section 5. |
| **Third-Party Directories** | Missing from Clutch, The Manifest, Outsource Accelerator | Directory audit conducted 2026-09-22; profiles need creation. |
| **Google Business Profile** | Unverified / Unclaimed | Physical address and primary phone number verification required from business owners. |

---

## Section 3 — Sri Lanka Recruitment Search Landscape

*Note: In the absence of direct access to Google Search Console and Google Keyword Planner API for headhunters.lk, keyword classification represents a structured regional search hypothesis based on industry search patterns, recruitment terminology, and competitor landing pages in Colombo and islandwide.*

### 3.1 Keyword Intent Classification

1. **High-Value Commercial (Employer / B2B Intent):**
   * Target audience: HR Directors, Managing Directors, Founders, International Companies establishing Sri Lankan teams.
   * Key queries: `recruitment agency sri lanka`, `executive search colombo`, `headhunters sri lanka`, `staffing agency sri lanka`, `ceo recruitment sri lanka`, `confidential executive search colombo`, `finance recruitment agency sri lanka`, `legal headhunters sri lanka`.
   * Strategy: Dedicated service landing pages with senior authority content, transparent process explanation, and clear consultation inquiry forms.

2. **Transactional & High-Volume (Candidate / Job Seeker Intent):**
   * Target audience: Mid-to-senior professionals, executive job seekers, specialized specialists.
   * Key queries: `jobs in sri lanka`, `executive vacancies colombo`, `finance manager jobs sri lanka`, `legal counsel jobs colombo`, `submit cv recruitment agency sri lanka`.
   * Strategy: Dedicated `/jobs/` index and category listings, with individual jobs carrying Google Jobs compliant `JobPosting` schema.

3. **Informational & AI Citation Prompts (Knowledge Intent):**
   * Target audience: Decision-makers researching agency fee structures, retainers, and legal recruitment processes in Sri Lanka.
   * Key queries: `how do executive search firms charge in sri lanka`, `recruitment agency fees sri lanka`, `how confidential executive search works in sri lanka`, `difference between contingency recruitment and headhunting`.
   * Strategy: In-depth, objective insight articles answering specific industry questions with local context.

*(See [`headhunters-keyword-master.csv`](file:///c:/Users/SiyanS/Documents/GitHub/head-hunters-site/docs/headhunters-keyword-master.csv) for the complete multi-intent keyword matrix).*

---

## Section 4 — Competitor Analysis & Market Landscape

### 4.1 Comparative Analysis Matrix

| Competitor | Domain | Core Positioning | Technical Rendering | Schema Present | Strengths | Exploitable Strategic Gaps |
|---|---|---|---|---|---|---|
| **Manpower Sri Lanka** | manpower.lk | Broad corporate recruitment & temporary staffing | Server-rendered CMS | Organization, LocalBusiness | Established national brand; physical Colombo branch network; high domain age | Generic broad recruitment positioning; limited focus on discreet C-suite headhunting. |
| **InTalent Asia** | intalent.asia | Tech recruitment & IT staffing | Hybrid / Webflow | Organization | Strong LinkedIn presence; featured on B2B directories (Clutch); clear tech employer positioning | Niche-focused primarily on IT/software; less focus on traditional executive, finance, and legal sectors. |
| **Formix** | formix.lk | Digital enterprise & IT executive search | Modern static/hybrid | Partial schema | Clean contemporary UI; strong startup and tech network | Limited public thought leadership or deep local recruitment guides. |
| **JIFCO Recruitment** | jifco.lk | Direct corporate placement & executive search | Traditional Web CMS | Basic | Long-standing corporate client relationships in Colombo | Outdated user experience; weak mobile optimization; absent from structured data / Google Jobs. |
| **Career141** | career141.com | Regional & global executive search | CMS | Partial schema | Multi-country scope; strong executive framing | Weak localized content signals specific to Colombo corporate hiring and Sri Lanka labor practices. |
| **Mankind** | mankind.lk | Established staffing & placement (est. 1978) | Legacy Web CMS | None | 45+ years of operational history; brand recognition among legacy institutions | Highly dated web interface; zero semantic markup; zero AI search visibility. |

### 4.2 Key Differentiating Opportunity for Head Hunters
Sri Lankan recruitment sites predominantly focus on candidate-facing job boards (e.g. TopJobs, Ikman) or generic staffing descriptions. Virtually no agency publishes authoritative, transparent guides on:
* Retained executive search vs. contingency placement in Sri Lanka.
* How confidential C-suite replacements are executed without public market disruption.
* Benchmark salary and talent mobility trends for Colombo finance, legal, and operational leadership.

Publishing authoritative, expert-authored content in these areas directly satisfies Google's Information Gain / Helpful Content criteria and provides source material for LLM knowledge retrieval.

---

## Section 5 — AI Search Visibility & Benchmark Framework

### 5.1 Analysis of AI Non-Inclusion
AI engines (ChatGPT with Search, Perplexity, Gemini, Microsoft Copilot) rely on two core retrieval mechanisms:
1. **Direct Web Search / Grounding:** Retrieving live web pages via real-time index APIs (e.g. Bing Search API, Google Search API, Perplexity web crawler).
   * *Head Hunters blocker:* Crawlers encountering empty SPA templates could not extract relevant text snippets or corporate identity.
2. **Entity Corroboration:** Checking independent third-party sources to establish credibility before recommending an agency.
   * *Head Hunters blocker:* Absence of directory listings (Clutch, YellowPages.lk, LinkedIn company profile signals) means AI models lack corroborating consensus data.

### 5.2 50-Prompt AI Benchmark Suite
To measure AI search visibility rigorously over time, we have established a standard 50-prompt benchmark across 5 core categories:
1. Generic Agency Discovery (10 prompts)
2. Executive Search & C-Suite Headhunting (10 prompts)
3. Confidential & Discreet Hiring (10 prompts)
4. Specialized Sector Recruitment - Finance, Legal, Tech, Operations (10 prompts)
5. Candidate & Expatriate Talent Placement (10 prompts)

*(The complete benchmark template, prompt list, and evaluation rubric are documented in [`headhunters-ai-prompt-benchmark.csv`](file:///c:/Users/SiyanS/Documents/GitHub/head-hunters-site/docs/headhunters-ai-prompt-benchmark.csv)).*

---

## Section 6 — Structured Data & Schema Implementation Rules

### 6.1 Organization & EmploymentAgency Schema (`frontend/index.html`)

```json
{
  "@context": "https://schema.org",
  "@type": ["Organization", "EmploymentAgency"],
  "@id": "https://www.headhunters.lk/#organization",
  "name": "Head Hunters",
  "url": "https://www.headhunters.lk/",
  "logo": "https://www.headhunters.lk/favicon.png",
  "description": "A premier Sri Lankan recruitment agency and executive search firm specializing in confidential senior appointments, leadership acquisition, and professional staffing across Colombo and nationwide.",
  "email": "info@headhunters.lk",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pinto Place",
    "addressLocality": "Colombo",
    "postalCode": "00600",
    "addressCountry": "LK"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Sri Lanka"
  },
  "knowsAbout": [
    "Executive Search",
    "Recruitment",
    "Confidential C-Suite Placement",
    "Permanent Staffing",
    "Talent Acquisition"
  ]
}
```

*Note on Geographical Scope:* Unverified countries (such as Australia and New Zealand) have been removed from `areaServed`. Only "Sri Lanka" is designated until cross-border services are officially confirmed by management.

### 6.2 JobPosting Schema Rules (`backend/src/index.ts`)

For every individual job listing served at `/jobs/:slug`:
1. **Title & Description:** Sanitized via `htmlEscape()` to prevent XSS.
2. **Confidential Clients:** When `isConfidential` is `true`:
   ```json
   "hiringOrganization": {
     "@type": "Organization",
     "name": "Confidential"
   }
   ```
   *Strict Rule:* Do NOT include `"sameAs": "https://www.headhunters.lk/"` on confidential client postings, as doing so falsely indicates to search crawlers that Head Hunters itself is the employer.
3. **Identified Clients:** When hiring on behalf of a public client where authorized:
   ```json
   "hiringOrganization": {
     "@type": "Organization",
     "name": "Client Name"
   }
   ```
4. **Dates:** `datePosted` is set to creation date (ISO string). `validThrough` is set to `closingDate` or defaulted to `datePosted + 60 days`.
5. **Expired Vacancies:** Return HTTP `410 Gone` with a polite message and link back to active vacancies.

---

## Section 7 — Technical Implementation Safety & Migration Plan

### 7.1 Database Migration (`backend/drizzle/0001_seo_job_fields.sql`)
The migration introduces four nullable/defaulted columns to support SEO:
* `slug` (`varchar(255) NULL UNIQUE`): Human-readable slug (e.g. `head-of-finance-colombo`).
* `closingDate` (`timestamp NULL`): Vacancy expiration.
* `salaryRange` (`varchar(191) NULL`): Optional salary compensation disclosure.
* `isConfidential` (`boolean NOT NULL DEFAULT false`): Flag for client confidentiality.

### 7.2 Backward Compatibility & 301 Redirects
Existing indexed links (such as `/jobs/8bc75493-f8e8-4cb1-a0a3-b9817d48edcc`) must not break. The backend router resolves:
1. If the route matches a UUID, it looks up the job record and issues an HTTP `301 Permanent Redirect` to `/jobs/:slug`.
2. If the job has no slug populated yet, it dynamically computes a fallback slug or serves the record directly, preventing 404s during rollout.

*(See [`headhunters-technical-implementation.md`](file:///c:/Users/SiyanS/Documents/GitHub/head-hunters-site/docs/headhunters-technical-implementation.md) for full endpoint and safety specifications).*

---

## Section 8 — Deliverables Summary

All supplementary documentation and analysis files created for this audit:
1. [`headhunters-keyword-master.csv`](file:///c:/Users/SiyanS/Documents/GitHub/head-hunters-site/docs/headhunters-keyword-master.csv): Granular keyword matrix with intent, language variations, difficulty, and page mapping.
2. [`headhunters-competitor-analysis.csv`](file:///c:/Users/SiyanS/Documents/GitHub/head-hunters-site/docs/headhunters-competitor-analysis.csv): Structured competitive benchmark of local recruitment agencies.
3. [`headhunters-ai-prompt-benchmark.csv`](file:///c:/Users/SiyanS/Documents/GitHub/head-hunters-site/docs/headhunters-ai-prompt-benchmark.csv): 50-prompt testing suite for tracking AI search retrieval.
4. [`headhunters-content-map.md`](file:///c:/Users/SiyanS/Documents/GitHub/head-hunters-site/docs/headhunters-content-map.md): Information architecture, URL slug strategy, and page templates.
5. [`headhunters-technical-implementation.md`](file:///c:/Users/SiyanS/Documents/GitHub/head-hunters-site/docs/headhunters-technical-implementation.md): Complete backend/frontend code implementation guide and testing checklist.
6. [`headhunters-90day-roadmap.md`](file:///c:/Users/SiyanS/Documents/GitHub/head-hunters-site/docs/headhunters-90day-roadmap.md): Phased execution roadmap.
7. [`slug-backfill.md`](file:///c:/Users/SiyanS/Documents/GitHub/head-hunters-site/docs/slug-backfill.md): Database backfill script for existing jobs.
