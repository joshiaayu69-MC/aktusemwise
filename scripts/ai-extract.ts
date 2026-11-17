import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  booleanArg,
  formatZodError,
  loadSources,
  loadSubjects,
  log,
  numberArg,
  parseArgs,
  paths,
  readText,
  rel,
  stringArg,
  todayISO,
  writeJsonFile,
} from './_utils';
import { buildMessages, callAI, extractJson, truncate } from './_ai';
import { factSheetSchema } from '../src/lib/schemas';

const args = parseArgs();

if (booleanArg(args, 'help')) {
  console.log(`Usage: npm run ai:extract -- --resource bcs501-notes --source aktu-syllabus --excerpt content-ops/archive/raw/bcs501.txt [--force] [--json-mode]

The excerpt must be a local text file you are allowed to process. The script sends only that
excerpt to the configured AI provider and writes facts to content-ops/facts/<resource>.json.
Never paste copyrighted prose into the fact sheet.`);
  process.exit(0);
}

const resourceId = stringArg(args, 'resource') ?? args._[0];
const sourceId = stringArg(args, 'source');
const excerptArg = stringArg(args, 'excerpt');
const force = booleanArg(args, 'force');
const jsonMode = booleanArg(args, 'json-mode');
const promptVersion = stringArg(args, 'prompt-version') ?? '1.0';
const maxChars = Math.max(2_000, Math.floor(numberArg(args, 'max-chars', 24_000)));

if (!resourceId) {
  log.error('Missing --resource (for example --resource bcs501-notes).');
  process.exit(1);
}
if (!sourceId) {
  log.error('Missing --source (a source id from content-ops/sources.yaml).');
  process.exit(1);
}
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(resourceId)) {
  log.error(`Invalid resource id "${resourceId}".`);
  process.exit(1);
}

const outputFile = path.join(paths.facts, `${resourceId}.json`);
if (existsSync(outputFile) && !force) {
  log.error(`Fact sheet already exists. Use --force to replace it: ${rel(outputFile)}`);
  process.exit(1);
}

const sources = await loadSources();
const source = sources.find((item) => item.id === sourceId);
if (!source) {
  log.error(
    `Source "${sourceId}" was not found. Available ids: ${sources.map((item) => item.id).join(', ')}`,
  );
  process.exit(1);
}
if (source.licence === 'blocked') {
  log.error(`Source "${sourceId}" is blocked. Do not extract from it.`);
  process.exit(1);
}
if (!source.allowed_operations.includes('facts-only')) {
  log.error(`Source "${sourceId}" does not allow facts-only extraction.`);
  process.exit(1);
}

let excerpt = '';
if (excerptArg) {
  const excerptFile = path.resolve(paths.root, excerptArg);
  if (!existsSync(excerptFile)) {
    log.error(`Excerpt file not found: ${rel(excerptFile)}`);
    process.exit(1);
  }
  excerpt = await readText(excerptFile);
} else {
  const candidates = [
    path.join(paths.raw, `${source.id}.txt`),
    path.join(paths.raw, `${source.id}.md`),
  ];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    log.error(
      `No excerpt found. Add a local text file at ${rel(candidates[0])} or pass --excerpt <path>.`,
    );
    process.exit(1);
  }
  excerpt = await readText(found);
}

if (excerpt.trim().length < 200) {
  log.error(
    'The excerpt is too short to extract useful facts. Add the relevant official text.',
  );
  process.exit(1);
}

const subjects = await loadSubjects();
const codeFromId = resourceId.match(/^([a-z]{2,5}\d{3}[a-z]?)-/)?.[1]?.toUpperCase();
const subject = subjects.find(
  (entry) =>
    entry.issues.length === 0 &&
    (entry.data.code.toUpperCase() === (stringArg(args, 'subject-code') ?? codeFromId) ||
      resourceId.startsWith(entry.data.code.toLowerCase())),
);
const subjectCode =
  stringArg(args, 'subject-code') ?? subject?.data.code ?? codeFromId ?? 'UNKNOWN';

log.heading('AI fact extraction');
log.info(`Resource: ${resourceId}`);
log.info(`Source: ${source.id} (${source.licence})`);
log.info(`Subject code: ${subjectCode}`);
log.info(`Excerpt: ${excerpt.length} characters, limited to ${maxChars}.`);

const messages = await buildMessages(
  'fact-extraction',
  promptVersion,
  {
    resource_id: resourceId,
    subject_code: subjectCode,
    source_url: source.url,
    licence: source.licence,
    allowed_operations: source.allowed_operations.join(', '),
  },
  `Source metadata:\n${JSON.stringify(
    {
      id: source.id,
      title: source.title,
      publisher: source.publisher,
      url: source.url,
      licence: source.licence,
      allowed_operations: source.allowed_operations,
      accessed_at: source.accessed_at.toISOString().slice(0, 10),
    },
    null,
    2,
  )}\n\nExcerpt for facts-only extraction:\n\n${truncate(excerpt, maxChars)}`,
);

let rawContent: string;
try {
  rawContent = await callAI(messages, { temperature: 0.1, maxTokens: 6000, jsonMode });
} catch (error) {
  log.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

let parsed: unknown;
try {
  parsed = extractJson(rawContent);
} catch (error) {
  log.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && 'facts' in parsed) {
  const record = parsed as Record<string, unknown>;
  const facts = record.facts;
  const merged = {
    resource_id: resourceId,
    subject_code: subjectCode === 'UNKNOWN' ? undefined : subjectCode,
    source_url: source.url,
    accessed_at: todayISO(),
    licence: source.licence,
    facts: Array.isArray(facts) ? facts : [],
  };

  const validated = factSheetSchema.safeParse(merged);
  if (!validated.success) {
    const debugFile = path.join(paths.facts, `${resourceId}.raw.json`);
    await writeJsonFile(debugFile, merged);
    log.error(`Extracted facts failed validation.\n${formatZodError(validated.error)}`);
    log.info(`Raw output saved for review: ${rel(debugFile)}`);
    process.exit(1);
  }

  await writeJsonFile(outputFile, validated.data);
  log.ok(`Wrote ${validated.data.facts.length} fact(s) to ${rel(outputFile)}`);
  log.heading('Review required');
  log.info(
    'Check every fact against the official source. AI extraction is a first pass.',
  );
  log.info(`Next: write the original draft, then run similarity-check.ts ${resourceId}.`);
} else {
  log.error('The model did not return an object with a facts array.');
  process.exit(1);
}
