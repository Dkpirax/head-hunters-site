# Head Hunters — Content Architecture & Keyword Mapping

This document details the page-by-page content architecture, metadata conventions, schema definitions, and content specifications for `headhunters.lk`.

---

## 1. Global SEO & Meta Architecture

### 1.1 Meta Tag Rules
* **Title Tag Formula:** `<Primary Subject / Target Keyword> — Colombo, Sri Lanka | Head Hunters` (Max 60 characters).
* **Meta Description Formula:** `Action-oriented summary incorporating secondary keyword and local USP.` (140–155 characters).
* **Canonical URL:** Self-referencing HTTPS URL on `https://www.headhunters.lk/` with trailing slash standard.
* **Open Graph:** Always provide `og:title`, `og:description`, `og:url`, `og:image` (1200x630px social banner), and `og:type`.

---

## 2. Page Specifications & Content Map

### Page 1: Homepage (`/`)
* **URL:** `https://www.headhunters.lk/`
* **Primary Keyword:** `recruitment agency sri lanka`, `headhunters sri lanka`
* **Title Tag:** `Head Hunters — Premier Recruitment Agency & Executive Search Sri Lanka`
* **Meta Description:** `Head Hunters is Sri Lanka’s executive search and recruitment consultancy. Confidential leadership acquisition, professional staffing, and workforce solutions in Colombo.`
* **H1:** `Executive Search & Precision Recruitment in Sri Lanka`
* **H2s:**
  * `Strategic Talent Acquisition for Modern Enterprises`
  * `Our Core Recruitment Disciplines`
  * `Confidential Executive & C-Suite Search`
  * `Active Leadership Opportunities`
* **Schema Types:** `Organization`, `EmploymentAgency`, `WebSite`
* **Word Count Target:** 1,000 – 1,200 words
* **Key CTA:** `Request a Talent Consultation` / `View Active Vacancies`

---

### Page 2: Core Service — Recruitment Agency Sri Lanka (`/recruitment-agency-sri-lanka/`)
* **URL:** `https://www.headhunters.lk/recruitment-agency-sri-lanka/`
* **Primary Keyword:** `recruitment agency sri lanka`, `staffing agency colombo`
* **Title Tag:** `Recruitment Agency Sri Lanka — Professional Corporate Staffing Colombo`
* **Meta Description:** `Partner with Sri Lanka’s dedicated recruitment agency. We deliver vetted professional talent across finance, operations, technology, and commercial leadership.`
* **H1:** `Professional Recruitment & Corporate Staffing in Sri Lanka`
* **H2s:**
  * `Comprehensive Talent Solutions for Colombo Businesses`
  * `Permanent Staffing vs. Specialized Search`
  * `Industries We Serve: Banking, Corporate, Tech & Manufacturing`
  * `Frequently Asked Questions About Staffing in Sri Lanka`
* **Schema Types:** `Service`, `FAQPage`
* **Word Count Target:** 1,200 – 1,500 words
* **Key CTA:** `Discuss Your Hiring Requirements`

---

### Page 3: Core Service — Executive Search Sri Lanka (`/executive-search-sri-lanka/`)
* **URL:** `https://www.headhunters.lk/executive-search-sri-lanka/`
* **Primary Keyword:** `executive search sri lanka`, `headhunters colombo`
* **Title Tag:** `Executive Search Sri Lanka — C-Suite & Leadership Headhunters Colombo`
* **Meta Description:** `Specialized executive search firm in Colombo. Identifying and securing transformational CEOs, CFOs, Managing Directors, and board members across Sri Lanka.`
* **H1:** `Executive Search & Leadership Headhunting in Sri Lanka`
* **H2s:**
  * `Retained Executive Search Methodology`
  * `Targeting Passive Senior Leadership Talent`
  * `Our 6-Stage Executive Assessment Framework`
  * `Confidentiality & Non-Disclosure Governance`
* **Schema Types:** `Service`, `FAQPage`
* **Word Count Target:** 1,200 – 1,600 words
* **Key CTA:** `Initiate a Confidential Search`

---

### Page 4: Core Service — Confidential Recruitment (`/confidential-recruitment/`)
* **URL:** `https://www.headhunters.lk/confidential-recruitment/`
* **Primary Keyword:** `confidential recruitment sri lanka`, `discreet executive search colombo`
* **Title Tag:** `Confidential Recruitment Sri Lanka — Discreet Leadership Hiring Colombo`
* **Meta Description:** `Execute sensitive leadership replacements without market disclosure. Head Hunters manages discreet, NDA-protected executive searches across Sri Lanka.`
* **H1:** `Confidential & Discreet Executive Recruitment in Sri Lanka`
* **H2s:**
  * `When is a Confidential Search Required?`
  * `Protecting Shareholder & Market Sensitivity`
  * `Candidate Vetting Under Multi-Stage Non-Disclosure Agreements`
  * `Case Scenarios: C-Suite Replacement & Unannounced Expansion`
* **Schema Types:** `Service`, `FAQPage`
* **Word Count Target:** 1,000 – 1,300 words
* **Key CTA:** `Book a Private Consultation`

---

### Page 5: Employers Hub (`/employers/`)
* **URL:** `https://www.headhunters.lk/employers/`
* **Primary Keyword:** `hire staff sri lanka`, `corporate talent acquisition colombo`
* **Title Tag:** `Employer Hiring Solutions — Talent Acquisition & Staffing Sri Lanka`
* **Meta Description:** `Discover how Head Hunters accelerates hiring for Sri Lankan and multinational companies. Guaranteed candidate placement, rigorous screening, and market salary data.`
* **H1:** `Employer Talent Solutions: Find Your Next Strategic Hire`
* **H2s:**
  * `Our Recruitment Process: From Briefing to Placement`
  * `Our Replacement Guarantee & Quality SLA`
  * `Submit a Job Brief or Hiring Query`
* **Schema Types:** `Service`, `ContactPage`
* **Word Count Target:** 800 – 1,000 words
* **Key CTA:** `Submit a Vacancy Brief`

---

### Page 6: Candidates Hub (`/candidates/`)
* **URL:** `https://www.headhunters.lk/candidates/`
* **Primary Keyword:** `submit cv recruitment agency sri lanka`, `executive careers colombo`
* **Title Tag:** `Candidate Career Network — Submit Your CV | Head Hunters Sri Lanka`
* **Meta Description:** `Take the next step in your executive career. Register your confidential profile with Head Hunters Colombo to be considered for unadvertised leadership roles.`
* **H1:** `Executive & Professional Career Advisory in Sri Lanka`
* **H2s:**
  * `Submit Your CV for Confidential Placement`
  * `Why Register with Head Hunters? (No Candidate Fees)`
  * `Candidate Confidentiality Promise`
  * `Candidate FAQs`
* **Schema Types:** `FAQPage`, `WebPage`
* **Word Count Target:** 800 – 1,000 words
* **Key CTA:** `Submit CV Securely`

---

### Page 7: Vacancy Index & Individual Job Listings (`/jobs/` and `/jobs/:slug`)
* **Job Index:** `https://www.headhunters.lk/jobs/`
  * **Title Tag:** `Job Vacancies in Sri Lanka — Executive & Professional Careers | Head Hunters`
  * **H1:** `Current Career Opportunities in Sri Lanka`
  * **Schema:** `ItemList`
* **Individual Job Page:** `https://www.headhunters.lk/jobs/:slug`
  * **Title Tag:** `[Job Title] — [Location] | Head Hunters Sri Lanka`
  * **Meta Description:** `[Job Title] vacancy in [Location]. [Snippet of description]. Apply confidentially with Head Hunters Sri Lanka.`
  * **H1:** `[Job Title]`
  * **H2s:** `Role Overview`, `Key Responsibilities`, `Qualifications & Experience`, `Application Instructions`
  * **Schema:** `JobPosting` (Google Jobs compliant)

---

## 3. Informational Thought Leadership Map (AI Citation Pillars)

These in-depth guides are designed to answer complex search queries and serve as reference data for LLM grounding:

| URL Slug | Target Query | Primary Objective |
|---|---|---|
| `/insights/how-executive-search-works/` | how executive search works in sri lanka | Demystify search methodology and position Head Hunters as the leading consultative authority in Colombo. |
| `/insights/recruitment-agency-fees-sri-lanka/` | recruitment agency fees sri lanka | Objective, transparent breakdown of percentage fee models, retained vs. contingency structures, and billing practices. |
| `/insights/retained-vs-contingency-search/` | retained vs contingency search sri lanka | Guide board members on choosing between risk-free contingency staffing vs. dedicated retained executive search. |
| `/insights/ceo-recruitment-confidential/` | confidential ceo recruitment process colombo | Tactical playbook for board chairs executing high-stakes executive succession quietly. |
