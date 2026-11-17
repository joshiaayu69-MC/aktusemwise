import path from 'node:path';
import {
  loadSourceMap,
  loadSubjects,
  log,
  normalizeUrl,
  paths,
  rel,
  walkFiles,
} from './_utils';
import type { Resource, Subject } from '../src/lib/schemas';

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

function normalise(value: string) {
  return normalizeUrl(value);
}

async function main() {
  log.heading('Licence gate');

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

  const permissionFiles = await walkFiles(paths.permissions, {
    extensions: ['.md', '.txt', '.pdf'],
    excludeDirs: [],
  }).catch(() => []);

  const subjects = await loadSubjects();
  let checked = 0;

  for (const entry of subjects) {
    if (entry.issues.length > 0) {
      error(`${rel(entry.file)}: ${entry.issues.join('\n')}`);
      continue;
    }
    const subject = entry.data;
    for (const [index, resource] of subject.resources.entries()) {
      checked += 1;
      await checkResource(
        subject,
        resource,
        index,
        entry.file,
        sourceMap,
        permissionFiles,
      );
    }
  }

  log.heading('Summary');
  log.info(`Checked ${checked} resource(s) against ${sourceMap.size} source URL(s).`);
  if (warnings.length > 0) log.warn(`${warnings.length} warning(s).`);
  if (errors.length > 0) {
    log.error(
      `${errors.length} error(s). Fix the source basis or licence before publishing.`,
    );
    process.exitCode = 1;
    return;
  }
  log.ok('Licence gate passed.');
}

async function checkResource(
  subject: Subject,
  resource: Resource,
  index: number,
  subjectFile: string,
  sourceMap: Awaited<ReturnType<typeof loadSourceMap>>,
  permissionFiles: string[],
) {
  const label = `${rel(subjectFile)} resources[${index}] "${resource.title}"`;

  if (resource.source === 'original') {
    if (resource.source_basis.length > 0) {
      warn(
        `${label}: original resource has source_basis entries. Confirm they are facts only.`,
      );
    }
    return;
  }

  if (resource.source_basis.length === 0) {
    error(`${label}: non-original resource needs at least one source_basis entry.`);
    return;
  }

  if (resource.source === 'official-link') {
    if (!resource.official_url) {
      error(`${label}: official-link resource needs official_url.`);
    }
    if (resource.r2_key) {
      error(`${label}: official-link resource must not have r2_key.`);
    }
  }

  if (resource.source === 'open-license' && resource.r2_key) {
    const derivativeUse = resource.source_basis.some(
      (basis) => basis.use.startsWith('rehost-') || basis.use.startsWith('adapt-'),
    );
    if (!derivativeUse) {
      error(
        `${label}: open-license PDF needs a rehost or adapt source_basis entry, not facts-only.`,
      );
    }
  }

  if (resource.source === 'contributor') {
    if (
      resource.licence !== 'permission-granted' &&
      resource.licence !== 'site-original'
    ) {
      warn(
        `${label}: contributor resource should record permission-granted or site-original.`,
      );
    }
  }

  if (resource.licence === 'permission-granted') {
    const subjectCode = subject.code.toLowerCase();
    const resourceSlug = path
      .basename(resource.provenance ?? resource.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const hasPermission = permissionFiles.some((file) => {
      const name = path.basename(file).toLowerCase();
      return name.includes(subjectCode) || name.includes(resourceSlug);
    });
    if (!hasPermission) {
      error(
        `${label}: permission-granted licence has no matching file in content-ops/permissions/.`,
      );
    }
  }

  for (const basis of resource.source_basis) {
    const source = sourceMap.get(normalise(basis.url));
    if (!source) {
      error(
        `${label}: source URL is not registered in sources.yaml (${basis.url}). Add a source record first.`,
      );
      continue;
    }

    if (source.licence === 'blocked') {
      error(`${label}: source "${source.id}" is blocked.`);
      continue;
    }

    if (!source.allowed_operations.includes(basis.use)) {
      error(
        `${label}: use "${basis.use}" is not allowed for source "${source.id}" (${source.allowed_operations.join(', ')}).`,
      );
    }

    if (basis.use.startsWith('rehost-') && !source.rehost_pdf) {
      error(`${label}: source "${source.id}" does not allow PDF rehosting.`);
    }

    if (basis.use.startsWith('rehost-') && !source.commercial_use_ok) {
      warn(
        `${label}: source "${source.id}" is not commercial-use friendly. Keep this PDF off ad-supported pages.`,
      );
    }

    if (
      source.share_alike &&
      (basis.use.startsWith('adapt-') || basis.use.startsWith('rehost-')) &&
      resource.licence !== 'cc-by-sa-4.0'
    ) {
      warn(
        `${label}: share-alike source "${source.id}" needs a CC BY-SA 4.0 licence on the derivative.`,
      );
    }

    if (source.licence === 'official-facts-only' && basis.use !== 'facts-only') {
      if (basis.use === 'quote-limited') {
        warn(`${label}: keep any official quote short and attributed.`);
      } else if (basis.use !== 'link-only') {
        error(
          `${label}: official-facts-only source "${source.id}" cannot be used as "${basis.use}".`,
        );
      }
    }

    if (!source.url.startsWith('https://')) {
      warn(`${label}: source "${source.id}" is not HTTPS.`);
    }
  }
}

await main();
