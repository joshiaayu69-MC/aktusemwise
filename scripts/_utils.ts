import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import type { ZodError } from 'zod';
import {
  blogSchema,
  branchSchema,
  courseSchema,
  schemeSchema,
  sourceRecordSchema,
  sourcesFileSchema,
  subjectSchema,
  type BlogPost,
  type SourceRecord,
  type Subject,
} from '../src/lib/schemas';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const paths = {
  root,
  src: path.join(root, 'src'),
  content: path.join(root, 'src', 'content'),
  subjects: path.join(root, 'src', 'content', 'subjects'),
  blog: path.join(root, 'src', 'content', 'blog'),
  data: path.join(root, 'src', 'data'),
  contentOps: path.join(root, 'content-ops'),
  sources: path.join(root, 'content-ops', 'sources.yaml'),
  facts: path.join(root, 'content-ops', 'facts'),
  drafts: path.join(root, 'content-ops', 'drafts'),
  reviews: path.join(root, 'content-ops', 'reviews'),
  provenance: path.join(root, 'content-ops', 'provenance'),
  permissions: path.join(root, 'content-ops', 'permissions'),
  reference: path.join(root, 'content-ops', 'reference'),
  raw: path.join(root, 'content-ops', 'archive', 'raw'),
  exports: path.join(root, 'content-ops', 'exports'),
  templates: path.join(root, 'content-ops', 'templates'),
  prompts: path.join(root, 'content-ops', 'PROMPTS.md'),
};

export interface ParsedArgs {
  _: string[];
  [key: string]: string | boolean | string[];
}

export function parseArgs(argv = process.argv.slice(2)): ParsedArgs {
  const args: ParsedArgs = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token || !token.startsWith('--')) {
      if (token) args._.push(token);
      continue;
    }
    const [rawKey, inlineValue] = token.slice(2).split('=', 2);
    if (!rawKey) continue;
    const key = rawKey.trim();
    if (!key) continue;
    if (inlineValue !== undefined) {
      args[key] = inlineValue;
      continue;
    }
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      i += 1;
    } else {
      args[key] = true;
    }
  }
  return args;
}

export function stringArg(args: ParsedArgs, key: string): string | undefined {
  const value = args[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function booleanArg(args: ParsedArgs, key: string): boolean {
  return args[key] === true || args[key] === 'true';
}

export function numberArg(args: ParsedArgs, key: string, fallback: number): number {
  const value = stringArg(args, key);
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const color = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;

function paint(code: string, text: string) {
  return useColor ? `${code}${text}${color.reset}` : text;
}

export const log = {
  info(message: string) {
    console.log(`${paint(color.blue, '[info]')} ${message}`);
  },
  ok(message: string) {
    console.log(`${paint(color.green, '[ok]')} ${message}`);
  },
  warn(message: string) {
    console.warn(`${paint(color.yellow, '[warn]')} ${message}`);
  },
  error(message: string) {
    console.error(`${paint(color.red, '[error]')} ${message}`);
  },
  heading(message: string) {
    console.log(`\n${paint(color.bold, message)}`);
  },
  dim(message: string) {
    console.log(paint(color.dim, message));
  },
};

export function rel(file: string) {
  return path.relative(root, file).split(path.sep).join('/');
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function readText(file: string) {
  return readFile(file, 'utf8');
}

export async function readYamlFile(file: string): Promise<unknown> {
  const text = await readText(file);
  return YAML.parse(text);
}

export async function readJsonFile<T = unknown>(file: string): Promise<T> {
  const text = await readText(file);
  return JSON.parse(text) as T;
}

export async function writeJsonFile(file: string, data: unknown) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export async function writeTextFile(file: string, data: string) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data, 'utf8');
}

export function parseFrontmatter(text: string): {
  data: Record<string, unknown>;
  content: string;
} {
  const normalized = text.replace(/^\uFEFF/, '');
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, content: normalized };
  const parsed = YAML.parse(match[1]);
  const data =
    parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  return { data, content: normalized.slice(match[0].length) };
}

export function formatZodError(error: ZodError) {
  return error.issues
    .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');
}

export function normalizeUrl(value: string) {
  try {
    const url = new URL(value);
    url.hash = '';
    return url.href.replace(/\/$/, '');
  } catch {
    return value.replace(/\/$/, '');
  }
}

export function isPlaceholder(value: unknown) {
  if (typeof value !== 'string') return true;
  const normalized = value.trim().toLowerCase();
  return (
    !normalized ||
    normalized === 'todo' ||
    normalized === 'tbd' ||
    normalized === 'unknown' ||
    normalized.includes('replace ') ||
    normalized.includes('example.com') ||
    normalized.includes('yourbrand')
  );
}

export async function sha256File(file: string) {
  const buffer = await readFile(file);
  return `sha256:${createHash('sha256').update(buffer).digest('hex')}`;
}

export async function walkFiles(
  directory: string,
  options: { extensions?: string[]; excludeDirs?: string[] } = {},
) {
  const results: string[] = [];
  const exclude = new Set(
    options.excludeDirs ?? [
      'node_modules',
      '.git',
      'dist',
      '.astro',
      'raw',
      'exports',
      'fixtures',
    ],
  );

  async function visit(current: string) {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (exclude.has(entry.name)) continue;
        await visit(full);
        continue;
      }
      if (!entry.isFile()) continue;
      if (
        !options.extensions ||
        options.extensions.some((extension) => entry.name.endsWith(extension))
      ) {
        results.push(full);
      }
    }
  }

  await visit(directory);
  return results;
}

export interface SubjectFile {
  file: string;
  data: Subject;
  issues: string[];
}

export async function loadSubjects(): Promise<SubjectFile[]> {
  const files = (
    await walkFiles(paths.subjects, { extensions: ['.yaml', '.yml'] })
  ).filter((file) => !path.basename(file).startsWith('_'));
  const results: SubjectFile[] = [];
  for (const file of files) {
    try {
      const raw = await readYamlFile(file);
      const parsed = subjectSchema.safeParse(raw);
      if (!parsed.success) {
        results.push({
          file,
          data: raw as Subject,
          issues: [formatZodError(parsed.error)],
        });
      } else {
        results.push({ file, data: parsed.data, issues: [] });
      }
    } catch (error) {
      results.push({
        file,
        data: {} as Subject,
        issues: [error instanceof Error ? error.message : String(error)],
      });
    }
  }
  return results;
}

export interface BlogFile {
  file: string;
  data: BlogPost;
  content: string;
  issues: string[];
}

export async function loadBlogPosts(): Promise<BlogFile[]> {
  const files = (await walkFiles(paths.blog, { extensions: ['.md', '.mdx'] })).filter(
    (file) => !path.basename(file).startsWith('_'),
  );
  const results: BlogFile[] = [];
  for (const file of files) {
    try {
      const text = await readText(file);
      const { data, content } = parseFrontmatter(text);
      const parsed = blogSchema.safeParse(data);
      if (!parsed.success) {
        results.push({
          file,
          data: data as unknown as BlogPost,
          content,
          issues: [formatZodError(parsed.error)],
        });
      } else {
        results.push({ file, data: parsed.data, content, issues: [] });
      }
    } catch (error) {
      results.push({
        file,
        data: {} as BlogPost,
        content: '',
        issues: [error instanceof Error ? error.message : String(error)],
      });
    }
  }
  return results;
}

export async function loadSources(): Promise<SourceRecord[]> {
  const raw = await readYamlFile(paths.sources);
  const parsed = sourcesFileSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`sources.yaml is invalid:\n${formatZodError(parsed.error)}`);
  }
  return parsed.data;
}

export async function loadSourceMap() {
  const sources = await loadSources();
  const map = new Map<string, SourceRecord>();
  for (const source of sources) {
    map.set(normalizeUrl(source.url), source);
  }
  return map;
}

export async function loadTaxonomy() {
  const [coursesRaw, branchesRaw, schemesRaw] = await Promise.all([
    readYamlFile(path.join(paths.data, 'courses.yaml')),
    readYamlFile(path.join(paths.data, 'branches.yaml')),
    readYamlFile(path.join(paths.data, 'schemes.yaml')),
  ]);

  const courses = courseSchema.array().parse(coursesRaw);
  const branches = branchSchema.array().parse(branchesRaw);
  const schemes = schemeSchema.array().parse(schemesRaw);

  return {
    courses,
    branches,
    schemes,
    courseSlugs: new Set(courses.map((course) => course.slug)),
    branchSlugs: new Set(branches.map((branch) => branch.slug)),
    schemeSlugs: new Set(schemes.map((scheme) => scheme.slug)),
  };
}

export function ensureExists(file: string, message: string) {
  if (!existsSync(file)) {
    throw new Error(`${message}: ${rel(file)}`);
  }
}

export function resourceIdFromPath(file: string) {
  return path.basename(file).replace(/\.(json|mdx|pdf)$/i, '');
}

export function isPublished(subject: Pick<Subject, 'draft'>) {
  return !subject.draft;
}

export function isTruthy(value: unknown) {
  return value === true;
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export { sourceRecordSchema };
