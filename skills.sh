#!/usr/bin/env sh
# =============================================================================
# skills.sh - Agent skill manifest and installer for the AKTU study platform
# =============================================================================
# This file is both documentation and an executable installer. AI agents and
# humans should read it to know which skills this project depends on, why they
# exist, and when to load them.
#
# Skills are installed project-locally into .agents/skills/ and tracked in
# skills-lock.json. Registry: https://skills.sh
#
# Usage:
#   ./skills.sh              Check prerequisites, restore skills from the lockfile
#   ./skills.sh --list       Print this manifest only (no installation)
#   ./skills.sh --check      Check prerequisites and list installed skills
#   ./skills.sh --install    Reinstall every skill from the manifest
#   ./skills.sh --update     Update all installed skills
#   ./skills.sh --help       Show this help
#
# Windows (PowerShell):
#   npx skills experimental_install   # restore from skills-lock.json
#   npx skills list                   # verify installation
#
# The lockfile is the source of truth for exact commits. Prefer restoring from
# it over re-adding packages, so every machine gets the same skill versions.
# =============================================================================

set -eu

REQUIRED_SKILLS="
astrolicious/agent-skills@astro
lombiq/tailwind-agent-skills@tailwind-4-docs
cloudflare/skills@workers-best-practices
cloudflare/skills@frameworks-on-cloudflare
addyosmani/web-quality-skills@accessibility
addyosmani/web-quality-skills@seo
coreyhaines31/marketingskills@schema
addyosmani/agent-skills@performance-optimization
"

SUPPORTING_SKILLS="
addyosmani/web-quality-skills@web-quality-audit
vercel-labs/agent-skills@web-design-guidelines
wshobson/agents@typescript-advanced-types
"

print_help() {
  sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'
}

print_manifest() {
  cat <<'EOF'
SKILL MANIFEST - AKTU STUDY RESOURCES PLATFORM
==============================================

Required skills (core stack)
----------------------------
astro
  Source:  astrolicious/agent-skills@astro
  Purpose: Astro components, pages, content collections, SSG, routing.
  Load:    Phase 1 scaffold, Phase 3 content model and routes, any .astro work.

tailwind-4-docs
  Source:  lombiq/tailwind-agent-skills@tailwind-4-docs
  Purpose: Official Tailwind CSS v4 docs snapshot, CSS-first @theme tokens,
           utilities, variants, v3 -> v4 migration gotchas.
  Load:    Phase 2 design system and every styling task.
  Setup:   The docs snapshot must be synced once (see "Tailwind docs snapshot").
  Policy:  symlinked snapshot only. Do not commit downloaded docs if prohibited.

workers-best-practices
  Source:  cloudflare/skills@workers-best-practices
  Purpose: Cloudflare Workers APIs, wrangler config, limits, caching, headers,
           security. Correct usage of Static Assets and the /api Worker.
  Load:    Phase 1 deploy config, Phase 4 downloads, Phase 6 CI/CD.

frameworks-on-cloudflare
  Source:  cloudflare/skills@frameworks-on-cloudflare
  Purpose: Deploy Astro to Workers Static Assets, wrangler routing,
           run_worker_first, framework output modes. Prefer Workers over Pages.
  Load:    Phase 1 scaffold/deploy, Phase 6 pipeline.

accessibility
  Source:  addyosmani/web-quality-skills@accessibility
  Purpose: WCAG 2.2 audits: keyboard navigation, focus, contrast, semantics,
           ARIA, screen-reader support, 44px targets, dark mode.
  Load:    Phase 2 design system and every UI review (target: Lighthouse >= 95).

seo
  Source:  addyosmani/web-quality-skills@seo
  Purpose: Technical and on-page SEO: titles, meta descriptions, canonicals,
           headings, internal links, sitemaps, robots, indexing.
  Load:    Phase 5 SEO and any new page template.

schema
  Source:  coreyhaines31/marketingskills@schema
  Purpose: schema.org JSON-LD: Course, LearningResource, FAQPage,
           BreadcrumbList, rich-result eligibility and validation.
  Load:    Phase 5 SEO and any structured-data change.

performance-optimization
  Source:  addyosmani/agent-skills@performance-optimization
  Purpose: Measure-first optimization of Core Web Vitals (LCP, CLS, INP),
           fonts, images, CSS/JS weight. Enforces the HTML < 50 KB target.
  Load:    Every phase that touches rendering, fonts, or images.

Supporting skills
-----------------
web-quality-audit
  Source:  addyosmani/web-quality-skills@web-quality-audit
  Purpose: Evidence-led Lighthouse-style audit across performance,
           accessibility, SEO, and best practices. Use for release gates.
  Load:    Phase 2 sample-page check, Phase 7 launch QA, monthly reviews.

web-design-guidelines
  Source:  vercel-labs/agent-skills@web-design-guidelines
  Purpose: Review UI code against the Web Interface Guidelines (UX,
           accessibility, interaction, copy, forms, motion).
  Load:    Phase 2 component review and any visual redesign.

typescript-advanced-types
  Source:  wshobson/agents@typescript-advanced-types
  Purpose: Strict TypeScript: generics, discriminated unions, conditional and
           mapped types, template literals, safe helpers for content data.
  Load:    Phase 3 schemas, route helpers, and any complex type work.

Optional skills (install only when the phase needs them)
--------------------------------------------------------
currents-dev/playwright-best-practices-skill@playwright-best-practices
  Purpose: End-to-end testing once Playwright tests are introduced.
cloudflare/skills@web-perf
  Purpose: Additional Cloudflare-specific web performance guidance.
anthropics/skills@doc-coauthoring
  Purpose: Long-form docs and editorial content co-authoring.
mindrally/skills@hono-typescript
  Purpose: Hono Worker patterns, only if /api/* is enabled (Phase 6+).
No registry skill exists for Pagefind; use https://pagefind.app docs directly.

Mastery protocol (how an agent should use these skills)
-------------------------------------------------------
1. Read description.md first. It is the source of truth for goals, limits,
   content rules, and agent working rules. Then read AGENTS.md and this file.
2. Load only the 1-3 skills relevant to the current task. Do not load all.
   - OpenCode: use the skill tool with the skill name.
   - Other agents: read .agents/skills/<name>/SKILL.md, then the references
     named in that file.
3. Follow the skill's own quick-start and reference map. Prefer retrieval over
   memory for Tailwind v4, Workers, and Astro APIs.
4. Cross-check every recommendation against description.md: static-first,
   only /api/* runs Worker code, no scraping, no AKTU brand, no login walls.
5. Verify the result: npm run build, content validation, Lighthouse/a11y audit,
   and the file-count check once those scripts exist.
6. If a skill conflicts with description.md, description.md wins. If the gap is
   real, stop and ask the user instead of inventing a rule.

Phase -> skill routing
----------------------
Phase 0 decisions:        (no skill; read description.md sections 13, 14, 21)
Phase 1 scaffold:         astro, frameworks-on-cloudflare, workers-best-practices
Phase 2 design system:    tailwind-4-docs, accessibility, web-design-guidelines
Phase 3 content/routes:   astro, typescript-advanced-types, tailwind-4-docs
Phase 4 PDFs/downloads:   workers-best-practices, frameworks-on-cloudflare
Phase 5 SEO/analytics:    seo, schema, performance-optimization
Phase 6 pipeline/admin:   workers-best-practices, frameworks-on-cloudflare
Phase 7 launch QA:        web-quality-audit, accessibility, performance-optimization
Ongoing:                  performance-optimization, accessibility, web-quality-audit

Prerequisites
-------------
Required now:
  - Node.js >= 22.23.4 and npm
  - git and network access (skill installs clone GitHub repositories)
  - Python 3 (only to sync the Tailwind v4 docs snapshot)
Required in later phases:
  - Cloudflare account, Wrangler CLI, R2 bucket and custom domain
  - qpdf and pdftoppm (PDF linearize/compress, first-page thumbnails)
  - Playwright + Lighthouse CI before launch

Tailwind docs snapshot
----------------------
The tailwind-4-docs skill does not bundle the docs. Sync it once:
  python .agents/skills/tailwind-4-docs/scripts/sync_tailwind_docs.py --accept-docs-license
If the snapshot is missing or older than one week, ask the user to run it.
Keep the snapshot local; respect the upstream license.

Troubleshooting
---------------
  npx skills list             List installed project skills
  npx skills update           Update skills to latest versions
  npx skills remove <name>    Remove one skill
  npx skills experimental_install --force   Reinstall from the lockfile
EOF
}

have() {
  command -v "$1" >/dev/null 2>&1
}

check_prerequisites() {
  echo "Checking prerequisites..."
  if have node; then
    echo "  node: $(node --version)"
    if ! node -e "const v=process.versions.node.split('.').map(Number); process.exit(v[0]>22||(v[0]===22&&v[1]>=23)?0:1)"; then
      echo "  WARN: package.json requires Node >= 22.23.4"
    fi
  else
    echo "  ERROR: node is not installed (need >= 22.23.4)"
    return 1
  fi
  if have npm; then
    echo "  npm:  $(npm --version)"
  else
    echo "  ERROR: npm is not installed"
    return 1
  fi
  if have git; then
    echo "  git:  $(git --version)"
  else
    echo "  WARN: git is missing; skill installs clone GitHub repositories"
  fi
  if have python || have python3; then
    echo "  python: available (needed only for the Tailwind docs snapshot)"
  else
    echo "  WARN: python3 is missing; Tailwind docs snapshot cannot be synced"
  fi
}

install_manifest() {
  for spec in $REQUIRED_SKILLS $SUPPORTING_SKILLS; do
    echo "Installing ${spec}..."
    npx --yes skills add "$spec" -y
  done
}

restore_from_lock() {
  if [ -f skills-lock.json ]; then
    echo "Restoring skills from skills-lock.json..."
    npx --yes skills experimental_install
  else
    echo "skills-lock.json not found; installing from the manifest..."
    install_manifest
  fi
}

case "${1:-}" in
  --list|-l)
    print_manifest
    ;;
  --check|-c)
    check_prerequisites
    npx --yes skills list
    ;;
  --install|-i)
    check_prerequisites
    install_manifest
    ;;
  --update)
    npx --yes skills update
    ;;
  --help|-h)
    print_help
    ;;
  "")
    check_prerequisites
    restore_from_lock
    npx --yes skills list
    ;;
  *)
    print_help
    exit 1
    ;;
esac
