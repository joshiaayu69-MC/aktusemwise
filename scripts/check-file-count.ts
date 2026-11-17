import { existsSync } from 'node:fs';
import path from 'node:path';
import { loadSubjects, log, paths, rel, walkFiles } from './_utils';

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

async function countFiles(directory: string, extensions: string[]) {
  return (await walkFiles(directory, { extensions, excludeDirs: [] })).filter(
    (file) => !/^readme\.(md|mdx|txt)$/i.test(path.basename(file)),
  );
}

async function main() {
  log.heading('Repository file check');

  const pdfs = await walkFiles(paths.root, {
    extensions: ['.pdf'],
    excludeDirs: ['node_modules', '.git', 'dist', '.astro', 'raw', 'exports', 'fixtures'],
  });

  if (pdfs.length > 0) {
    for (const pdf of pdfs) {
      error(`PDF must not be committed or bundled: ${rel(pdf)}`);
    }
  } else {
    log.ok('No PDFs in the repository tree.');
  }

  const [facts, drafts, reviews, provenance] = await Promise.all([
    countFiles(paths.facts, ['.json']),
    countFiles(paths.drafts, ['.mdx']),
    countFiles(paths.reviews, ['.json']),
    countFiles(paths.provenance, ['.json']),
  ]);

  const subjects = await loadSubjects();
  let publishedSubjects = 0;
  let publishedResources = 0;
  let pdfResources = 0;

  for (const entry of subjects) {
    if (entry.issues.length > 0) continue;
    const subject = entry.data;
    if (subject.draft) continue;
    publishedSubjects += 1;
    for (const resource of subject.resources) {
      publishedResources += 1;
      if (!resource.r2_key) continue;
      pdfResources += 1;
      if (!resource.provenance) {
        error(
          `${rel(entry.file)}: "${resource.title}" has r2_key but no provenance record.`,
        );
        continue;
      }
      const provenanceFile = path.resolve(paths.root, resource.provenance);
      if (!existsSync(provenanceFile)) {
        error(
          `${rel(entry.file)}: "${resource.title}" provenance file is missing (${resource.provenance}).`,
        );
      }
    }
  }

  const humanReviews = reviews.filter((file) => !file.endsWith('.similarity.json'));

  log.heading('Inventory');
  log.info(`Published subjects: ${publishedSubjects}`);
  log.info(`Published resources: ${publishedResources}`);
  log.info(`PDF resources: ${pdfResources}`);
  log.info(`Fact sheets: ${facts.length}`);
  log.info(`Drafts: ${drafts.length}`);
  log.info(`Human reviews: ${humanReviews.length}`);
  log.info(`Similarity reports: ${reviews.length - humanReviews.length}`);
  log.info(`Provenance records: ${provenance.length}`);

  if (pdfResources > 0 && provenance.length < pdfResources) {
    warn(
      `${pdfResources} PDF resource(s) but ${provenance.length} provenance record(s). Some PDFs are unverified.`,
    );
  }

  if (warnings.length > 0) log.warn(`${warnings.length} warning(s).`);
  if (errors.length > 0) {
    log.error(`${errors.length} error(s).`);
    process.exitCode = 1;
    return;
  }
  log.ok('Repository file check passed.');
}

await main();
