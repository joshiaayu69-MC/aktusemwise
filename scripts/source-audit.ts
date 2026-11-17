import {
  booleanArg,
  formatZodError,
  isPlaceholder,
  loadTaxonomy,
  log,
  parseArgs,
  paths,
  readYamlFile,
  rel,
  todayISO,
} from './_utils';
import { sourcesFileSchema } from '../src/lib/schemas';

const args = parseArgs();
const strict = booleanArg(args, 'strict');
const checkUrls = booleanArg(args, 'check-urls');
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

const rehostUse = (use: string) => use.startsWith('rehost-');

async function main() {
  log.heading('Source audit');

  let raw: unknown;
  try {
    raw = await readYamlFile(paths.sources);
  } catch (readError) {
    error(
      `Cannot read ${rel(paths.sources)}: ${readError instanceof Error ? readError.message : String(readError)}`,
    );
    process.exitCode = 1;
    return;
  }

  const parsed = sourcesFileSchema.safeParse(raw);
  if (!parsed.success) {
    error(`Invalid ${rel(paths.sources)}:\n${formatZodError(parsed.error)}`);
    process.exitCode = 1;
    return;
  }

  const sources = parsed.data;
  const seen = new Set<string>();
  const today = new Date();
  const maxAgeDays = 365;

  for (const source of sources) {
    if (seen.has(source.id)) {
      error(`Duplicate source id "${source.id}".`);
    }
    seen.add(source.id);

    if (isPlaceholder(source.notes ?? '')) {
      warn(`Source "${source.id}" has no useful notes. Record why it is allowed.`);
    }

    if (source.licence === 'blocked') {
      const message = `Source "${source.id}" is blocked. Do not use it for authoring.`;
      if (strict) error(message);
      else warn(message);
      if (source.allowed_operations.some((use) => use !== 'facts-only')) {
        error(`Blocked source "${source.id}" lists an operation other than facts-only.`);
      }
    }

    if (source.risk === 'high') {
      const message = `Source "${source.id}" is high risk. Review before use.`;
      if (strict) error(message);
      else warn(message);
    }

    if (source.licence === 'link-only') {
      if (source.rehost_pdf) {
        error(`Link-only source "${source.id}" cannot have rehost_pdf: true.`);
      }
      if (source.allowed_operations.some(rehostUse)) {
        error(`Link-only source "${source.id}" lists a rehost operation.`);
      }
    }

    if (source.licence === 'official-facts-only' && source.rehost_pdf) {
      error(`Official-facts-only source "${source.id}" cannot be rehosted.`);
    }

    if (source.rehost_pdf) {
      if (!source.allowed_operations.some(rehostUse)) {
        error(`Source "${source.id}" has rehost_pdf: true but no rehost operation.`);
      }
      if (!source.commercial_use_ok) {
        error(`Source "${source.id}" cannot be rehosted for a commercial site.`);
      }
      if (source.licence.endsWith('nc-4.0') || source.licence.endsWith('nc-sa-4.0')) {
        error(`NC source "${source.id}" cannot be rehosted on a site with ads.`);
      }
    }

    if (source.share_alike && source.rehost_pdf) {
      warn(
        `Share-alike source "${source.id}" is rehosted. Keep the same licence and attribution on the PDF.`,
      );
    }

    if (source.licence === 'cc-by-nc-4.0' || source.licence === 'cc-by-nc-sa-4.0') {
      if (source.commercial_use_ok) {
        error(`NC source "${source.id}" cannot have commercial_use_ok: true.`);
      }
    }

    if (!source.url.startsWith('https://')) {
      warn(`Source "${source.id}" does not use HTTPS.`);
    }

    const ageDays = Math.floor(
      (today.getTime() - source.accessed_at.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (ageDays > maxAgeDays) {
      warn(
        `Source "${source.id}" was last accessed ${ageDays} days ago. Verify it before reuse.`,
      );
    }
    if (source.accessed_at.getTime() > today.getTime()) {
      warn(`Source "${source.id}" has an accessed_at date in the future.`);
    }
  }

  if (checkUrls) {
    log.heading('URL checks');
    for (const source of sources) {
      try {
        const response = await fetch(source.url, {
          method: 'HEAD',
          redirect: 'follow',
          signal: AbortSignal.timeout(10_000),
          headers: { 'user-agent': 'AktuSemWise source-audit/1.0' },
        });
        if (!response.ok) {
          warn(`Source "${source.id}" returned HTTP ${response.status}: ${source.url}`);
        } else {
          log.ok(`${source.id}: HTTP ${response.status}`);
        }
      } catch (fetchError) {
        warn(
          `Source "${source.id}" could not be reached (${fetchError instanceof Error ? fetchError.message : String(fetchError)}).`,
        );
      }
    }
  }

  try {
    const taxonomy = await loadTaxonomy();
    log.info(
      `Taxonomy: ${taxonomy.courses.length} course(s), ${taxonomy.branches.length} branch(s), ${taxonomy.schemes.length} scheme(s).`,
    );
  } catch (taxonomyError) {
    warn(
      `Taxonomy could not be loaded (${taxonomyError instanceof Error ? taxonomyError.message : String(taxonomyError)}).`,
    );
  }

  log.heading('Summary');
  log.info(`Checked ${sources.length} source record(s) on ${todayISO()}.`);
  if (warnings.length > 0) log.warn(`${warnings.length} warning(s).`);
  if (errors.length > 0) {
    log.error(`${errors.length} error(s).`);
    process.exitCode = 1;
    return;
  }
  log.ok('Source audit passed.');
}

await main();
