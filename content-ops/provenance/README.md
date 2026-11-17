# Provenance

One JSON file per published PDF, named `<resource_id>.json`, matching the `provenanceSchema`
in `src/lib/schemas.ts`.

The subject YAML must reference this file with the exact path
`content-ops/provenance/<resource_id>.json`. Validation fails if the file is missing, the
hash does not match the uploaded PDF, the reviewer is unnamed, or the similarity score is
missing.

Do not edit a provenance record after publication. If content changes, create a new PDF,
compute a new hash, and update the record with a new date. Keep the old record in Git history.
