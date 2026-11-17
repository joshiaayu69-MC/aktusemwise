import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  booleanArg,
  log,
  numberArg,
  parseArgs,
  paths,
  parseFrontmatter,
  readText,
  rel,
  resourceIdFromPath,
  stringArg,
  walkFiles,
  writeJsonFile,
} from './_utils';

const DEFAULT_NGRAM = 5;
const DEFAULT_THRESHOLD = 0.15;

interface Match {
  file: string;
  overlap: number;
  samples: string[];
}

interface Report {
  resource_id: string;
  checked_at: string;
  similarity_score: number;
  max_ngram_overlap: number;
  ngram: number;
  threshold: number;
  draft: string;
  draft_words: number;
  reference_files: number;
  files_compared: string[];
  matches: Match[];
  web_matches: string[];
  verdict: 'pass' | 'review' | 'not-run';
  notes: string;
}

const args = parseArgs();
const resourceArg = stringArg(args, 'resource') ?? args._[0];
const draftArg = stringArg(args, 'draft');
const ngramSize = Math.max(3, Math.floor(numberArg(args, 'ngram', DEFAULT_NGRAM)));
const threshold = numberArg(args, 'threshold', DEFAULT_THRESHOLD);
const warnOnly = booleanArg(args, 'warn');

function tokenize(text: string) {
  const { content } = parseFrontmatter(text);
  return (
    content
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`[^`\n]*`/g, ' ')
      .replace(/\$\$[\s\S]*?\$\$/g, ' ')
      .replace(/\$[^$\n]*\$/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/https?:\/\/\S+/g, ' ')
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu) ?? []
  );
}

function shingles(tokens: string[], size: number) {
  const result = new Set<string>();
  for (let index = 0; index + size <= tokens.length; index += 1) {
    result.add(tokens.slice(index, index + size).join(' '));
  }
  return result;
}

async function referenceFiles() {
  const files = [
    ...(await walkFiles(paths.reference, {
      extensions: ['.md', '.mdx', '.txt'],
      excludeDirs: [],
    })),
    ...(await walkFiles(paths.raw, {
      extensions: ['.md', '.mdx', '.txt'],
      excludeDirs: [],
    })),
  ];
  const extra = stringArg(args, 'reference');
  if (extra) {
    for (const value of extra.split(/[;,]/)) {
      const trimmed = value.trim();
      if (trimmed) files.push(path.resolve(paths.root, trimmed));
    }
  }
  return [...new Set(files)]
    .filter((file) => !/^readme\.mdx?$/i.test(path.basename(file)))
    .filter((file) => existsSync(file));
}

async function checkDraft(draftFile: string, references: string[]): Promise<Report> {
  const id = resourceIdFromPath(draftFile);
  const draftText = await readText(draftFile);
  const draftTokens = tokenize(draftText);
  const draftShingles = shingles(draftTokens, ngramSize);
  const matches: Match[] = [];
  let maxOverlap = 0;

  for (const reference of references) {
    if (path.resolve(reference) === path.resolve(draftFile)) continue;
    let referenceText: string;
    try {
      referenceText = await readText(reference);
    } catch {
      continue;
    }
    const referenceTokens = tokenize(referenceText);
    if (referenceTokens.length < ngramSize * 4) continue;
    const referenceShingles = shingles(referenceTokens, ngramSize);
    const intersection = [...draftShingles].filter((shingle) =>
      referenceShingles.has(shingle),
    );
    const overlap =
      draftShingles.size === 0 ? 0 : intersection.length / draftShingles.size;
    maxOverlap = Math.max(maxOverlap, overlap);
    if (intersection.length > 0) {
      matches.push({
        file: rel(reference),
        overlap,
        samples: intersection.slice(0, 5),
      });
    }
  }

  matches.sort((a, b) => b.overlap - a.overlap);

  const verdict: Report['verdict'] =
    references.length === 0 ? 'not-run' : maxOverlap > threshold ? 'review' : 'pass';

  return {
    resource_id: id,
    checked_at: new Date().toISOString(),
    similarity_score: Number(maxOverlap.toFixed(4)),
    max_ngram_overlap: Number(maxOverlap.toFixed(4)),
    ngram: ngramSize,
    threshold,
    draft: rel(draftFile),
    draft_words: draftTokens.length,
    reference_files: references.length,
    files_compared: references.map((file) => rel(file)),
    matches: matches.slice(0, 10),
    web_matches: [],
    verdict,
    notes:
      references.length === 0
        ? 'No reference text files found. Add allowed reference texts to content-ops/reference/ or content-ops/archive/raw/ and rerun.'
        : verdict === 'review'
          ? 'Overlap is above threshold. Rewrite the flagged explanations; do not swap synonyms.'
          : 'Local n-gram check only. Web plagiarism and fact checks are still required.',
  };
}

async function main() {
  log.heading('Similarity check');

  const references = await referenceFiles();

  let drafts: string[] = [];
  if (resourceArg) {
    const candidate = draftArg
      ? path.resolve(paths.root, draftArg)
      : path.join(paths.drafts, `${resourceArg}.mdx`);
    if (!existsSync(candidate)) {
      log.error(`Draft not found: ${rel(candidate)}`);
      process.exitCode = 1;
      return;
    }
    drafts = [candidate];
  } else {
    drafts = (
      await walkFiles(paths.drafts, { extensions: ['.mdx'], excludeDirs: [] })
    ).filter((file) => !/^readme\.mdx?$/i.test(path.basename(file)));
  }

  if (drafts.length === 0) {
    log.ok('No drafts to check.');
    return;
  }

  let flagged = 0;
  for (const draft of drafts) {
    const report = await checkDraft(draft, references);
    const reportFile = path.join(paths.reviews, `${report.resource_id}.similarity.json`);
    await writeJsonFile(reportFile, report);

    if (report.verdict === 'not-run') {
      log.warn(`${report.resource_id}: no reference files; check not run.`);
    } else if (report.verdict === 'review') {
      flagged += 1;
      log.error(
        `${report.resource_id}: ${(report.max_ngram_overlap * 100).toFixed(1)}% ${report.ngram}-gram overlap (limit ${(threshold * 100).toFixed(0)}%).`,
      );
      for (const match of report.matches.slice(0, 3)) {
        log.dim(`  ${match.file}: ${(match.overlap * 100).toFixed(1)}%`);
        for (const sample of match.samples.slice(0, 2)) {
          log.dim(`    "${sample}"`);
        }
      }
    } else {
      log.ok(
        `${report.resource_id}: ${(report.max_ngram_overlap * 100).toFixed(1)}% ${report.ngram}-gram overlap.`,
      );
    }
    log.info(`Report: ${rel(reportFile)}`);
  }

  log.heading('Summary');
  log.info(
    `${drafts.length} draft(s) checked against ${references.length} reference file(s).`,
  );
  if (flagged > 0) {
    if (warnOnly) {
      log.warn(`${flagged} draft(s) above threshold (warn-only mode).`);
    } else {
      log.error(`${flagged} draft(s) above threshold. Rewrite before review.`);
      process.exitCode = 1;
    }
  } else {
    log.ok('Similarity check finished.');
  }
}

await main();
