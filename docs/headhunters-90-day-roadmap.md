# Head Hunters — 90-Day SEO & AI Visibility Roadmap

**Objective:** Transition `headhunters.lk` from a low-visibility SPA into the top-ranking, most authoritative executive recruitment domain in Sri Lanka.

---

## Phase 1: Technical & Baseline Foundation (Days 1–15)

### Objectives:
* Unblock search engine and AI crawlers completely.
* Eliminate SPA indexing blindspots.
* Establish baseline monitoring in Google Search Console and Bing Webmaster Tools.

### Key Milestones & Tasks:
- [x] **Milestone 1.1:** Deploy static `robots.txt` ensuring all compliant crawlers are permitted.
- [x] **Milestone 1.2:** Deploy dynamic `sitemap.xml` providing full indexing paths for static and active job pages.
- [x] **Milestone 1.3:** Update `frontend/index.html` with accurate metadata, Open Graph, and `Organization` / `EmploymentAgency` schema.
- [x] **Milestone 1.4:** Implement secure server-rendered `/jobs/:slug` endpoint with sanitized HTML and `JobPosting` schema.
- [x] **Milestone 1.5:** Ensure legacy UUID vacancy URLs 301 redirect to canonical slug URLs.
- [ ] **Milestone 1.6:** Run database migration (`0001_seo_job_fields.sql`) on production database and execute slug backfill.
- [ ] **Milestone 1.7:** Verify domain ownership in Google Search Console via DNS TXT record.
- [ ] **Milestone 1.8:** Submit `https://www.headhunters.lk/sitemap.xml` in GSC and Bing Webmaster Tools.
- [ ] **Milestone 1.9:** Claim and verify Google Business Profile with verified physical Colombo address and primary phone number.

---

## Phase 2: Core Commercial Landing Pages (Days 16–45)

### Objectives:
* Rank for high-intent employer searches (`recruitment agency sri lanka`, `executive search colombo`).
* Capture executive candidate CV submissions.

### Key Milestones & Tasks:
- [ ] **Milestone 2.1:** Launch `/recruitment-agency-sri-lanka/` targeting enterprise and mid-market employers.
- [ ] **Milestone 2.2:** Launch `/executive-search-sri-lanka/` targeting board chairs and executive committees.
- [ ] **Milestone 2.3:** Launch `/confidential-recruitment/` positioning Head Hunters as Colombo’s discreet search specialist.
- [ ] **Milestone 2.4:** Build dedicated `/employers/` briefing hub with clear SLA and fee structure overviews.
- [ ] **Milestone 2.5:** Build `/candidates/` executive registration portal with confidentiality assurances and CV upload.
- [ ] **Milestone 2.6:** Add schema markup (`Service`, `FAQPage`) across all new commercial pages.

---

## Phase 3: Authority Content & AI Grounding (Days 46–75)

### Objectives:
* Establish primary citation sources for LLMs (ChatGPT, Perplexity, Gemini).
* Fill the information gap in the Sri Lankan executive hiring market.

### Key Milestones & Tasks:
- [ ] **Milestone 3.1:** Author and publish pillar guide: *"How Executive Search Operates in Sri Lanka: Retained vs. Contingency"*.
- [ ] **Milestone 3.2:** Author and publish guide: *"Recruitment Agency Fee Structures & Retainers in Colombo"*.
- [ ] **Milestone 3.3:** Author and publish guide: *"The Boardroom Playbook: Executing Confidential C-Suite Successions in Sri Lanka"*.
- [ ] **Milestone 3.4:** Create company profiles on high-authority B2B directories:
  * Clutch.co
  * The Manifest
  * Outsource Accelerator
  * YellowPages.lk
- [ ] **Milestone 3.5:** Execute Month 1 run of the 50-Prompt AI Visibility Benchmark.

---

## Phase 4: Expansion & Brand Corroboration (Days 76–90)

### Objectives:
* Broaden footprint into specialized industry verticals.
* Build continuous review velocity and inbound brand search demand.

### Key Milestones & Tasks:
- [ ] **Milestone 4.1:** Launch sector landing pages:
  * `/finance-recruitment-sri-lanka/`
  * `/legal-recruitment-sri-lanka/`
  * `/hr-recruitment-sri-lanka/`
- [ ] **Milestone 4.2:** Establish a structured client testimonial collection workflow to secure genuine Google Business reviews.
- [ ] **Milestone 4.3:** Review GSC query impressions and optimize underperforming metadata based on live click-through rates.
- [ ] **Milestone 4.4:** Execute Month 2 run of the 50-Prompt AI Visibility Benchmark to quantify citation growth.

---

## KPIs & Governance

| Metric | Day 30 Target | Day 60 Target | Day 90 Target |
|---|---|---|---|
| **Indexed Pages (GSC)** | 100% of static + active jobs | 100% + core service pages | 100% + all pillar articles |
| **GSC Monthly Impressions** | 500+ | 3,000+ | 10,000+ |
| **Google Jobs Presence** | All active roles visible | All active roles visible | Top 3 placement for executive keywords |
| **AI Benchmark Inclusion** | Baseline (0-5%) | 15-25% inclusion | 40%+ recommendation rate across 50 prompts |
| **Google Business Reviews** | Claimed & Verified | 5+ verified client reviews | 15+ verified reviews (4.8+ rating) |
