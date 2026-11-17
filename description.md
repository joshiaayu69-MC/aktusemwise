# AKTU Study Resources Platform — Project Description & Agent Handbook

> **Read this entire file before making any change.** This is the source of truth for the
> project's goal, architecture, content model, legal constraints, workflow, and quality bar.
> If something in this document conflicts with an instruction from the user, ask the user.

**Status at time of writing:** greenfield. The repository is empty. Phase 1 has not started.
**Domain/brand:** TBD. Placeholders used below: `yourbrand.in`, `files.yourbrand.in`.
Do **not** buy or configure a domain without explicit user approval.

---

## 1. What we are building

A fast, genuinely free study-resource website for **Dr. A.P.J. Abdul Kalam Technical
University (AKTU), Lucknow** students. It organizes, by course → branch → scheme → semester →
subject:

- Syllabus (structured, unit-wise)
- Notes (original, unit-wise)
- Previous year question papers (PYQ) + original solutions
- Model papers, question banks
- Lab files, viva questions
- Exam tools (CGPA calculator, result guide, quiz, countdown)
- AKTU news/updates blog

The goal is to be **better than notesgallery.com and aktunotes.in** on speed, clarity,
completeness, and trust — while staying free for students.

### Competitive position

| Competitor | Weakness we exploit |
|---|---|
| notesgallery.com | WordPress bloat, ad clutter, messy navigation, slow on low-end phones |
| aktunotes.in | Premium paywalls, login friction, fewer free resources |

**Our edge:** static-first speed, zero-JS pages, no login for free content, one clean subject
hub (notes + PYQ + solutions + syllabus), instant search, mobile-first UX, original
exam-focused content, no countdown/fake download buttons.

**Reality check:** content is the moat, not code. A beautiful empty site loses to a plain site
with complete resources. Never sacrifice content quality for UI polish.

---

## 2. Success criteria

- A student can reach any subject resource in **3 clicks or fewer**.
- Mobile Lighthouse: Performance, Accessibility, Best Practices, SEO **≥ 95**.
- LCP **< 1.5 s** on simulated 4G, HTML **< 50 KB** gzipped.
- **100% free** downloads, **no login** required for free content.
- Hosting cost is **₹0** (excluding domain) until documented thresholds are crossed.
- **Zero copyright complaints.** Every published resource has a documented source/licence.
- At launch: **20–30 complete subjects**, not 500 empty pages.
- Within 90 days: every B.Tech first-year subject + CSE semester 3 complete.

---

## 3. Non-negotiable rules (read this before coding)

1. **Static-first.** Every public page is pre-rendered at build time. Never set
   `export const prerender = false` on content pages. Never SSR page views.
2. **Only `/api/*` runs Worker code.** Page views and PDF downloads must never invoke a Worker.
3. **PDFs live in Cloudflare R2**, never in Git, never in the Worker bundle, never in `public/`.
4. **No "AKTU" in the domain or brand name.** Use AKTU only in titles/content/URL paths as a
   descriptor. See §14.
5. **Never scrape or re-upload** competitor sites, Telegram/WhatsApp PDFs, publisher books, or
   the "Quantum" series. See §13.
6. **No login wall, countdown, fake download button, or ad interstitial** on free resources.
7. **No SPA, no client-side routing for content, no heavy UI kit.** Astro + Tailwind only.
8. **No secrets in the repo.** Use `wrangler secret` / environment bindings.
9. **Do not deploy, commit, or create a PR unless the user explicitly asks.**
10. **Content must be original or properly licensed** and must have a source URL recorded.
11. **Do not invent AKTU data.** Subject codes, schemes, papers, and years must come from
    official/verified sources. If unsure, leave a `TODO` and ask.
12. **Mobile-first and accessible:** keyboard navigable, visible focus, semantic HTML, alt text,
    WCAG AA contrast, 44px minimum tap targets.

---

## 4. Architecture

```
Browser
  │
  ▼
Cloudflare CDN / Workers Static Assets
  ├── /, /courses, /btech, /btech/cse/sem-5, /subject/bcs501   → prebuilt HTML (FREE, unlimited)
  ├── /pagefind/*                                              → static search index (FREE)
  ├── /_astro/*                                                → hashed CSS/JS/images (FREE)
  └── /api/* (only when enabled)                               → Hono Worker → D1 / KV
                                                                  (100k req/day on Free plan)

PDF downloads:
  Browser → files.yourbrand.in (R2 custom domain) → Cloudflare edge cache → R2
            (no Worker, no egress fees, 10 GB free storage)
```

### Why this architecture

- Cloudflare Workers **static asset requests are free and unlimited**.
- Only Worker-code requests count toward the 100k/day free limit.
- R2 has **zero egress fees**, so PDF downloads do not create bandwidth bills.
- Static HTML + Pagefind means near-zero runtime cost and excellent Core Web Vitals.

### Hard constraints

| Constraint | Value (Nov 2026, verify before launch) |
|---|---|
| Static files per Worker version (Free) | 20,000 |
| Static files per Worker version (Paid) | 100,000 |
| Individual static file size | 25 MiB |
| Worker-code requests (Free) | 100,000/day |
| Worker CPU time (Free) | 10 ms/invocation |
| D1 Free | 5 GB, 5M rows read/day, 100k rows written/day |
| R2 Free | 10 GB-month, 1M Class A ops, 10M Class B ops/month, free egress |
| KV Free | 100k reads/day, 1k writes/day, 1 GB |
| Workers Paid | $5/month minimum, 10M requests/month, 100k files |

**File-budget rule:** 1 HTML per subject hub. Do not generate duplicate subject pages under
every branch. If the build approaches ~15,000 files, consolidate tabs or plan a Workers Paid
upgrade. Never silently exceed the 20k limit.

---

## 5. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Astro (latest) + TypeScript strict | `output: 'static'` |
| Styling | Tailwind CSS v4 | Small custom components, no heavy UI kit |
| Content | Astro Content Collections + Zod + YAML/MDX | YAML for subject registry, MDX for blog |
| Search | Pagefind | Build-time index, filters, Ctrl+K palette |
| PDF storage | Cloudflare R2 + custom domain | Public read, immutable cache headers |
| API (optional) | Hono on Workers | Only `/api/*`, prepared statements |
| Database (optional) | Cloudflare D1 | Counters, feedback, leads, purchases |
| Cache/limits (optional) | Workers KV | Short TTL cache, rate-limit counters |
| Hosting | Cloudflare Workers Static Assets | Use Workers, not legacy Pages |
| CI/CD | Workers Builds + GitHub | `npm run build` → `wrangler deploy` |
| Analytics | Cloudflare Web Analytics | Cookieless, no consent banner needed |
| Forms | Tally/Formspree or Resend + Worker | Turnstile if user-generated |
| Images | Astro build-time `sharp`, WebP/AVIF | No runtime image service |
| Icons/fonts | Lucide (ISC), Fontsource (OFL) | Self-host, subset fonts |
| Testing | Vitest, Playwright, Lighthouse CI, lychee | Run before release |
| Lint/format | Biome or ESLint + Prettier | Pick one, keep consistent |

**Explicitly rejected:** WordPress, Next.js SSR for content, SPA, Supabase/Postgres at MVP,
Algolia, Cloudflare Images, Cloudflare Pro ($20/mo) before revenue.

---

## 6. Repository layout (target)

```
aktu-notes/
├─ README.md
├─ description.md              ← this file
├─ astro.config.mjs
├─ wrangler.jsonc
├─ package.json
├─ tsconfig.json
├─ public/
│  ├─ _headers
│  ├─ _redirects
│  ├─ robots.txt
│  └─ og/
├─ src/
│  ├─ content.config.ts        ← Zod schemas
│  ├─ content/
│  │  ├─ subjects/*.yaml
│  │  └─ blog/*.mdx
│  ├─ data/
│  │  ├─ courses.yaml
│  │  ├─ branches.yaml
│  │  └─ schemes.yaml
│  ├─ components/
│  ├─ layouts/
│  ├─ lib/
│  ├─ styles/
│  └─ pages/
│     ├─ index.astro
│     ├─ courses/index.astro
│     ├─ [course]/index.astro
│     ├─ [course]/[branch]/index.astro
│     ├─ [course]/[branch]/sem-[n].astro
│     ├─ subject/[code]/index.astro
│     ├─ tools/cgpa-calculator.astro
│     └─ blog/[...slug].astro
├─ worker/
│  └─ index.ts                 ← add only when API is required
├─ migrations/                 ← D1 migrations
├─ scripts/
│  ├─ validate-content.ts
│  ├─ check-file-count.ts
│  ├─ make-thumbs.ts
│  └─ upload-pdfs.ts
└─ tests/
```

---

## 7. URL structure and canonical rules

```
/courses
/btech
/btech/cse
/btech/cse/sem-5
/subject/bcs501                        ← canonical subject hub (one HTML, tabs inside)
/subject/bcs501/notes                  ← split only for high-traffic subjects
/subject/bcs501/pyq
/subject/bcs501/syllabus
/blog/aktu-exam-date-2026
/tools/cgpa-calculator
```

Rules:

- The **subject page by code is canonical**. Do not create one subject page per branch.
- Branch/semester pages are unique list pages with unique intros; they link to canonical
  subject pages.
- Use `rel="canonical"` on every page.
- Use stable slugs: lowercase, hyphenated, no dates in subject URLs.
- Include scheme in data, not necessarily in the URL. If schemes produce different syllabi,
  add a scheme selector on the subject page.
- Old URLs must redirect with 301 via `_redirects`; never break indexed URLs.

---

## 8. Content model

### 8.1 Taxonomy data (`src/data/`)

```yaml
# courses.yaml
- slug: btech
  name: B.Tech
  full_name: Bachelor of Technology
  duration_years: 4
  semesters: 8
  order: 1

# branches.yaml
- slug: cse
  course: btech
  name: CSE
  full_name: Computer Science and Engineering
  aliases: [computer-science, computer-engineering]
  order: 1

# schemes.yaml
- slug: 2022-23
  label: 2022-23 Scheme
  active: true
- slug: 2026-27
  label: 2026-27 Scheme (NEP/AICTE)
  active: true
```

### 8.2 Subject schema (`src/content/subjects/<code>.yaml`)

Required fields:

```yaml
code: BCS501
name: Database Management System
course: btech
branches: [cse, it, aiml, cse-ai]
semester: 5
scheme: 2022-23
credits: 4
source_url: https://aktu.ac.in/syllabus.html
verified: true
description: >
  Unique 150–300 word overview: what the subject covers, exam pattern, unit breakdown,
  and how to prepare. Must not be copied from any other site.
syllabus_units:
  - unit: 1
    title: Introduction to DBMS
    topics: [DBMS architecture, data models, DBA roles, three-schema architecture]
resources:
  - type: notes
    title: Complete Unit 1–5 Notes
    r2_key: bcs501/notes/bcs501-notes-2025.pdf
    pages: 118
    size_mb: 4.2
    updated: 2026-08-01
    verified: true
    source: original
  - type: pyq
    title: 2024–25 End Semester Paper
    r2_key: bcs501/pyq/bcs501-2024-25.pdf
    year: 2024-25
    official_url: https://aktu.ac.in/old-question-paper.html
    verified: true
  - type: solution
    title: 2024–25 Solved Paper
    r2_key: bcs501/solutions/bcs501-2024-25-solved.pdf
    year: 2024-25
    verified: true
    source: original
```

Allowed `type` values:
`notes | pyq | solution | model-paper | question-bank | lab-file | viva | syllabus | important-questions`

Allowed `source` values:
`original | contributor | open-license | official-link`

Validation rules (enforced by `scripts/validate-content.ts`):

- `code` unique, uppercase, matches pattern `^[A-Z]{2,5}\d{3}[A-Z]?$` (adjust only with user approval).
- `course` and `branches` exist in taxonomy files.
- `semester` is an integer within the course's range.
- `scheme` exists and is not retired for that subject.
- `source_url` or `official_url` present for syllabus/PYQ.
- Every resource's `r2_key` exists in R2 (`--remote` check) or is marked `TODO`.
- No duplicate `(code, type, year, title)` combinations.
- `description` length 150–300 words and not duplicated across subjects.
- `verified: true` only when a human has checked the source.
- Pages only generated for subjects with at least one resource or syllabus units.
- No empty/thin pages: do not publish a subject with zero useful content.

### 8.3 Resource naming convention

```
{code}/{type}/{code}-{type}-{unit|year}.pdf
bcs501/notes/bcs501-notes-unit-1.pdf
bcs501/pyq/bcs501-pyq-2024-25.pdf
bcs501/solutions/bcs501-solution-2024-25.pdf
```

Lowercase, hyphens only, no spaces, no personal names, no version suffixes like `final2`.

---

## 9. Content workflow

```
Official syllabus / verified paper / contributor submission
        │
        ▼
Human review + originality check + licence recorded
        │
        ▼
PDF compress / linearize → cover thumbnail (WebP)
        │
        ▼
wrangler r2 object put  →  YAML update  →  git commit  →  Workers Build  →  deploy
```

### PDF upload command

```powershell
npx wrangler r2 object put aktu-pdfs/bcs501/notes/bcs501-notes-2025.pdf `
  --file .\bcs501-notes-2025.pdf --content-type application/pdf --remote
```

Bulk uploads: `rclone` against the R2 S3-compatible endpoint, or `scripts/upload-pdfs.ts`.

### PDF processing rules

- Linearize with `qpdf --linearize`.
- Downsample scans to ~150 DPI; target < 8 MB per PDF.
- Generate first-page thumbnail as WebP at build time (`pdftoppm` + `sharp`).
- Keep the original only if it is under 25 MiB (Cloudflare per-file limit).
- Never commit PDFs to Git. Add `*.pdf` to `.gitignore` except tiny test fixtures.

### Admin options (in order)

1. VS Code + YAML commit (default, start here).
2. Google Sheet → CSV → `scripts/import.ts`.
3. Sveltia CMS / Keystatic with GitHub OAuth.
4. Custom `/admin` Worker protected by **Cloudflare Access** (free up to 50 users).
   GitHub token and R2 credentials are Worker secrets only.

### Contributor workflow

- Submission form includes consent checkbox and licence text (see §13).
- Record form response/email as proof.
- Check for copying before publishing.
- Credit the contributor on the resource.
- Honour takedown requests within 48 hours; keep a log.

---

## 10. Build, run, deploy

### Scaffold (Phase 1)

```powershell
npm create astro@latest . -- --template minimal --typescript strict --install --git
npx astro add tailwind mdx sitemap --yes
npm i -D wrangler pagefind
npm i hono zod
```

### `astro.config.mjs`

```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://yourbrand.in',
  output: 'static',
  integrations: [tailwind(), mdx(), sitemap()],
});
```

### `package.json` scripts

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build && pagefind --site dist",
    "preview": "wrangler dev",
    "deploy": "npm run build && wrangler deploy",
    "validate": "tsx scripts/validate-content.ts",
    "check:files": "tsx scripts/check-file-count.ts"
  }
}
```

### `wrangler.jsonc` — static-only MVP

```jsonc
{
  "name": "aktu-notes",
  "compatibility_date": "2026-11-16",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page"
  }
}
```

### `wrangler.jsonc` — with API (only when needed)

```jsonc
{
  "name": "aktu-notes",
  "main": "worker/index.ts",
  "compatibility_date": "2026-11-16",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": "./dist",
    "binding": "ASSETS",
    "not_found_handling": "404-page",
    "run_worker_first": ["/api/*"]
  },
  "d1_databases": [{ "binding": "DB", "database_name": "aktu", "database_id": "..." }],
  "r2_buckets": [{ "binding": "PDFS", "bucket_name": "aktu-pdfs" }],
  "observability": { "enabled": true }
}
```

**Critical:** `run_worker_first` must contain **only** `/api/*`. Adding page routes there makes
every page view count against the 100k/day Worker limit.

### Deploy

```powershell
npm run validate
npm run build
npx wrangler deploy
```

Do not run deploy unless the user asks. Workers Builds should deploy on push to `main` once
the user has approved the setup.

---

## 11. Frontend requirements

- Semantic HTML: one `<h1>` per page, proper heading order, `<nav>`, `<main>`, `<article>`.
- Mobile-first: 360px baseline, fluid type, 44px touch targets.
- Dark mode via `prefers-color-scheme` + optional toggle persisted in `localStorage`.
- Sticky subject navigation for units; tabs for resource types on the canonical subject page.
- PDF UX: native in-browser preview (`<iframe>` or new tab), file size, pages, last updated,
  direct download link. No login, no timer, no redirect ads.
- Search: Pagefind with `Ctrl/Cmd+K`, filters for course/branch/semester, keyboard accessible.
- Personalization without accounts: "My semester" and syllabus checkboxes in `localStorage`.
- Empty states and 404 pages must be helpful, with search and subject links.
- No layout shift: set image dimensions, preload critical fonts, use `font-display: swap`.
- Lazy-load below-the-fold images and PDF previews.
- All images have `alt`; decorative images use empty `alt`.

### Pagefind instrumentation

```html
<article
  data-pagefind-body
  data-pagefind-meta="title:BCS501 DBMS Notes"
  data-pagefind-filter="course:btech"
  data-pagefind-filter="semester:5">
  ...
</article>
```

Use `data-pagefind-ignore` on navigation, footers, and repeated boilerplate.

### `public/_headers`

```
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

Add a CSP once third-party scripts are finalized. Prefer no third-party scripts.

---

## 12. SEO requirements

Every content page must have:

- Unique `<title>` and meta description written for search intent, e.g.
  `BCS501 DBMS Notes, PYQ & Syllabus — AKTU Sem 5 | YourBrand`.
- One canonical URL.
- Open Graph + Twitter card + auto-generated OG image.
- Breadcrumb navigation matching `BreadcrumbList` JSON-LD.
- Structured data: `Course` (course/branch pages), `LearningResource` (resources),
  `FAQPage` (subject FAQs), `BreadcrumbList`.
- Descriptive internal links (anchor text = subject/topic, never "click here").
- "Last updated" and, where applicable, "Syllabus verified" badges.
- Sitemap inclusion, Pagefind inclusion, and at least 2 internal inbound links.
- No thin pages: each subject needs a unique 150–300 word overview.

Global:

- `sitemap-index.xml` via `@astrojs/sitemap`; split before 50k URLs.
- `robots.txt` references the sitemap.
- Submit to Google Search Console, Bing Webmaster Tools, and IndexNow.
- Canonical subject URLs; no duplicate branch variants.
- Blog for freshness (datesheets, results, circulars) with accurate dates and sources.
- Weekly Search Console review; add pages for real queries, not guesses.

---

## 13. Copyright and content sourcing (critical)

**This is the largest project risk. "Free to download" does not mean "free to re-upload."**

### Official AKTU sources — link and paraphrase

| Source | Use |
|---|---|
| `https://aktu.ac.in/syllabus.html` | Official syllabus. Link it. Reproduce facts (codes, units, topics, credits, marks) as your own structured data with attribution |
| `https://aktu.ac.in/old-question-paper.html` | Official PYQ portal. Link as "Official AKTU paper". Transcribe questions; write your own solutions |
| `https://aktu.ac.in/` | Notices, circulars, datesheets. Quote facts + link |

Facts (subject codes, question text, marks, unit topics) can be expressed in your own words.
Exact prose, scans, layout, and diagrams are protected. Do not re-host official PDFs without
written permission.

### Open-licence sources

| Source | Licence | Host? |
|---|---|---|
| OpenStax (`openstax.org`) | Mostly CC BY 4.0 | Yes, with attribution + change notice |
| LibreTexts (`libretexts.org`) | Per page (CC BY / BY-SA / BY-NC-SA / CC0) | Yes, only BY/SA/CC0; avoid NC if monetized |
| Open Textbook Library | Varies | Check per book |
| MIT OpenCourseWare | CC BY-NC-SA 4.0 | Non-commercial only; link if ads |
| Wikibooks | CC BY-SA | Yes, share-alike applies |
| Wikimedia Commons | Per file | Yes, per-file attribution |
| Openverse | Various CC | Yes, per item |
| data.gov.in | GODL-India | Yes, attribution |
| Project Gutenberg | Public domain (mostly) | Yes, old works only |
| NCERT, NPTEL, SWAYAM, Virtual Labs, e-PG Pathshala, NDLI | Copyrighted / varied | **Link only** |

Attribution template:

> Adapted from *[Book]* by [Author], [Publisher], licensed under CC BY 4.0.
> Changes: condensed and mapped to the AKTU syllabus.

Keep attribution in the page and in `CREDITS.md`. Comply with share-alike when adapting
CC BY-SA material.

### Never use

- "Quantum" series PDFs, publisher textbooks, coaching material.
- Scans/content from notesgallery, aktunotes, aktuquestionpaper.com, kopykitab,
  lastmomenttuitions, or any similar aggregator.
- Telegram/WhatsApp PDFs of unknown origin.
- YouTube transcripts, paid course notes, question banks from publishers.
- Any source marked "All rights reserved" or with unclear licensing.
- AI-generated "notes" published without human review and originality checking.

### Contributor licence (required text on submission)

> "I confirm that I created this material or have written permission to share it. I grant
> [Site] a worldwide, non-exclusive, royalty-free, sublicensable licence to host, display,
> adapt and distribute it with credit to me. I understand it may be removed after a valid
> takedown request."

Maintain a takedown/grievance page and respond within 48 hours. If public uploads scale,
check India's IT Rules 2021 intermediary obligations. This document is not legal advice;
get an Indian IP lawyer to review before commercial launch.

---

## 14. Branding and trademark rules (critical)

**Do not put "AKTU" in the domain or brand name.** Universities can enforce name rights through
passing off / unfair competition even without a registered trademark. Domain disputes in India
go through INDRP (`.in`) or UDRP (`.com`), and commercial use + confusing similarity is a bad
combination.

### Risk ladder

| Usage | Risk |
|---|---|
| `aktu.com`, `aktunotes.com`, `aktu.in`, `aktu-notes.in` | **High** |
| `aktu.yourbrand.in` subdomain | Medium-high |
| `yourbrand.in/aktu/btech/cse/sem-5` | **Low** |
| Title tag "AKTU B.Tech Notes | YourBrand" | Low (descriptive) |
| `@aktu...` social handle | Medium |
| AKTU logo/seal, "Official", official colours/fonts | **Very high** |

### Required branding rules

- Brandable domain and name: `yourbrand.in`, not an AKTU variation.
- "AKTU" may appear in page titles, headings, content, and URL paths as a descriptor.
- Never write "official AKTU notes", "AKTU official website", or imply endorsement.
- Never use the AKTU logo, seal, or a confusingly similar visual identity.
- Do not use `.ac.in` (restricted to institutions).
- Add this disclaimer to the footer, About page, and Disclaimer page:

> "YourBrand is an independent student resource. It is not affiliated with, endorsed by, or
> connected to Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow. AKTU names and
> marks belong to their respective owners. Syllabus and question papers are referenced for
> educational purposes only."

- Check `https://tmrsearch.ipindia.gov.in/` for "AKTU" and for the proposed brand in classes
  16, 41, 42. Check WHOIS/domain history before buying.
- If the user already owns an AKTU domain: do not build the brand on it; redirect to the
  brandable domain, remove official styling, and be ready to drop it.
- If a notice arrives: do not ignore it. Remove confusing branding/content, respond, and seek
  legal advice.

The current folder name `aktu.com` is **not** evidence that the domain is owned or safe to use.

---

## 15. Privacy, security, and analytics

- Analytics: **Cloudflare Web Analytics only** at MVP. No Google Analytics, no pixels, no
  third-party trackers unless requested.
- Cookies: avoid them. If added, provide a consent mechanism and update the privacy policy.
- Forms: Tally/Formspree free tier or Resend + Worker + Turnstile. Never expose API keys.
- Admin: Cloudflare Access or a Worker secret; never a client-side password.
- API: validate input with Zod, parameterized D1 queries only, rate-limit writes, CORS locked
  to the production domain.
- Headers: HSTS, nosniff, frame-ancestors, referrer policy, permissions policy.
- No card data on the site. For future premium, use Razorpay hosted checkout (redirect) and
  signed R2 URLs; Cloudflare free-plan terms prohibit collecting card details on free services.
- Backups: content in Git; `wrangler d1 export` on a schedule; R2 object versioning for PDFs.
- Monitoring: Cloudflare observability; optional Sentry free tier and UptimeRobot.
- Never log personal data. Minimize collection.

---

## 16. Free-tier budget and upgrade triggers

| Trigger | Action | Cost |
|---|---|---|
| > 100k Worker requests/day | Workers Paid | $5/mo |
| > 20k static files | Workers Paid (100k files) | $5/mo |
| > 10 GB PDFs in R2 | R2 paid storage | ~$0.015/GB-mo |
| > 5M D1 reads/day or > 100k writes/day | Workers Paid | included in $5 |
| > 3,000 Workers Build minutes/month | Build locally / GitHub Actions | $0 |
| Need advanced WAF/bot management | Cloudflare Pro | $20/mo — **not needed initially** |

**Do not buy Cloudflare Pro or any paid add-on without explicit user approval.** Monitor usage
monthly in the Cloudflare dashboard: Worker requests, static file count, R2 storage/ops, D1
reads/writes, build minutes.

Traffic model: static pages are unlimited; R2 includes 10M Class B ops/month (~333k/day before
edge caching benefits); PDF egress is free.

---

## 17. Roadmap and acceptance criteria

### Phase 0 — Decisions and setup (1–2 days)
- [ ] Brandable name + domain chosen and approved by user.
- [ ] GitHub + Cloudflare accounts; Web Analytics enabled.
- [ ] Privacy, Terms, Disclaimer, Takedown pages drafted.
- [ ] First 30 subjects and content sources agreed.
- [ ] Trademark sanity check for the brand.

### Phase 1 — Scaffold (0.5 day)
- [ ] Astro + Tailwind + MDX + sitemap builds.
- [ ] `wrangler.jsonc` with static assets; deploy to `*.workers.dev` succeeds.
- [ ] `description.md`, `.gitignore`, README in place.

### Phase 2 — Design system (3–5 days)
- [ ] Layouts, header/footer, subject cards, resource cards, breadcrumbs, search modal.
- [ ] Mobile, dark mode, accessibility checks pass.
- [ ] Lighthouse ≥ 95 on a sample page.

### Phase 3 — Content model and routes (1–2 weeks)
- [ ] Taxonomy YAML + Zod schemas validate.
- [ ] Course/branch/semester/subject routes build from data.
- [ ] Pagefind index works; Ctrl+K search with filters.
- [ ] 20–30 complete subjects published with unique descriptions.

### Phase 4 — PDFs and downloads (3–5 days)
- [ ] R2 bucket + custom domain configured.
- [ ] PDFs compressed, uploaded, thumbnails generated.
- [ ] Downloads direct from R2; native preview works on mobile.
- [ ] 404s and missing files handled gracefully.

### Phase 5 — SEO and analytics (2–3 days)
- [ ] Metadata, canonical, OG images, JSON-LD, sitemap, robots.
- [ ] Search Console and Bing verified; sitemaps submitted.
- [ ] Analytics live; no console errors.

### Phase 6 — Pipeline and admin (2–3 days)
- [ ] Content validation + file-count check in CI.
- [ ] Workers Builds auto-deploy from `main`.
- [ ] Optional admin upload protected by Cloudflare Access.
- [ ] Backup/export procedure documented.

### Phase 7 — Launch (2–3 days)
- [ ] Full QA: links, downloads, mobile, accessibility, structured data.
- [ ] Disclaimer, privacy, terms, takedown live.
- [ ] Launch checklist signed off by user.

### Phase 8 — Growth (ongoing)
- [ ] Weekly content cadence (5–10 subjects + PYQ sets).
- [ ] Tools: CGPA calculator, quiz, result guide, countdown.
- [ ] Accounts/bookmarks only when users ask.
- [ ] Ads/affiliate/sponsorships only after content quality is proven.
- [ ] Premium (optional): Razorpay hosted checkout + signed R2 URLs + D1.

### Definition of done for a subject page

- [ ] Valid YAML, passes `npm run validate`.
- [ ] Unique 150–300 word description.
- [ ] Syllabus units with source URL.
- [ ] At least one downloadable resource, or it is not published.
- [ ] R2 keys resolve; PDF size < 25 MiB.
- [ ] Canonical URL, title, meta, OG image, JSON-LD.
- [ ] Pagefind-indexed and in sitemap.
- [ ] At least 2 internal links in and 2 out.
- [ ] Mobile + keyboard + Lighthouse checks pass.

---

## 18. Agent working rules

### Before making changes
1. Read this file and the existing repo structure.
2. Check for existing conventions in neighboring files before adding new patterns.
3. Confirm the task fits the architecture; if it requires SSR, a new paid service, a domain,
   or copyrighted content, stop and ask the user.
4. Never assume a library is installed; check `package.json`.

### Must do
- Keep public pages prerendered (`output: 'static'`).
- Keep `/api/*` the only Worker-first routes.
- Update the content schema and validation script together.
- Run `npm run validate`, `npm run build`, and `npm run check:files` after content changes.
- Run lint/typecheck after code changes.
- Use semantic HTML, accessible components, and `alt` text.
- Preserve existing URLs; add 301 redirects when changing them.
- Add attribution/licence details for any third-party content.
- Use `wrangler secret` for secrets; never hardcode keys.
- Prefer small, focused changes; do not refactor unrelated code.

### Must not do
- Do not deploy, commit, push, or open a PR unless explicitly asked.
- Do not add AKTU to the domain/brand, or use the AKTU logo/seal.
- Do not scrape, copy, or re-upload copyrighted PDFs/content.
- Do not invent subject codes, schemes, papers, years, or "verified" data.
- Do not publish thin/empty subject pages.
- Do not put PDFs or large binaries in Git.
- Do not add analytics, ads, cookies, chatbots, or third-party scripts without approval.
- Do not introduce SSR, a SPA, a heavy UI kit, or a database without approval.
- Do not route page views through the Worker.
- Do not bypass validation or commit failing builds.
- Do not add AI-generated content without human review and originality checking.
- Do not add comments unless they clarify non-obvious logic.

### When uncertain
- Leave a clear `TODO:` with the exact question.
- Ask the user for the missing source, decision, or approval.
- Prefer linking to official sources over re-hosting questionable files.
- Prefer omitting a page over publishing inaccurate content.

---

## 19. Explicit out-of-scope for MVP

- User accounts, purchases, premium downloads.
- Comments/community features (Giscus can come later).
- Mobile apps.
- AI chat/quiz generation.
- Multi-university support (architecture should allow it, but content stays AKTU-first).
- Hindi/regional translations beyond light Hinglish microcopy.

---

## 20. Reference links

- Astro docs: https://docs.astro.build
- Astro + Cloudflare deploy: https://docs.astro.build/en/guides/deploy/cloudflare/
- Cloudflare Workers static assets: https://developers.cloudflare.com/workers/static-assets/
- Workers pricing and limits: https://developers.cloudflare.com/workers/platform/pricing/
- R2 pricing: https://developers.cloudflare.com/r2/pricing/
- D1 docs: https://developers.cloudflare.com/d1/
- Pagefind docs: https://pagefind.app
- Cloudflare Web Analytics: https://developers.cloudflare.com/web-analytics/
- AKTU official: https://aktu.ac.in/
- AKTU syllabus: https://aktu.ac.in/syllabus.html
- AKTU old question papers: https://aktu.ac.in/old-question-paper.html
- IP India trademark search: https://tmrsearch.ipindia.gov.in/
- Creative Commons licences: https://creativecommons.org/licenses/
- GODL-India: https://www.data.gov.in/government-open-data-license-india
- OpenStax: https://openstax.org
- LibreTexts: https://libretexts.org
- MIT OCW: https://ocw.mit.edu
- Wikimedia Commons: https://commons.wikimedia.org

---

## 21. Open decisions (ask the user)

- Final brand name and domain.
- Whether the repo is public or private.
- Whether user accounts are needed at launch (default: no).
- Whether/when to enable ads (default: after content quality is proven).
- Primary seed courses/branches after B.Tech first year + CSE sem 3.
- Who reviews/verifies content before `verified: true`.

---

## 22. One-paragraph summary for a new agent

Build a static-first Astro site deployed to Cloudflare Workers Static Assets, with content in
Git YAML/MDX, search via Pagefind, PDFs in R2 behind a custom domain, and a tiny Hono `/api/*`
Worker plus D1 only when dynamic features are needed. Every public page is pre-rendered so
requests stay free and fast. Use a brandable domain, never put AKTU in it, and include a clear
non-affiliation disclaimer. Publish only original or properly licensed content: link official
AKTU syllabus/papers, transcribe questions, write original solutions and notes, use CC-licensed
material with attribution, and take contributor notes only with a written licence. Never scrape
competitors or publishers. Keep pages unique and useful, not thin. No login walls, countdowns,
SPAs, unnecessary JS, or third-party scripts. Validate content, build, check file counts, and
run Lighthouse before finishing. Do not deploy or commit unless the user asks.
