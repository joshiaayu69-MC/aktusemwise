import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  booleanArg,
  loadSubjects,
  log,
  parseArgs,
  paths,
  rel,
  stringArg,
  todayISO,
  writeJsonFile,
  writeTextFile,
} from './_utils';
import { RESOURCE_TYPES } from '../src/lib/schemas';
import { SITE } from '../src/lib/site';

const args = parseArgs();

if (booleanArg(args, 'help')) {
  console.log(`Usage: npm run content:new -- --subject BCS501 --type notes [--id bcs501-notes] [--title "..."] [--force]

Types: ${RESOURCE_TYPES.join(', ')}`);
  process.exit(0);
}

const subjectCode = stringArg(args, 'subject');
const type = stringArg(args, 'type');

if (!subjectCode) {
  log.error('Missing --subject (for example --subject BCS501).');
  process.exit(1);
}
if (!type) {
  log.error(`Missing --type (one of: ${RESOURCE_TYPES.join(', ')}).`);
  process.exit(1);
}
if (!RESOURCE_TYPES.includes(type as (typeof RESOURCE_TYPES)[number])) {
  log.error(`Unknown type "${type}". Use one of: ${RESOURCE_TYPES.join(', ')}.`);
  process.exit(1);
}

const force = booleanArg(args, 'force');
const code = subjectCode.toUpperCase();
const id = stringArg(args, 'id') ?? `${code.toLowerCase()}-${type}`;

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
  log.error(`Invalid resource id "${id}". Use lowercase letters, numbers, and hyphens.`);
  process.exit(1);
}

const subjects = await loadSubjects();
const subjectEntry = subjects.find(
  (entry) => entry.issues.length === 0 && entry.data.code.toUpperCase() === code,
);
if (!subjectEntry) {
  log.error(
    `Subject "${code}" was not found in src/content/subjects/. Add the subject first.`,
  );
  process.exit(1);
}
const subject = subjectEntry.data;
const title = stringArg(args, 'title') ?? `${subject.name} ${type.replace(/-/g, ' ')}`;

const factFile = path.join(paths.facts, `${id}.json`);
const draftFile = path.join(paths.drafts, `${id}.mdx`);
const reviewFile = path.join(paths.reviews, `${id}.json`);
const similarityFile = path.join(paths.reviews, `${id}.similarity.json`);
const provenanceFile = path.join(paths.provenance, `${id}.json`);
const files = [factFile, draftFile, reviewFile, provenanceFile];

const existing = files.filter((file) => existsSync(file));

if (existing.length > 0 && !force) {
  log.error(
    `Refusing to overwrite existing files. Re-run with --force to replace them:\n${existing.map(rel).join('\n')}`,
  );
  process.exit(1);
}

const sourceLicence = subject.source_url.includes('aktu.ac.in')
  ? 'official-facts-only'
  : 'link-only';

const factSheet = {
  resource_id: id,
  subject_code: subject.code,
  source_url: subject.source_url,
  accessed_at: todayISO(),
  licence: sourceLicence,
  facts: [
    {
      id: 'f001',
      unit: 1,
      topic: 'TODO: topic from the official syllabus',
      claim: 'TODO: one factual statement supported by the source.',
      confidence: 'low',
    },
  ],
};

const draft = `---
resource_id: ${id}
title: ${title}
subject_code: ${subject.code}
resource_type: ${type}
ai_assisted: false
fact_sheet: content-ops/facts/${id}.json
---

## What this covers

TODO: two or three sentences that state the scope of this resource.

## Learning outcomes

- TODO: an observable outcome.
- TODO: an observable outcome.

## Unit 1

### Definition

**Term.** TODO: define the term in one or two sentences.

### Worked example

TODO: show the steps, not just the answer.

### Exam focus

TODO: write answer skeletons for 2-, 5-, and 10-mark questions.

## Recap

- TODO: a recap bullet.

## Sources and licence

- Official source: [${subject.code} syllabus](${subject.source_url})
- Licence: site-original
- Reviewer: TODO
- Last verified: TODO
`;

const review = {
  resource_id: id,
  checked_at: todayISO(),
  similarity_score: 1,
  max_ngram_overlap: 1,
  web_matches: [],
  fact_check: 'not-run',
  flags: [
    'Scaffold only. Complete the fact sheet, draft, similarity check, and human review.',
  ],
  verdict: 'revise',
  reviewer: 'TODO named human reviewer',
  notes:
    'This review file is a scaffold. Do not set verdict to approve until a named human reviewer has checked the resource.',
};

const provenance = {
  resource_id: id,
  file: `${code.toLowerCase()}/${type}/${id}.pdf`,
  sha256: `sha256:${'0'.repeat(64)}`,
  created_at: todayISO(),
  author: 'TODO author name',
  prompt_version: 'authoring:1.0',
  fact_sheet: `content-ops/facts/${id}.json`,
  sources: [
    {
      url: subject.source_url,
      licence: sourceLicence,
      use: 'facts-only',
    },
  ],
  review: {
    reviewer: 'TODO named human reviewer',
    date: todayISO(),
    checklist: `content-ops/reviews/${id}.json`,
  },
  similarity: {
    score: 1,
    report: `content-ops/reviews/${id}.similarity.json`,
  },
  licence: 'site-original',
  watermark: `${SITE.name} - original study material`,
  takedown_contact: SITE.grievanceEmail,
};

await writeJsonFile(factFile, factSheet);
await writeTextFile(draftFile, draft);
await writeJsonFile(reviewFile, review);
await writeJsonFile(provenanceFile, provenance);
await writeTextFile(
  similarityFile,
  `${JSON.stringify(
    {
      resource_id: id,
      checked_at: new Date().toISOString(),
      similarity_score: 1,
      max_ngram_overlap: 1,
      ngram: 5,
      threshold: 0.15,
      draft: rel(draftFile),
      draft_words: 0,
      reference_files: 0,
      files_compared: [],
      matches: [],
      web_matches: [],
      verdict: 'review',
      notes:
        'Scaffold. Run npm run validate to replace this with a real similarity report.',
    },
    null,
    2,
  )}\n`,
);

log.heading('Created resource scaffold');
for (const file of [factFile, draftFile, reviewFile, similarityFile, provenanceFile]) {
  log.ok(rel(file));
}

log.heading('Next steps');
log.info(`1. Complete the fact sheet: ${rel(factFile)}`);
log.info(`2. Extract or verify facts from: ${subject.source_url}`);
log.info(`3. Write the original draft: ${rel(draftFile)}`);
log.info(`4. Run: npx tsx scripts/similarity-check.ts ${id}`);
log.info(`5. Human review: ${rel(reviewFile)}`);
log.info(`6. Build the PDF: npm run content:pdf -- --resource ${id}`);
log.info(`7. Upload the PDF to R2, then update ${rel(provenanceFile)}`);
log.info(`8. Add the resource entry to ${rel(subjectEntry.file)}`);

log.heading('Suggested subject YAML entry');
console.log(`resources:
  - type: ${type}
    title: ${JSON.stringify(title)}
    description: "TODO: 1-2 sentence description."
    verified: false
    source: original
    licence: site-original
    source_basis:
      - url: ${subject.source_url}
        use: facts-only
    ai_assisted: true
    provenance: content-ops/provenance/${id}.json`);
