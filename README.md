# YourBrand study resources

An independent, static study-resource site for AKTU students. Built with Astro, Tailwind CSS v4,
and MDX. Content is pre-rendered; only `/api/*` runs Worker code.

This project is not affiliated with, endorsed by, or connected to Dr. A.P.J. Abdul Kalam
Technical University (AKTU). Read `description.md` before making product decisions and `note.md`
before creating or importing any resource.

## Status

Foundation is in place. The site builds, but the brand, domain, taxonomy, subject seed, and
legal contacts are placeholders. Do not launch until the TODOs below are resolved.

- [ ] Replace `YourBrand`, `yourbrand.in`, and the contact emails.
- [ ] Verify every course, branch, scheme, and subject code against an official AKTU source.
- [ ] Complete the BCS501 seed or remove it before launch.
- [ ] Name a grievance officer and add a monitored contact.
- [ ] Create the R2 bucket and bind the files domain.
- [ ] Run a full accessibility, SEO, and Lighthouse audit.

## Requirements

- Node.js >= 22.23.4 (`.nvmrc` pins 26.13.0 for this workspace)
- npm
- Python 3 for the optional Tailwind docs snapshot
- Chrome or Edge for local PDF generation
- `qpdf` and `pdftoppm` for PDF linearization and thumbnails (later phase)
- A Cloudflare account for deployment and R2

## Quick start

```sh
npm install
npm run dev
```

Open `http://localhost:4321`.

```sh
npm run build     # astro build + Pagefind index
npm run preview   # preview the production build
npm run check     # astro check
npm run validate  # content, source, licence, provenance, and similarity checks
npm run check:files
```

`npm run build` must pass before deploying. Search is generated only in the production build.

## Project structure

```text
src/
  components/        Astro components (header, cards, callouts)
  content/
    subjects/        YAML subject hubs
    blog/            MDX posts and guides
  data/              courses.yaml, branches.yaml, schemes.yaml
  layouts/           BaseLayout, LegalLayout
  lib/               schemas, taxonomy, content queries, URLs, JSON-LD
  pages/             Static routes and dynamic course/subject routes
  styles/            Tailwind theme tokens and global styles
content-ops/
  sources.yaml       Source registry and licence boundaries
  facts/             Fact sheets (facts only)
  drafts/            Original drafts
  reviews/           Human reviews and similarity reports
  provenance/        Per-PDF provenance records
  permissions/       Written permissions
  archive/raw/       Private source downloads (gitignored)
  exports/           Local PDF output (gitignored)
public/
  _headers           Cloudflare headers
  _redirects         Cloudflare redirects
  robots.txt
scripts/             Validation, AI, similarity, and PDF tooling
```

## Content model

A subject is one YAML file at `src/content/subjects/<code>.yaml`. It carries the official code,
name, course, branches, semester, scheme, syllabus units, resources, and FAQs. Files starting
with `_` are ignored by the content loader.

A resource is an entry inside a subject's `resources` array. PDFs live in R2, never in Git or
`public/`. Each published PDF needs:

- a source record in `content-ops/sources.yaml`,
- a fact sheet in `content-ops/facts/`,
- a named human review in `content-ops/reviews/`,
- a similarity report in `content-ops/reviews/<id>.similarity.json`,
- a provenance record in `content-ops/provenance/` with the SHA-256 hash.

Drafts are visible in `npm run dev` but excluded from production builds. Never set
`draft: false` or `verified: true` without a real source and reviewer.

## Content pipeline

Read `note.md` and `content-ops/README.md` first. The short version:

```sh
npm run content:new -- --subject BCS501 --type notes
npm run ai:extract -- --resource bcs501-notes --source aktu-syllabus --excerpt <local-text>
npm run ai:author -- --fact-sheet content-ops/facts/bcs501-notes.json
npm run validate
npm run content:pdf -- --resource bcs501-notes
```

AI scripts require `AI_BASE_URL`, `AI_API_KEY`, and `AI_MODEL` in `.env`. Copy `.env.example`
and never commit the key. AI output is a draft, not a publishable resource.

The clean-room rule is strict: extract facts, write original explanations, run similarity and
fact checks, then have a named human review the result. Do not OCR, paraphrase, or re-typeset a
copyrighted scan and call it original.

## Deployment

The site is static. `wrangler.jsonc` points Cloudflare Workers Static Assets at `./dist`.

```sh
npm run deploy
```

This validates, builds, and deploys. Before the first deploy:

1. Replace the placeholder domain in `astro.config.mjs`, `public/robots.txt`, and
   `public/_headers` as needed.
2. Create the R2 bucket for PDFs and bind a files domain.
3. Add the production domain to Cloudflare.
4. Set any secrets with `wrangler secret put`, not in the repo.
5. Confirm the 404 page, redirects, sitemap, and security headers on the deployed site.

## Legal

- The site must include a visible non-affiliation disclaimer.
- Do not use the AKTU name in the domain or brand.
- Do not rehost official AKTU PDFs without written permission.
- Do not scrape, copy, or re-upload competitor, Telegram, publisher, or coaching content.
- Every published resource needs a licence, provenance record, and named reviewer.
- No login wall, countdown, fake download button, or ad interstitial on free content.

See `note.md`, `/editorial-policy/`, and `/takedown/` for the operational rules.
