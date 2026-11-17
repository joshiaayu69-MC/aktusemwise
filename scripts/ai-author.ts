import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  booleanArg,
  formatZodError,
  loadSubjects,
  log,
  numberArg,
  parseArgs,
  parseFrontmatter,
  paths,
  readJsonFile,
  rel,
  stringArg,
  todayISO,
  writeTextFile,
} from './_utils';
import { aiConfig, buildMessages, callAI } from './_ai';
import { RESOURCE_TYPES, factSheetSchema } from '../src/lib/schemas';

const args = parseArgs();

if (booleanArg(args, 'help')) {
  console.log(`Usage: npm run ai:author -- --fact-sheet content-ops/facts/bcs501-notes.json [--subject BCS501] [--type notes] [--target-words 1200] [--force]

The fact sheet must contain facts only. The model receives the fact sheet, not the source prose.
Output goes to content-ops/drafts/<resource>.mdx and still needs a human review.`);
  process.exit(0);
}

const factSheetArg = stringArg(args, 'fact-sheet') ?? args._[0];
const force = booleanArg(args, 'force');
const promptVersion = stringArg(args, 'prompt-version') ?? '1.0';
const targetWords = Math.max(300, Math.floor(numberArg(args, 'target-words', 1200)));

if (!factSheetArg) {
  log.error(
    'Missing --fact-sheet (for example --fact-sheet content-ops/facts/bcs501-notes.json).',
  );
  process.exit(1);
}

const factSheetFile = path.resolve(paths.root, factSheetArg);
if (!existsSync(factSheetFile)) {
  log.error(`Fact sheet not found: ${rel(factSheetFile)}`);
  process.exit(1);
}

let factSheetRaw: unknown;
try {
  factSheetRaw = await readJsonFile(factSheetFile);
} catch (error) {
  log.error(
    `Cannot read fact sheet: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
}

const factSheetParsed = factSheetSchema.safeParse(factSheetRaw);
if (!factSheetParsed.success) {
  log.error(`Invalid fact sheet.\n${formatZodError(factSheetParsed.error)}`);
  process.exit(1);
}
const factSheet = factSheetParsed.data;

const resourceId = factSheet.resource_id;
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(resourceId)) {
  log.error(`Invalid resource_id in fact sheet: "${resourceId}".`);
  process.exit(1);
}

const outputFile = path.join(paths.drafts, `${resourceId}.mdx`);
if (existsSync(outputFile) && !force) {
  log.error(`Draft already exists. Use --force to replace it: ${rel(outputFile)}`);
  process.exit(1);
}

const subjectCode = stringArg(args, 'subject') ?? factSheet.subject_code ?? 'UNKNOWN';
const subjects = await loadSubjects();
const subjectEntry = subjects.find(
  (entry) => entry.issues.length === 0 && entry.data.code === subjectCode,
);
const subject = subjectEntry?.data;

const derivedType = resourceId.split('-').slice(1).join('-');
const requestedType = stringArg(args, 'type') ?? derivedType ?? 'notes';
const resourceType = RESOURCE_TYPES.includes(
  requestedType as (typeof RESOURCE_TYPES)[number],
)
  ? requestedType
  : 'notes';

if (resourceType !== requestedType) {
  log.warn(`Unknown resource type "${requestedType}". Falling back to "notes".`);
}

log.heading('AI original authoring');
log.info(`Resource: ${resourceId}`);
log.info(`Subject: ${subject ? `${subject.code} ${subject.name}` : subjectCode}`);
log.info(`Type: ${resourceType}`);
log.info(`Target: ${targetWords} words`);
log.info(`Facts: ${factSheet.facts.length}`);

const messages = await buildMessages(
  'authoring',
  promptVersion,
  {
    subject_name: subject?.name ?? 'UNKNOWN',
    subject_code: subjectCode,
    semester: subject ? String(subject.semester) : 'UNKNOWN',
    scheme: subject?.scheme ?? 'UNKNOWN',
    resource_type: resourceType,
    target_words: String(targetWords),
    fact_sheet_json: JSON.stringify(factSheet, null, 2),
  },
  'The fact sheet above is the only source of facts. Do not add outside facts.',
);

let rawContent: string;
try {
  rawContent = await callAI(messages, { temperature: 0.4, maxTokens: 9000 });
} catch (error) {
  log.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

let body = rawContent.trim();
if (body.startsWith('```')) {
  body = body
    .replace(/^```(?:mdx|markdown|md)?\s*/i, '')
    .replace(/```\s*$/, '')
    .trim();
}
if (body.startsWith('---')) {
  const parsed = parseFrontmatter(body);
  if (Object.keys(parsed.data).length > 0) {
    body = parsed.content.trim();
  }
}
if (body.startsWith('# ')) {
  body = body.replace(/^#\s+/, '## ');
}
if (!body.startsWith('##')) {
  log.error('The model did not return Markdown starting with a ## heading.');
  process.exit(1);
}

const wordCount = (body.match(/[\p{L}\p{N}]+/gu) ?? []).length;
const unknownCount = (body.match(/\bUNKNOWN\b/g) ?? []).length;
if (wordCount < 300) {
  log.warn(`Draft is short (${wordCount} words). Check that the fact sheet is complete.`);
}
if (unknownCount > 0) {
  log.warn(
    `Draft contains ${unknownCount} UNKNOWN marker(s). Resolve them before review.`,
  );
}
if (!/sources?\s+and\s+licen[cs]e/i.test(body)) {
  log.warn('Draft has no "Sources and licence" section. Add one before review.');
}

let model = 'unknown';
try {
  const config = await aiConfig();
  model = config.model;
} catch {
  // The AI call already succeeded, so this is only metadata.
}

const firstHeading = body.match(/^##\s+(.+)$/m)?.[1] ?? '';
const title = subject
  ? `${subject.name} ${resourceType.replace(/-/g, ' ')}`
  : firstHeading || `${resourceId} resource`;

const frontmatter = `---
resource_id: ${resourceId}
title: ${JSON.stringify(title)}
subject_code: ${subjectCode}
resource_type: ${resourceType}
ai_assisted: true
prompt_version: ${JSON.stringify(promptVersion)}
fact_sheet: ${rel(factSheetFile)}
model: ${JSON.stringify(model)}
generated_at: ${todayISO()}
---
`;

await writeTextFile(outputFile, `${frontmatter}\n${body}\n`);
log.ok(`Wrote draft: ${rel(outputFile)}`);
log.info(`Words: ${wordCount}`);
log.heading('Next steps');
log.info('1. Read and edit every paragraph. Remove filler and any unsupported claim.');
log.info(`2. Run: npx tsx scripts/similarity-check.ts ${resourceId}`);
log.info(
  `3. Human review and then build the PDF: npm run content:pdf -- --resource ${resourceId}`,
);
