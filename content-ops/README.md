# Content operations

This directory is the paper trail for every resource. A resource is not publishable unless the
three records exist and pass validation:

1. a **source record** in `sources.yaml`,
2. a **fact sheet** in `facts/`, and
3. a **provenance record** in `provenance/` with a named reviewer and a similarity report.

`note.md` is the policy. This directory is where the policy is applied.

## Folder map

| Path | Purpose |
|---|---|
| `sources.yaml` | Registry of every external source and what we are allowed to do with it. |
| `facts/` | Fact sheets. Facts only: codes, units, topics, marks, dates, formulas. No copied prose. |
| `drafts/` | Original drafts authored from a fact sheet. Never paste a source here. |
| `reviews/` | Human review checklists and similarity reports. |
| `provenance/` | Immutable record for each published PDF: source, licence, hash, reviewer. |
| `permissions/` | Written permission letters or emails. One file per permission. |
| `reference/` | Allowed reference texts for fact checking. Never commit copyrighted scans. |
| `archive/` | Private working archive. `archive/raw/` is gitignored. |
| `exports/` | Local PDF output. Gitignored. Upload to R2 from here, then delete. |
| `templates/` | Starter files for subjects, fact sheets, drafts, reviews, and provenance. |

## The eight gates

Every resource follows this order. Do not skip a gate because a draft looks good.

1. **Intake** - choose a topic and an official or licensed source. Add the source to
   `sources.yaml` if it is new.
2. **Licence gate** - run `npx tsx scripts/license-gate.ts`. A blocked or unknown source stops
   the pipeline.
3. **Fact extraction** - create `facts/<resource-id>.json` from the source. Facts only.
4. **Original authoring** - create `drafts/<resource-id>.mdx` from the fact sheet. Do not open
   the source prose while writing.
5. **Similarity check** - run `npx tsx scripts/similarity-check.ts <resource-id>`. Fix any
   copied phrase. A high score is a rewrite signal, not a pass.
6. **Human review** - a named subject expert checks accuracy, coverage, originality, and
   accessibility, then writes `reviews/<resource-id>.json`.
7. **PDF + provenance** - build the PDF, compute the SHA-256 hash, and write
   `provenance/<resource-id>.json`. Upload the PDF to R2; never commit it.
8. **Validation + publish** - run `npm run validate` and `npm run check:files`. Only then set
   `draft: false` and add the resource to the subject YAML.

## Commands

```sh
# Create a scaffold for a new resource
npm run content:new -- --subject BCS501 --type notes

# Extract facts with an AI provider (review the output; do not trust it)
npm run ai:extract -- --resource bcs501-notes --source aktu-syllabus

# Draft original content from a fact sheet
npm run ai:author -- --fact-sheet content-ops/facts/bcs501-notes.json

# Build a PDF from a reviewed draft
npm run content:pdf -- --resource bcs501-notes

# Validate everything
npm run validate
npm run check:files
```

## Naming

- `resource_id`: `<subject-code-lowercase>-<type>`, for example `bcs501-notes`.
- Fact sheet: `content-ops/facts/<resource_id>.json`.
- Draft: `content-ops/drafts/<resource_id>.mdx`.
- Review: `content-ops/reviews/<resource_id>.json`.
- Similarity report: `content-ops/reviews/<resource_id>.similarity.json`.
- Provenance: `content-ops/provenance/<resource_id>.json`.
- PDF object key: `<subject-code-lowercase>/<type>/<resource_id>.pdf`.

The subject YAML must point at the provenance file with the exact relative path
`content-ops/provenance/<resource_id>.json`.

## Hard rules

- No source record, no extraction. No fact sheet, no draft. No review, no publish.
- Never commit a copyrighted scan, a publisher PDF, a coaching PDF, or a Telegram/WhatsApp
  file. `archive/raw/` and `exports/` are gitignored for a reason.
- Never use AI to paraphrase or re-typeset a source and call it original.
- Never invent a subject code, scheme, paper year, date, credit, or `verified: true` value.
- A reviewer must be a named human. "Team" and "AI" are not reviewers.
- If a licence is unclear, stop and ask the editor. An unclear licence is a `blocked` source.

## Current seed

`src/content/subjects/bcs501.yaml` is a draft seed. It has one unit and no resources on
purpose. Complete it only after the official syllabus is checked and a reviewer is named.
