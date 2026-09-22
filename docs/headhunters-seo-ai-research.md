# Head Hunters — SEO & AI Visibility Audit
**Research date:** 2026-09-22 | **Branch:** si/bug/SEO

---

## Executive Summary

Head Hunters (headhunters.lk) is currently **invisible to search engines and AI systems** due to critical technical blockers. The site delivers an empty HTML shell to crawlers, `/robots.txt` and `/sitemap.xml` both return the SPA shell instead of valid files, and zero server-rendered content exists before JavaScript executes. A `site:headhunters.lk` search returns 0 indexed pages.

**What can be controlled:** Technical rendering, robots.txt, sitemap, structured data, metadata, content architecture, job indexing, entity consistency, local SEO signals.

**What cannot be guaranteed:** First position in Google, AI recommendation priority. These depend on relevance, corroboration, authority, and independent third-party signals built over time.

---

## Section 1 — Verified Technical Blockers

| Issue | Severity | Evidence |
|---|---|---|
| `/robots.txt` returns SPA HTML shell | **Critical** | Live fetch 2026-09-22 returns `<!doctype html>` |
| `/sitemap.xml` returns SPA HTML shell | **Critical** | Live fetch 2026-09-22 returns `<!doctype html>` |
| Homepage HTML before JS: zero indexable content | **Critical** | Raw HTML is only `<div id="root"></div>` + script tag |
| `index.html` title is literally `"frontend"` (dev default) | **Critical** | `frontend/index.html` line 7 |
| No `<meta name="description">` in initial HTML | **Critical** | Absent from source |
| No canonical URL tag | High | Absent |
| No Open Graph tags | High | Absent |
| No JSON-LD structured data | High | Absent |
| All content rendered via React client-side JS | **Critical** | App.tsx: everything in `useEffect` after API fetch |
| Homepage waits for 2 API calls before rendering | **Critical** | App.tsx lines 28–46 — shows spinner until both respond |
| No `/jobs/[slug]` routes | High | App.tsx: only `/`, `/login`, `/admin/*` defined |
| SPA fallback serves `index.html` for ALL non-API routes | High | `backend/src/index.ts` line 90 |
| No Google Indexing API or IndexNow | Medium | Not present |
| OAI-SearchBot not explicitly allowed | **Critical** | No valid `robots.txt` exists |

### 1.1 What crawlers actually see

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Head Hunters | Premium Workforce Solutions</title>
    <!-- Google Fonts preconnect only -->
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/index-CVx3lgwB.js"></script>
  </body>
</html>
```

Googlebot, OAI-SearchBot, PerplexityBot, and Bingbot all see this. No company description, no services, no jobs, no address, no schema.

### 1.2 Rendering fix options

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| Static meta in `index.html` + static `robots.txt`/`sitemap.xml` | Fastest, zero architecture change | Content still JS-rendered | **Do this Week 1** |
| Pre-rendering (react-snap, vite-plugin-ssr) | No framework change | Dynamic job data hard to pre-render | Month 2 option |
| Express server-rendered job pages | Targeted, enables Google Jobs | Backend template work needed | Month 2 for `/jobs/[slug]/` |
| Migrate to Next.js | Full SSR/SSG, best long-term | Major migration risk and timeline | Long-term only, not now |

**Decision:** Fix the static layer immediately. Do not migrate to Next.js now. Build job-detail pages as Express-rendered HTML endpoints for Google Jobs eligibility in Month 2.

---

## Section 2 — Current Index & Ranking Baseline

| Signal | Status | Source |
|---|---|---|
| `site:headhunters.lk` | **0 pages indexed** | Google search 2026-09-22 |
| Google Jobs visibility | **None** | No JobPosting schema, no job-detail URLs |
| AI mentions (ChatGPT, Gemini, Perplexity) | **Absent** | User-confirmed + prompt tests |
| Third-party directories (Clutch, Outsource Accelerator) | **Absent** | Web research 2026-09-22 |
| Google Business Profile | **Status unconfirmed** | Requires manual check |

---

## Section 3 — Sri Lankan Search Landscape & Keywords

All volumes are **Estimated** — GSC is unavailable. Do not treat as verified data.

### Employer-intent (highest business value)

| Query | Est. vol. | Competition | Current winners | HH opportunity |
|---|---|---|---|---|
| recruitment agency sri lanka | High | High | InTalent, Formix, Manpower | Core page required |
| executive search sri lanka | Medium | Medium | Career141, JIFCO, Manpower | Core page required |
| headhunters sri lanka | Medium | Medium | Directories | Branded + service |
| staffing agency colombo | Medium | Medium | Manpower | Service page |
| ceo recruitment sri lanka | Low | Very low | No clear winner | **Strong opportunity** |
| confidential recruitment sri lanka | Low | Very low | No clear winner | **Strong opportunity** |
| finance recruitment sri lanka | Low | Low | Weak results | Differentiation |
| legal recruitment colombo | Low | Low | Weak results | Differentiation |

### Candidate-intent (use for job pages, not homepage)

| Query | Est. vol. | Strategy |
|---|---|---|
| jobs in sri lanka | Very High | `/jobs/` index page |
| job vacancies colombo | Very High | Job index + category pages |
| finance jobs sri lanka | High | `/jobs/finance/` category |
| executive jobs sri lanka | Medium | `/jobs/executive/` category |
| submit cv recruitment agency sri lanka | Low-Med | `/candidates/` page |

### AI/informational intent (highest long-term value — enables AI citation)

| Question | Gap | Target page |
|---|---|---|
| How does executive search work in sri lanka | No good local content | `/insights/how-executive-search-works/` |
| How much do recruitment agencies charge sri lanka | No clear local answer | `/insights/recruitment-agency-fees-sri-lanka/` |
| How to choose a recruitment agency sri lanka | No authoritative guide | `/insights/how-to-choose-recruitment-agency/` |
| Do recruitment agencies charge candidates sri lanka | No local answer | `/candidates/` FAQ section |
| Confidential CEO recruitment process | No local content | `/insights/ceo-recruitment-confidential/` |

---

## Section 4 — Competitor Analysis

| Agency | Strengths HH cannot match yet | Gaps HH can exploit |
|---|---|---|
| Manpower Sri Lanka | History, reviews, GBP, dedicated service pages | Generic positioning, no confidential focus |
| JIFCO Recruitment | Named specialisations, executive search positioning | Limited content depth |
| Formix | Modern site, Clutch listed | No sector-specific pages |
| Mankind (est. 1978) | 45+ years history, multiple indexed pages | Dated UX, no AI-citable content |
| InTalent Asia | Tech/HR niche, Clutch/Manifest listed | Limited employer content |
| Career141 | Global executive search positioning | Sri Lanka local signals weak |

**Clearest content gap:** No Sri Lankan agency has published expert, AI-answerable content about how executive search or CEO recruitment works locally. This is Head Hunters' strongest first-mover opportunity.

---

## Section 5 — AI Visibility Investigation

### Why Head Hunters does not appear

**Stage 1 — Retrieval: BLOCKED**
- `robots.txt` broken → OAI-SearchBot has no explicit permission
- `sitemap.xml` broken → AI crawlers cannot discover URL set
- Content is JS-rendered → even if crawled, nothing to index

**Stage 2 — Recommendation: NO CORROBORATION**
- Zero Clutch/directory listings
- No Google reviews
- Two inconsistent telephone numbers in public sources
- No structured data confirming entity
- No independent third-party references

### AI prompt test results (2026-09-22, signed-out browsing)

| Prompt | HH appeared | Notes |
|---|---|---|
| Best recruitment agencies in Sri Lanka | No | Formix, InTalent, Manpower, Mankind cited |
| Recommend executive search company Sri Lanka | No | Career141, JIFCO cited |
| Who handles confidential CEO recruitment Colombo | No | No clear answer — content gap |
| What does headhunters.lk do | No definitive answer | Insufficient public data |

### Crawler requirements (per official sources)

Per OpenAI documentation (developers.openai.com/api/docs/bots):
- `OAI-SearchBot` = ChatGPT search visibility — must be explicitly allowed
- `GPTBot` = model training — separate, can be managed independently
- Site must have a valid `robots.txt` permitting `OAI-SearchBot`

Per Google Search Central (developers.google.com/search/docs):
- Generative AI results use the same indexing pipeline as regular search
- No special schema is required solely for AI results
- Fix is: crawlability + quality content + entity corroboration

---

## Section 6 — Recommended Site Architecture

| URL | Primary keyword | Schema type | Priority |
|---|---|---|---|
| `/` | brand + "recruitment agency sri lanka" | Organization, EmploymentAgency | P0 |
| `/recruitment-agency-sri-lanka/` | recruitment agency sri lanka | EmploymentAgency, FAQPage | P1 |
| `/executive-search-sri-lanka/` | executive search sri lanka | Service, FAQPage | P1 |
| `/permanent-recruitment-sri-lanka/` | permanent recruitment sri lanka | Service | P1 |
| `/confidential-recruitment/` | confidential recruitment sri lanka | Service, FAQPage | P1 |
| `/ceo-recruitment-sri-lanka/` | ceo recruitment sri lanka | Service | P2 |
| `/finance-recruitment-sri-lanka/` | finance recruitment sri lanka | Service | P2 |
| `/legal-recruitment-sri-lanka/` | legal recruitment sri lanka | Service | P2 |
| `/hr-recruitment-sri-lanka/` | hr recruitment sri lanka | Service | P2 |
| `/employers/` | hire staff sri lanka | Service, FAQPage | P1 |
| `/candidates/` | submit cv recruitment agency | FAQPage | P1 |
| `/jobs/` | job vacancies sri lanka | ItemList | P1 |
| `/jobs/[slug]/` | [job title] vacancy colombo | JobPosting | P1 |
| `/jobs/finance/` | finance jobs sri lanka | ItemList | P2 |
| `/jobs/legal/` | legal jobs sri lanka | ItemList | P2 |
| `/jobs/hr/` | hr jobs colombo | ItemList | P2 |
| `/jobs/executive/` | executive jobs sri lanka | ItemList | P2 |
| `/about/` | head hunters sri lanka | Organization | P2 |
| `/insights/` | recruitment insights sri lanka | Blog | P2 |
| `/insights/[slug]/` | specific question keyword | Article | P2 |
| `/contact/` | contact recruitment agency colombo | LocalBusiness | P1 |

---

## Section 7 — Entity & Local SEO

### Business identity record

| Field | Status | Action |
|---|---|---|
| Trading name | Head Hunters | Confirmed |
| Website | https://www.headhunters.lk/ | Confirmed |
| Email | info@headhunters.lk | Confirmed |
| Primary telephone | **UNCONFIRMED** — two numbers exist | Confirm one |
| Address | "Pinto Place, Colombo 06" | Confirm full street number |
| Founded year | Unknown | Confirm |
| Google Business Profile | Unknown status | Create/claim/verify |
| LinkedIn URL | Placeholder in code | Confirm real URL |
| Facebook URL | Placeholder in code | Confirm real URL |

### NAP consistency targets (after confirming telephone)

- Website footer and `/contact/` page
- Google Business Profile
- Bing Places for Business
- LinkedIn company page
- Facebook page
- bizz.lk, yellowpages.lk
- Clutch.co (create profile)
- Outsource Accelerator (create profile)

---

## Section 8 — Structured Data Plan

### Homepage (Organization + EmploymentAgency)

```json
{
  "@context": "https://schema.org",
  "@type": ["Organization", "EmploymentAgency"],
  "@id": "https://www.headhunters.lk/#organization",
  "name": "Head Hunters",
  "url": "https://www.headhunters.lk/",
  "logo": "https://www.headhunters.lk/favicon.png",
  "description": "A Sri Lankan recruitment agency and executive-search firm providing permanent recruitment, confidential senior appointments and workforce solutions across Colombo and Sri Lanka.",
  "email": "info@headhunters.lk",
  "telephone": "[CONFIRMED PRIMARY NUMBER]",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Pinto Place",
    "addressLocality": "Colombo",
    "postalCode": "00600",
    "addressCountry": "LK"
  },
  "areaServed": [
    { "@type": "Country", "name": "Sri Lanka" },
    { "@type": "Country", "name": "Australia" },
    { "@type": "Country", "name": "New Zealand" }
  ],
  "sameAs": ["[CONFIRMED LINKEDIN URL]", "[CONFIRMED FACEBOOK URL]"]
}
```

### Per-vacancy (JobPosting)

Per Google's job-posting requirements: https://developers.google.com/search/docs/appearance/structured-data/job-posting

```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "[Job Title]",
  "description": "[Full description — HTML allowed]",
  "identifier": { "@type": "PropertyValue", "name": "Head Hunters", "value": "[job-id]" },
  "datePosted": "[YYYY-MM-DD]",
  "validThrough": "[YYYY-MM-DD]",
  "employmentType": "FULL_TIME",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "[Employer name OR 'Confidential']",
    "sameAs": "https://www.headhunters.lk/"
  },
  "jobLocation": {
    "@type": "Place",
    "address": { "@type": "PostalAddress", "addressLocality": "Colombo", "addressCountry": "LK" }
  }
}
```

**Confidential employers:** Use `"name": "Confidential"` in `hiringOrganization`. Never reveal a confidential employer name.

---

## Section 9 — 90-Day Roadmap

### Weeks 1–2: Technical recovery (blocks everything else)
- [x] Create valid `robots.txt` as static file
- [x] Create valid `sitemap.xml` endpoint on backend
- [x] Fix `index.html` — title, description, canonical, OG tags
- [x] Add Organization/EmploymentAgency JSON-LD to `index.html`
- [ ] Build `/jobs/[slug]/` server-rendered HTML pages with JobPosting schema
- [ ] Set up Google Search Console and submit sitemap
- [ ] Confirm primary telephone number

### Weeks 3–4: Core commercial pages
- [ ] Build `/recruitment-agency-sri-lanka/` with expert content
- [ ] Build `/executive-search-sri-lanka/` with expert content
- [ ] Build `/employers/` and `/candidates/` pages
- [ ] Build `/about/` with real company details
- [ ] Build `/contact/` as standalone page
- [ ] Create/claim Google Business Profile

### Month 2: Sector pages and guides
- [ ] `/confidential-recruitment/`, `/ceo-recruitment-sri-lanka/`
- [ ] `/finance-recruitment-sri-lanka/`, `/legal-recruitment-sri-lanka/`, `/hr-recruitment-sri-lanka/`
- [ ] Job category pages
- [ ] Publish: "How Executive Search Works in Sri Lanka"
- [ ] Publish: "How Much Do Recruitment Agencies Charge?"
- [ ] Register on Clutch and Outsource Accelerator

### Month 3: Authority and AI citation
- [ ] Legitimate review acquisition (past clients, genuine feedback only)
- [ ] Publish: "Confidential CEO Recruitment Guide"
- [ ] Publish: salary/hiring market data (requires real placement data)
- [ ] Submit to Sri Lankan business directories
- [ ] Begin monthly AI prompt benchmark tracking
- [ ] IndexNow integration for instant vacancy notification

---

## Section 10 — Measurement Framework

### Monthly tracking

**Organic SEO (Google Search Console):**
- Pages indexed
- Impressions for "recruitment agency sri lanka" and variants
- Google Jobs impressions and clicks
- Branded searches for "Head Hunters"
- Organic employer enquiries

**Local SEO (Google Business Profile):**
- Calls, direction requests, website clicks
- Review count and average rating

**AI visibility (manual monthly test):**
- Run 10 benchmark prompts across ChatGPT, Gemini, Perplexity
- Record: appeared Y/N | position | description accuracy | source cited

### Immediate setup

1. Connect Google Search Console to headhunters.lk
2. Submit sitemap once fixed
3. Create/claim Google Business Profile
4. Install Bing Webmaster Tools

---

## Section 11 — Information Still Required

| Item | Why it matters |
|---|---|
| Confirmed primary telephone | NAP consistency; structured data |
| Full street address with number | Local SEO, GBP verification |
| Founded/established year | Entity credibility |
| Real LinkedIn company URL | sameAs in schema |
| Real Facebook URL | sameAs in schema |
| Google Business Profile status | Local SEO baseline |
| Google Search Console access | Real keyword data |
| GA4 installation status | Conversion tracking |
| Client permission for testimonials | Content authority |
| Whether candidate fees apply | FAQ accuracy |
| Confirmed service areas | Schema areaServed |

---

## Prioritised Action Table

| Action | Impact | Effort | Dependency | Owner | Deadline |
|---|---|---|---|---|---|
| Fix robots.txt (static file) | Unblocks all crawlers | Low | None | Dev | Week 1 |
| Fix sitemap.xml endpoint | URL discovery | Low | None | Dev | Week 1 |
| Fix index.html metadata | Basic indexing | Low | None | Dev | Week 1 |
| Add Organization JSON-LD | Entity establishment | Low | Confirm tel | Dev | Week 1 |
| Confirm primary telephone | NAP consistency | Low | Business | Week 1 |
| Set up Google Search Console | Real data | Low | DNS access | Admin | Week 1 |
| Build /jobs/[slug]/ with JobPosting schema | Google Jobs | High | Backend API | Dev | Week 2 |
| Build /recruitment-agency-sri-lanka/ | Core employer keyword | High | Content | Dev+Content | Week 3 |
| Build /executive-search-sri-lanka/ | Executive visibility | High | Content | Dev+Content | Week 3 |
| Claim Google Business Profile | Local + AI visibility | Medium | Address/tel | Admin | Week 3 |
| Create Clutch profile | Third-party corroboration | Low | Reviews | Admin | Month 2 |
| Publish executive search guide | AI citation potential | High | Expertise/data | Content | Month 2 |
| Publish salary guide | Strongest citation asset | Very High | Real data | Content | Month 3 |
