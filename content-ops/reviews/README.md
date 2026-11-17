# Reviews

One JSON file per resource, named `<resource_id>.json`, matching the `reviewSchema` in
`src/lib/schemas.ts`.

A review is written by a named human subject expert. It records:

- the similarity score and maximum n-gram overlap,
- any web matches,
- the fact-check result,
- flags and required fixes,
- the verdict (`approve`, `revise`, or `reject`),
- the reviewer name and date.

"Do not approve" means do not set `draft: false`. A rejected review stays in the folder so the
history is visible.

Copy `content-ops/templates/review.json` to start.
