import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  formatZodError,
  isPlaceholder,
  loadBlogPosts,
  loadSubjects,
  loadTaxonomy,
  log,
  paths,
  readJsonFile,
  rel,
  resourceIdFromPath,
  type SubjectFile,
} from './_utils';
import {
  provenanceSchema,
  reviewSchema,
  type Resource,
  type Subject,
} from '../src/lib/schemas';

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

function normalizeHash(value: string) {
  return value.startsWith('sha256:') ? value : `sha256:${value}`;
}

function resolveProjectPath(value: string) {
  return path.resolve(paths.root, value);
}

function checkProvenancePath(label: string, value: string): string | undefined {
  const file = resolveProjectPath(value);
  if (!existsSync(file)) {
    error(`${label}: provenance file does not exist (${value}).`);
    return undefined;
  }
  return file;
}

async function validateResource(
  subject: Subject,
  resource: Resource,
  index: number,
  subjectFile: string,
) {
  const label = `${rel(subjectFile)} resources[${index}] "${resource.title}"`;

  if (isPlaceholder(resource.title)) {
    error(`${label}: title is a placeholder.`);
  }

  if (resource.type === 'pyq' && !resource.year) {
    warn(`${label}: previous-year paper has no year. Add it only if it is verified.`);
  }

  if (resource.source === 'official-link') {
    if (!resource.official_url) {
      error(`${label}: official-link resources need official_url.`);
    }
    if (resource.r2_key) {
      error(`${label}: official-link resources must not be rehosted with r2_key.`);
    }
    if (resource.licence === 'site-original') {
      warn(
        `${label}: official-link resource is marked site-original; use the official facts licence.`,
      );
    }
  }

  if (resource.source === 'open-license') {
    if (
      resource.licence === 'site-original' ||
      resource.licence === 'permission-granted'
    ) {
      error(`${label}: open-license resource must record its actual licence.`);
    }
  }

  if (resource.source === 'original') {
    const allowed = new Set(['site-original', 'cc0-1.0', 'public-domain']);
    if (!allowed.has(resource.licence)) {
      warn(
        `${label}: original resource has a non-original licence (${resource.licence}).`,
      );
    }
  }

  if (resource.verified) {
    if (!resource.reviewer || isPlaceholder(resource.reviewer)) {
      error(`${label}: verified resource needs a named reviewer.`);
    }
    if (!resource.reviewed_at) {
      error(`${label}: verified resource needs reviewed_at.`);
    }
    if (!resource.source) {
      error(`${label}: verified resource needs a source.`);
    }
    if (resource.source_basis.length === 0) {
      error(`${label}: verified resource needs at least one source_basis entry.`);
    }
  }

  if (resource.ai_assisted && !resource.reviewer && !subject.draft) {
    error(`${label}: published AI-assisted resource needs a named reviewer.`);
  }

  if (resource.r2_key && !resource.provenance) {
    error(`${label}: r2_key requires a provenance file.`);
  }

  if (!resource.provenance) return;

  const provenanceFile = checkProvenancePath(label, resource.provenance);
  if (!provenanceFile) return;

  let provenanceRaw: unknown;
  try {
    provenanceRaw = await readJsonFile(provenanceFile);
  } catch (readError) {
    error(
      `${label}: cannot read provenance (${readError instanceof Error ? readError.message : String(readError)}).`,
    );
    return;
  }

  const provenanceParsed = provenanceSchema.safeParse(provenanceRaw);
  if (!provenanceParsed.success) {
    error(`${label}: invalid provenance.\n${formatZodError(provenanceParsed.error)}`);
    return;
  }
  const provenance = provenanceParsed.data;

  const expectedId = resourceIdFromPath(provenanceFile);
  if (provenance.resource_id !== expectedId) {
    error(
      `${label}: provenance resource_id "${provenance.resource_id}" does not match filename "${expectedId}".`,
    );
  }

  if (resource.r2_key && provenance.file !== resource.r2_key) {
    error(
      `${label}: provenance file "${provenance.file}" does not match r2_key "${resource.r2_key}".`,
    );
  }

  if (provenance.licence !== resource.licence) {
    error(
      `${label}: provenance licence "${provenance.licence}" does not match resource licence "${resource.licence}".`,
    );
  }

  if (
    resource.file_hash &&
    normalizeHash(resource.file_hash) !== normalizeHash(provenance.sha256)
  ) {
    error(`${label}: resource file_hash does not match provenance sha256.`);
  }

  if (!resource.file_hash && resource.r2_key && !subject.draft) {
    warn(`${label}: published PDF has no file_hash in the subject YAML.`);
  }

  if (isPlaceholder(provenance.review.reviewer)) {
    error(`${label}: provenance reviewer is a placeholder.`);
  }

  if (provenance.similarity.score > MAX_SIMILARITY) {
    error(
      `${label}: similarity ${provenance.similarity.score.toFixed(3)} is above ${MAX_SIMILARITY}.`,
    );
  }

  if (!isPlaceholder(provenance.similarity.report)) {
    const similarityFile = resolveProjectPath(provenance.similarity.report);
    if (!existsSync(similarityFile)) {
      error(`${label}: similarity report is missing (${provenance.similarity.report}).`);
    }
  }

  if (!isPlaceholder(provenance.review.checklist)) {
    const reviewFile = resolveProjectPath(provenance.review.checklist);
    if (!existsSync(reviewFile)) {
      error(`${label}: review checklist is missing (${provenance.review.checklist}).`);
    } else {
      try {
        const reviewRaw = await readJsonFile(reviewFile);
        const reviewParsed = reviewSchema.safeParse(reviewRaw);
        if (!reviewParsed.success) {
          error(`${label}: invalid review file.\n${formatZodError(reviewParsed.error)}`);
        } else {
          const review = reviewParsed.data;
          if (review.resource_id !== expectedId) {
            error(`${label}: review resource_id does not match the resource id.`);
          }
          if (review.verdict !== 'approve') {
            error(`${label}: review verdict is "${review.verdict}", not "approve".`);
          }
          if (review.fact_check !== 'pass') {
            error(`${label}: review fact_check is "${review.fact_check}", not "pass".`);
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
          if (
            review.reviewer &&
            provenance.review.reviewer &&
            review.reviewer !== provenance.review.reviewer
          ) {
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

  if (!provenance.watermark) {
    warn(`${label}: provenance has no watermark text.`);
  }
  if (!provenance.takedown_contact) {
    warn(`${label}: provenance has no takedown contact.`);
  }
}

async function validateSubject(entry: SubjectFile) {
  if (entry.issues.length > 0) {
    error(`${rel(entry.file)}: ${entry.issues.join('\n')}`);
    return;
  }

  const subject = entry.data;
  const file = rel(entry.file);

  if (!subject.draft) {
    if (!subject.verified) {
      error(`${file}: published subject must have verified: true.`);
    }
    if (subject.syllabus_units.length === 0 && subject.resources.length === 0) {
      error(`${file}: published subject has no units and no resources.`);
    }
    if (subject.syllabus_units.length === 0) {
      warn(`${file}: published subject has no syllabus units.`);
    }
    if (subject.resources.length === 0) {
      warn(`${file}: published subject has no resources; this is a thin page.`);
    }
    if (!subject.last_verified) {
      warn(`${file}: published subject has no last_verified date.`);
    }
    if (isPlaceholder(subject.description)) {
      error(`${file}: published subject has a placeholder description.`);
    }
  }

  const seenTitles = new Set<string>();
  const seenKeys = new Set<string>();
  for (const [index, resource] of subject.resources.entries()) {
    await validateResource(subject, resource, index, entry.file);
    const titleKey = resource.title.trim().toLowerCase();
    if (seenTitles.has(titleKey)) {
      error(`${file}: duplicate resource title "${resource.title}".`);
    }
    seenTitles.add(titleKey);
    if (resource.r2_key) {
      if (seenKeys.has(resource.r2_key)) {
        error(`${file}: duplicate r2_key "${resource.r2_key}".`);
      }
      seenKeys.add(resource.r2_key);
    }
  }
}

async function main() {
  log.heading('Content validation');

  let taxonomy;
  try {
    taxonomy = await loadTaxonomy();
  } catch (taxonomyError) {
    error(
      `Taxonomy files are invalid: ${taxonomyError instanceof Error ? taxonomyError.message : String(taxonomyError)}`,
    );
    taxonomy = undefined;
  }

  if (taxonomy) {
    const courseSlugs = new Set<string>();
    for (const course of taxonomy.courses) {
      if (courseSlugs.has(course.slug))
        error(`courses.yaml: duplicate course "${course.slug}".`);
      courseSlugs.add(course.slug);
    }
    const branchSlugs = new Set<string>();
    for (const branch of taxonomy.branches) {
      if (branchSlugs.has(branch.slug))
        error(`branches.yaml: duplicate branch "${branch.slug}".`);
      branchSlugs.add(branch.slug);
      if (!courseSlugs.has(branch.course)) {
        error(
          `branches.yaml: branch "${branch.slug}" references unknown course "${branch.course}".`,
        );
      }
    }
    const schemeSlugs = new Set<string>();
    for (const scheme of taxonomy.schemes) {
      if (schemeSlugs.has(scheme.slug))
        error(`schemes.yaml: duplicate scheme "${scheme.slug}".`);
      schemeSlugs.add(scheme.slug);
    }
  }

  const subjectFiles = await loadSubjects();
  const blogFiles = await loadBlogPosts();

  const seenCodes = new Map<string, string>();
  const seenSubjectSlugs = new Map<string, string>();
  for (const entry of subjectFiles) {
    if (entry.issues.length === 0) {
      const code = entry.data.code.toUpperCase();
      if (seenCodes.has(code)) {
        error(
          `${rel(entry.file)}: duplicate subject code "${code}" (also in ${seenCodes.get(code)}).`,
        );
      } else {
        seenCodes.set(code, rel(entry.file));
      }
      const slug = path.basename(entry.file).replace(/\.ya?ml$/i, '');
      if (seenSubjectSlugs.has(slug)) {
        error(`${rel(entry.file)}: duplicate subject filename "${slug}".`);
      } else {
        seenSubjectSlugs.set(slug, rel(entry.file));
      }
    }
    await validateSubject(entry);
  }

  const seenBlogSlugs = new Map<string, string>();
  const seenBlogTitles = new Map<string, string>();
  for (const entry of blogFiles) {
    const file = rel(entry.file);
    if (entry.issues.length > 0) {
      error(`${file}: ${entry.issues.join('\n')}`);
      continue;
    }
    const post = entry.data;
    const slug = path.basename(entry.file).replace(/\.mdx?$/i, '');
    if (seenBlogSlugs.has(slug)) {
      error(
        `${file}: duplicate blog slug "${slug}" (also in ${seenBlogSlugs.get(slug)}).`,
      );
    } else {
      seenBlogSlugs.set(slug, file);
    }
    const titleKey = post.title.trim().toLowerCase();
    if (seenBlogTitles.has(titleKey)) {
      error(`${file}: duplicate blog title (also in ${seenBlogTitles.get(titleKey)}).`);
    } else {
      seenBlogTitles.set(titleKey, file);
    }
    if (!post.draft) {
      if (isPlaceholder(post.author)) {
        error(`${file}: published post has a placeholder author.`);
      }
      if (post.ai_assisted) {
        if (!post.reviewer || isPlaceholder(post.reviewer)) {
          error(`${file}: published AI-assisted post needs a named reviewer.`);
        }
        if (!post.reviewed_at) {
          error(`${file}: published AI-assisted post needs reviewed_at.`);
        }
      }
      if (!post.verified) {
        warn(`${file}: published post has verified: false.`);
      }
    }
  }

  if (taxonomy) {
    for (const entry of subjectFiles) {
      if (entry.issues.length > 0) continue;
      const subject = entry.data;
      const file = rel(entry.file);
      if (!taxonomy.courseSlugs.has(subject.course)) {
        error(`${file}: unknown course "${subject.course}".`);
        continue;
      }
      const course = taxonomy.courses.find((item) => item.slug === subject.course);
      const validBranches = new Set(
        taxonomy.branches
          .filter((branch) => branch.course === subject.course)
          .map((branch) => branch.slug),
      );
      for (const branch of subject.branches) {
        if (!validBranches.has(branch)) {
          error(
            `${file}: branch "${branch}" is not listed for course "${subject.course}".`,
          );
        }
      }
      if (!taxonomy.schemeSlugs.has(subject.scheme)) {
        error(`${file}: unknown scheme "${subject.scheme}".`);
      }
      if (course && subject.semester > course.semesters) {
        error(
          `${file}: semester ${subject.semester} is above ${course.semesters} for ${course.slug}.`,
        );
      }
    }
  }

  log.heading('Summary');
  log.info(`${subjectFiles.length} subject file(s), ${blogFiles.length} blog post(s).`);
  if (warnings.length > 0) {
    log.warn(`${warnings.length} warning(s).`);
  }
  if (errors.length > 0) {
    log.error(`${errors.length} error(s). Fix them before publishing.`);
    process.exitCode = 1;
    return;
  }
  log.ok('Content validation passed.');
}

await main();
