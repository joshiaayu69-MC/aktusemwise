# AGENTS.md

Entry point for AI agents working in this repository. Read this first, then the
documents below. `description.md` is the source of truth; if anything here or in
a skill conflicts with it, follow `description.md` and ask the user about real
gaps. Do not deploy, commit, push, or open a PR unless explicitly asked.

## Read order

1. `description.md` - goal, architecture, limits, content model, legal rules,
   roadmap, and agent working rules. Read it fully before changing anything.
2. `note.md` - legal resource sourcing and AI content production playbook.
   Read it before creating, drafting, importing, or uploading any resource.
   It defines the clean-room pipeline, licence gates, provenance records, and
   the exact content that may or may not be published.
3. `design.md` - visual system reference (warm editorial canvas, type, tokens).
   Follow it with the open-source font substitutes; never bundle Waldenburg.
4. `skills.sh` - required/supporting skills, purpose, phase routing, mastery
   protocol, prerequisites, and the Tailwind docs sync command.
5. `skills-lock.json` - pinned skill sources and commits. Restore with
   `npx skills experimental_install` (or `./skills.sh` on POSIX shells).

## Skills

Installed project-locally in `.agents/skills/`. Load only the 1-3 skills that
match the current task; never load all of them at once.

| Task | Skill |
|---|---|
| Scaffold, routes, content collections, `.astro` files | `astro` |
| Tailwind v4 utilities, `@theme` tokens, CSS-first config | `tailwind-4-docs` |
| Workers config, limits, headers, static assets | `workers-best-practices` |
| Deploy Astro to Workers Static Assets | `frameworks-on-cloudflare` |
| WCAG 2.2, keyboard, focus, contrast, semantics | `accessibility` |
| Titles, meta, canonicals, sitemaps, robots | `seo` |
| JSON-LD (Course, LearningResource, FAQPage, BreadcrumbList) | `schema` |
| Core Web Vitals, fonts, images, render cost | `performance-optimization` |
| Full Lighthouse-style release audit | `web-quality-audit` |
| UI/UX and Web Interface Guidelines review | `web-design-guidelines` |
| Strict TypeScript types and helpers | `typescript-advanced-types` |

Phase routing and optional skills are documented in `skills.sh`.

### Tailwind docs snapshot

`tailwind-4-docs` needs a one-time sync:

```sh
python .agents/skills/tailwind-4-docs/scripts/sync_tailwind_docs.py --accept-docs-license
```

If the snapshot is missing or older than one week, stop and ask the user to run
it. Keep the snapshot local and respect the upstream license.

## Pre-flight requirements

Required now:

- Node.js >= 22.23.4 and npm
- git and network access for skill installs
- Python 3 for the Tailwind docs snapshot

Required in later phases:

- Cloudflare account, Wrangler CLI, R2 bucket, custom domain
- `qpdf` and `pdftoppm` for PDF linearize/compress and thumbnails
- Playwright and Lighthouse CI before launch

Optional skills (install only when needed) are listed in `skills.sh`.

## Non-negotiables (summary)

- Static-first: every public page is pre-rendered. Only `/api/*` runs Worker code.
- PDFs live in Cloudflare R2, never in Git, `public/`, or the Worker bundle.
- Never put "AKTU" in the domain or brand; include a non-affiliation disclaimer.
- Never scrape, copy, or re-upload competitor, Telegram, publisher, or "Quantum"
  content. Publish only original or properly licensed material with a source.
- Never OCR, paraphrase, or re-typeset a copyrighted scan and call it original;
  follow the clean-room pipeline in `note.md` (facts -> original writing ->
  similarity check -> human review).
- Every published resource needs a licence record, provenance manifest, and
  named human reviewer before it goes live.
- No login wall, countdown, fake download button, or ad interstitial on free content.
- No SPA, no heavy UI kit, no third-party scripts, ads, or tracking without approval.
- Never invent AKTU subject codes, schemes, papers, years, or `verified` data.
- No empty/thin subject pages; content quality beats UI polish.
- No secrets in the repo; use `wrangler secret` and environment bindings.
- Preserve URLs; add 301 redirects via `_redirects` when changing them.
- Mobile-first, semantic HTML, one `<h1>`, visible focus, alt text, WCAG AA.

## Commands

```sh
npm run dev       # local dev server
npm run build     # production build to dist/
npm run preview   # preview the build
npx skills list   # verify installed skills
```

`description.md` references `npm run validate` and `npm run check:files`; those
scripts are planned for Phase 6. Until they exist, run `npm run build` and the
available checks after content or code changes.

## Before finishing a task

- Read the relevant skill(s) and follow their checklists.
- Run `npm run build` and any available validation after changes.
- Check mobile, keyboard, focus, contrast, and dark mode for UI work.
- Confirm internal links, canonical URL, meta, and structured data for pages.
- Report any unresolved `TODO`, missing source, or approval needed.
