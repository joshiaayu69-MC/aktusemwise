import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  formatZodError,
  isPlaceholder,
  loadSourceMap,
  loadSubjects,
  log,
  normalizeUrl,
  paths,
  readJsonFile,
  rel,
  resourceIdFromPath,
  sha256File,
} from './_utils';
import { factSheetSchema, provenanceSchema, reviewSchema } from '../src/lib/schemas';

const MAX_SIMILARITY = 0.15;
const errors: string[] = [];
const warnings: string[] = [];

function error(message: string) {
  errors.push(message);
  log.error(message);
}

function warn(message: string) {
  warnings.push(message);
  log.warn(message);
}

function resolveProjectPath(value: string) {
  return path.resolve(paths.root, value);
}

async function main() {
  log.heading('Provenance verification');

  let sourceMap;
  try {
    sourceMap = await loadSourceMap();
  } catch (sourceError) {
    error(
      `Cannot load sources.yaml: ${sourceError instanceof Error ? sourceError.message : String(sourceError)}`,
    );
    process.exitCode = 1;
    return;
  }

  const subjects = await loadSubjects();
  let pdfResources = 0;
  let verifiedHashes = 0;

  for (const entry of subjects) {
    if (entry.issues.length > 0) {
      error(`${rel(entry.file)}: ${entry.issues.join('\n')}`);
      continue;
    }
    const subject = entry.data;
    for (const [index, resource] of subject.resources.entries()) {
      const label = `${rel(entry.file)} resources[${index}] "${resource.title}"`;

      if (!resource.r2_key && !resource.provenance) continue;
      if (resource.r2_key) pdfResources += 1;

      if (resource.r2_key && !resource.provenance) {
        error(`${label}: r2_key exists but provenance is missing.`);
        continue;
      }
      if (!resource.provenance) continue;

      const provenanceFile = resolveProjectPath(resource.provenance);
      if (!existsSync(provenanceFile)) {
        error(`${label}: provenance file is missing (${resource.provenance}).`);
        continue;
      }

      let provenanceRaw: unknown;
      try {
        provenanceRaw = await readJsonFile(provenanceFile);
      } catch (readError) {
        error(
          `${label}: cannot read provenance (${readError instanceof Error ? readError.message : String(readError)}).`,
        );
        continue;
      }

      const provenanceParsed = provenanceSchema.safeParse(provenanceRaw);
      if (!provenanceParsed.success) {
        error(`${label}: invalid provenance.\n${formatZodError(provenanceParsed.error)}`);
        continue;
      }
      const provenance = provenanceParsed.data;

      const expectedId = resourceIdFromPath(provenanceFile);
      if (provenance.resource_id !== expectedId) {
        error(
          `${label}: provenance resource_id "${provenance.resource_id}" does not match filename "${expectedId}".`,
        );
      }

      if (resource.r2_key && provenance.file !== resource.r2_key) {
        error(`${label}: provenance file "${provenance.file}" does not match r2_key.`);
      }

      if (provenance.licence !== resource.licence) {
        error(
          `${label}: provenance licence "${provenance.licence}" does not match resource licence "${resource.licence}".`,
        );
      }

      if (isPlaceholder(provenance.review.reviewer)) {
        error(`${label}: provenance reviewer is a placeholder. Name a human reviewer.`);
      }

      if (provenance.review.date.getTime() > Date.now()) {
        warn(`${label}: review date is in the future.`);
      }
      if (provenance.created_at.getTime() > Date.now()) {
        warn(`${label}: provenance created_at is in the future.`);
      }

      if (provenance.similarity.score > MAX_SIMILARITY) {
        error(
          `${label}: provenance similarity ${provenance.similarity.score.toFixed(3)} is above ${MAX_SIMILARITY}.`,
        );
      }

      if (isPlaceholder(provenance.similarity.report)) {
        error(`${label}: provenance has no similarity report path.`);
      } else {
        const reportFile = resolveProjectPath(provenance.similarity.report);
        if (!existsSync(reportFile)) {
          error(
            `${label}: similarity report is missing (${provenance.similarity.report}).`,
          );
        }
      }

      if (isPlaceholder(provenance.review.checklist)) {
        error(`${label}: provenance has no review checklist path.`);
      } else {
        const reviewFile = resolveProjectPath(provenance.review.checklist);
        if (!existsSync(reviewFile)) {
          error(
            `${label}: review checklist is missing (${provenance.review.checklist}).`,
          );
        } else {
          try {
            const reviewRaw = await readJsonFile(reviewFile);
            const reviewParsed = reviewSchema.safeParse(reviewRaw);
            if (!reviewParsed.success) {
              error(
                `${label}: invalid review file.\n${formatZodError(reviewParsed.error)}`,
              );
            } else {
              const review = reviewParsed.data;
              if (review.verdict !== 'approve') {
                error(`${label}: review verdict is "${review.verdict}", not "approve".`);
              }
              if (review.fact_check !== 'pass') {
                error(
                  `${label}: review fact_check is "${review.fact_check}", not "pass".`,
                );
              }
              if (review.similarity_score > MAX_SIMILARITY) {
                error(
                  `${label}: review similarity ${review.similarity_score.toFixed(3)} is above ${MAX_SIMILARITY}.`,
                );
              }
              if (review.max_ngram_overlap > MAX_SIMILARITY) {
                error(
                  `${label}: review max_ngram_overlap ${review.max_ngram_overlap.toFixed(3)} is above ${MAX_SIMILARITY}.`,
                );
              }
              if (isPlaceholder(review.reviewer)) {
                error(`${label}: review reviewer is a placeholder.`);
              }
              if (review.reviewer && provenance.review.reviewer !== review.reviewer) {
                warn(`${label}: review reviewer and provenance reviewer differ.`);
              }
            }
          } catch (readError) {
            error(
              `${label}: cannot read review (${readError instanceof Error ? readError.message : String(readError)}).`,
            );
          }
        }
      }

      if (!isPlaceholder(provenance.fact_sheet)) {
        const factSheetFile = resolveProjectPath(provenance.fact_sheet);
        if (!existsSync(factSheetFile)) {
          error(`${label}: fact sheet is missing (${provenance.fact_sheet}).`);
        } else {
          try {
            const factRaw = await readJsonFile(factSheetFile);
            const factParsed = factSheetSchema.safeParse(factRaw);
            if (!factParsed.success) {
              error(`${label}: invalid fact sheet.\n${formatZodError(factParsed.error)}`);
            } else {
              const factSheet = factParsed.data;
              if (factSheet.resource_id !== expectedId) {
                error(`${label}: fact sheet resource_id does not match.`);
              }
              if (factSheet.facts.length === 0) {
                error(`${label}: fact sheet has no facts.`);
              }
              if (!factSheet.facts.some((fact) => fact.confidence === 'high')) {
                warn(`${label}: fact sheet has no high-confidence facts.`);
              }
            }
          } catch (readError) {
            error(
              `${label}: cannot read fact sheet (${readError instanceof Error ? readError.message : String(readError)}).`,
            );
          }
        }
      } else {
        error(`${label}: provenance has no fact_sheet path.`);
      }

      for (const source of provenance.sources) {
        if (!sourceMap.has(normalizeUrl(source.url))) {
          error(`${label}: provenance source is not registered (${source.url}).`);
        }
      }

      if (resource.file_hash) {
        const expected = resource.file_hash.startsWith('sha256:')
          ? resource.file_hash
          : `sha256:${resource.file_hash}`;
        if (expected !== provenance.sha256) {
          error(`${label}: resource file_hash does not match provenance sha256.`);
        }
      }

      const localCandidates = [
        path.join(paths.exports, provenance.file),
        path.join(paths.exports, path.basename(provenance.file)),
      ];
      const localPdf = localCandidates.find((candidate) => existsSync(candidate));
      if (localPdf) {
        const actual = await sha256File(localPdf);
        if (actual !== provenance.sha256) {
          error(
            `${label}: local PDF hash ${actual} does not match provenance ${provenance.sha256}.`,
          );
        } else {
          verifiedHashes += 1;
          log.ok(`${label}: local PDF hash verified.`);
        }
      } else {
        warn(
          `${label}: no local PDF to hash. Upload to R2, then verify the object hash separately.`,
        );
      }

      if (!provenance.watermark) {
        warn(`${label}: provenance has no watermark text.`);
      }
      if (!provenance.takedown_contact) {
        warn(`${label}: provenance has no takedown contact.`);
      }
    }
  }

  log.heading('Summary');
  log.info(
    `${pdfResources} resource(s) with r2_key, ${verifiedHashes} local hash check(s) passed.`,
  );
  if (warnings.length > 0) log.warn(`${warnings.length} warning(s).`);
  if (errors.length > 0) {
    log.error(`${errors.length} error(s). Do not publish until provenance is complete.`);
    process.exitCode = 1;
    return;
  }
  log.ok('Provenance verification passed.');
}

await main();
