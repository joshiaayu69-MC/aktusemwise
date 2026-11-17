# Drafts

One MDX file per resource, named `<resource_id>.mdx`.

A draft is original writing produced from a fact sheet, not from source prose. Do not paste
source text into this folder, even as a note. If you need the source for fact checking, use a
link in the fact sheet.

Before a draft moves on:

- run `npx tsx scripts/similarity-check.ts <resource_id>`,
- fix every flagged passage by rewriting the explanation, not by swapping synonyms,
- and send the draft to a named human reviewer.

See `content-ops/styleguide.md` and `content-ops/PROMPTS.md`.
