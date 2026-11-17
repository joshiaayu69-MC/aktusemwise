# Fact sheets

One JSON file per resource, named `<resource_id>.json`.

A fact sheet contains only facts: codes, names, units, topics, marks, dates, formulas,
definitions boundaries, and eligibility rules. It must not contain copied sentences,
examples, analogies, exercises, or diagrams.

Validate the shape with `content-ops/templates/fact-sheet.json` and the `factSheetSchema` in
`src/lib/schemas.ts`.

Workflow:

```sh
npm run ai:extract -- --resource bcs501-notes --source aktu-syllabus
npx tsx scripts/license-gate.ts --resource bcs501-notes
```

Review every extracted fact by hand. AI extraction is a first pass, not a source of truth.
