import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  booleanArg,
  loadSubjects,
  log,
  parseArgs,
  parseFrontmatter,
  paths,
  readJsonFile,
  readText,
  rel,
  resourceIdFromPath,
  sha256File,
  stringArg,
  todayISO,
  writeJsonFile,
  writeTextFile,
} from './_utils';
import { provenanceSchema } from '../src/lib/schemas';
import { SITE } from '../src/lib/site';

const args = parseArgs();

if (booleanArg(args, 'help')) {
  console.log(`Usage: npm run content:pdf -- --resource bcs501-notes [--draft path] [--out path] [--html-only] [--force] [--update-provenance]

Builds content-ops/exports/<id>.html and a print-ready PDF using local Chrome or Edge.
The PDF is never committed. Upload it to R2 and update the provenance hash.`);
  process.exit(0);
}

const resourceArg = stringArg(args, 'resource') ?? args._[0];
const draftArg = stringArg(args, 'draft');
const outArg = stringArg(args, 'out');
const htmlOnly = booleanArg(args, 'html-only');
const force = booleanArg(args, 'force');
const updateProvenance = booleanArg(args, 'update-provenance');

if (!resourceArg && !draftArg) {
  log.error('Missing --resource or --draft.');
  process.exit(1);
}

const id = resourceArg ?? resourceIdFromPath(draftArg ?? '');
const draftFile = draftArg
  ? path.resolve(paths.root, draftArg)
  : path.join(paths.drafts, `${id}.mdx`);

if (!existsSync(draftFile)) {
  log.error(`Draft not found: ${rel(draftFile)}`);
  process.exit(1);
}

const exportDir = paths.exports;
const htmlFile = path.join(exportDir, `${id}.html`);
const pdfFile = outArg
  ? path.resolve(paths.root, outArg)
  : path.join(exportDir, `${id}.pdf`);
const provenanceFile = path.join(paths.provenance, `${id}.json`);

if (!force && existsSync(pdfFile)) {
  log.error(`PDF already exists. Use --force to replace it: ${rel(pdfFile)}`);
  process.exit(1);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inlineMarkdown(text: string) {
  const tokens: string[] = [];
  const slot = (html: string) => {
    const index = tokens.push(html) - 1;
    return `@@TOKEN${index}@@`;
  };

  let value = escapeHtml(text);
  value = value.replace(/`([^`\n]+)`/g, (_match, code: string) =>
    slot(`<code>${escapeHtml(code)}</code>`),
  );
  value = value.replace(/\$([^$\n]+)\$/g, (_match, math: string) =>
    slot(`<span class="math">${escapeHtml(math)}</span>`),
  );
  value = value.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (_match, alt: string, src: string) => {
      if (/^(https?:|data:)/i.test(src)) {
        return slot(`<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />`);
      }
      return slot(
        `<span class="image-placeholder">[Image: ${escapeHtml(alt || src)}]</span>`,
      );
    },
  );
  value = value.replace(
    /\[([^\]]+)\]\(((?:https?:|mailto:)[^)\s]+)\)/g,
    (_match, label: string, href: string) =>
      slot(`<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`),
  );
  value = value.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  value = value.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  value = value.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  return value.replace(
    /@@TOKEN(\d+)@@/g,
    (_match, index: string) => tokens[Number(index)] ?? '',
  );
}

function isTableStart(lines: string[], index: number) {
  const line = lines[index] ?? '';
  const next = lines[index + 1] ?? '';
  return line.includes('|') && /^\s*\|?[\s:-]+\|[\s:|-]*$/.test(next);
}

function renderTable(lines: string[], start: number) {
  const header = splitRow(lines[start] ?? '');
  let index = start + 2;
  const rows: string[][] = [];
  while (index < lines.length && (lines[index] ?? '').includes('|')) {
    rows.push(splitRow(lines[index] ?? ''));
    index += 1;
  }
  const head = `<thead><tr>${header
    .map((cell) => `<th>${inlineMarkdown(cell.trim())}</th>`)
    .join('')}</tr></thead>`;
  const body = `<tbody>${rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${inlineMarkdown(cell.trim())}</td>`).join('')}</tr>`,
    )
    .join('')}</tbody>`;
  return { html: `<table>${head}${body}</table>`, next: index };
}

function splitRow(line: string) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|');
}

function isBlockStart(line: string) {
  return (
    /^#{1,6}\s+/.test(line) ||
    /^```/.test(line) ||
    /^---+$/.test(line) ||
    /^>\s?/.test(line) ||
    /^[-*+]\s+/.test(line) ||
    /^\d+\.\s+/.test(line) ||
    /^\$\$/.test(line)
  );
}

function markdownToHtml(markdown: string) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? '';

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^```(\w+)?\s*$/);
    if (fence) {
      const language = fence[1] ?? 'text';
      index += 1;
      const code: string[] = [];
      while (index < lines.length && !/^```/.test(lines[index] ?? '')) {
        code.push(lines[index] ?? '');
        index += 1;
      }
      index += 1;
      html.push(
        `<pre><code class="language-${escapeHtml(language)}">${escapeHtml(code.join('\n'))}</code></pre>`,
      );
      continue;
    }

    if (/^\$\$/.test(line)) {
      const math: string[] = [line.replace(/^\$\$/, '')];
      index += 1;
      while (index < lines.length && !/\$\$/.test(lines[index] ?? '')) {
        math.push(lines[index] ?? '');
        index += 1;
      }
      const last = lines[index] ?? '';
      math.push(last.replace(/\$\$/, ''));
      index += 1;
      html.push(`<pre class="math-block">${escapeHtml(math.join('\n').trim())}</pre>`);
      continue;
    }

    if (isTableStart(lines, index)) {
      const table = renderTable(lines, index);
      html.push(table.html);
      index = table.next;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1]?.length ?? 2;
      const text = heading[2] ?? '';
      html.push(`<h${level}>${inlineMarkdown(text)}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^---+$/.test(line)) {
      html.push('<hr />');
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (index < lines.length && /^>\s?/.test(lines[index] ?? '')) {
        quote.push((lines[index] ?? '').replace(/^>\s?/, ''));
        index += 1;
      }
      html.push(`<blockquote>${markdownToHtml(quote.join('\n'))}</blockquote>`);
      continue;
    }

    if (/^[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*+]\s+/.test(lines[index] ?? '')) {
        items.push((lines[index] ?? '').replace(/^[-*+]\s+/, ''));
        index += 1;
      }
      html.push(
        `<ul>${items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index] ?? '')) {
        items.push((lines[index] ?? '').replace(/^\d+\.\s+/, ''));
        index += 1;
      }
      html.push(
        `<ol>${items.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ol>`,
      );
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (index < lines.length) {
      const next = lines[index] ?? '';
      if (!next.trim() || isBlockStart(next) || isTableStart(lines, index)) break;
      paragraph.push(next);
      index += 1;
    }
    html.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
  }

  return html.join('\n');
}

function findBrowser() {
  if (process.platform === 'win32') {
    const local = process.env.LOCALAPPDATA;
    const programFiles = process.env.ProgramFiles;
    const programFilesX86 = process.env['ProgramFiles(x86)'];
    const candidates = [
      local && path.join(local, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      programFiles &&
        path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      programFilesX86 &&
        path.join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      programFiles &&
        path.join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      programFilesX86 &&
        path.join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    ].filter((candidate): candidate is string => Boolean(candidate));
    return candidates.find((candidate) => existsSync(candidate));
  }

  if (process.platform === 'darwin') {
    const candidates = [
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/Applications/Chromium.app/Contents/MacOS/Chromium',
    ];
    return candidates.find((candidate) => existsSync(candidate));
  }

  for (const bin of ['google-chrome', 'chromium', 'chromium-browser', 'microsoft-edge']) {
    try {
      const found = execFileSync('which', [bin], { encoding: 'utf8' }).trim();
      if (found) return found;
    } catch {
      // Try the next binary.
    }
  }
  return undefined;
}

const draftText = await readText(draftFile);
const { data: frontmatter, content } = parseFrontmatter(draftText);
const resourceId = String(frontmatter.resource_id ?? id);
const title = stringArg(args, 'title') ?? String(frontmatter.title ?? resourceId);
const subjectCode = String(frontmatter.subject_code ?? '');
const resourceType = String(frontmatter.resource_type ?? 'resource');
const aiAssisted = frontmatter.ai_assisted === true;

const subjects = await loadSubjects();
const subjectEntry = subjects.find(
  (entry) => entry.issues.length === 0 && entry.data.code === subjectCode,
);
const subject = subjectEntry?.data;
const subjectName = subject?.name ?? 'Subject';
const semester = subject?.semester ?? '';

let provenance: Record<string, unknown> | undefined;
if (existsSync(provenanceFile)) {
  try {
    const raw = await readJsonFile(provenanceFile);
    const parsed = provenanceSchema.safeParse(raw);
    if (parsed.success) provenance = parsed.data;
  } catch {
    provenance = undefined;
  }
}

const reviewer =
  provenance && typeof provenance.review === 'object' && provenance.review
    ? String((provenance.review as { reviewer?: string }).reviewer ?? '')
    : 'Draft - not reviewed';
const licence = provenance ? String(provenance.licence) : 'site-original';
const watermark = provenance
  ? String(provenance.watermark ?? `${SITE.name} - original study material`)
  : `${SITE.name} - original study material - draft`;

if (aiAssisted && /todo|draft/i.test(reviewer)) {
  log.warn('Draft is AI-assisted and not reviewed. The PDF will be watermarked DRAFT.');
}

const bodyHtml = markdownToHtml(content);
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  @page { size: A4; margin: 18mm 16mm 20mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1c1917; line-height: 1.62; font-size: 10.8pt; }
  .watermark { position: fixed; top: 45%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-family: Arial, sans-serif; font-size: 64px; font-weight: 700; letter-spacing: 0.04em; color: #0c0a09; opacity: 0.05; white-space: nowrap; pointer-events: none; z-index: 0; }
  .content { position: relative; z-index: 1; }
  .cover { page-break-after: always; padding-top: 8mm; }
  .cover .kicker { font-family: Arial, sans-serif; font-size: 9pt; letter-spacing: 0.14em; text-transform: uppercase; color: #777169; }
  .cover h1 { font-family: Georgia, serif; font-size: 30pt; font-weight: 400; line-height: 1.12; margin: 10mm 0 4mm; color: #0c0a09; }
  .cover .meta { font-family: Arial, sans-serif; font-size: 9.5pt; color: #44403c; margin: 0 0 2mm; }
  .cover .rule { border: 0; border-top: 2px solid #0c0a09; margin: 8mm 0; }
  .cover .notice { font-family: Arial, sans-serif; font-size: 8.5pt; color: #59544f; line-height: 1.5; }
  h2 { font-family: Arial, sans-serif; font-size: 15pt; line-height: 1.25; margin: 9mm 0 3mm; color: #0c0a09; break-after: avoid; }
  h3 { font-family: Arial, sans-serif; font-size: 11.5pt; line-height: 1.3; margin: 6mm 0 2mm; color: #292524; break-after: avoid; }
  h4 { font-family: Arial, sans-serif; font-size: 10.5pt; margin: 5mm 0 2mm; }
  p { margin: 0 0 3.2mm; }
  ul, ol { margin: 0 0 3.5mm 5mm; padding: 0; }
  li { margin: 0 0 1.4mm; }
  blockquote { margin: 4mm 0; padding: 3mm 4mm; border-left: 3px solid #d6d3d1; background: #faf9f8; font-style: italic; break-inside: avoid; }
  code { font-family: "Courier New", monospace; font-size: 9pt; background: #f5f5f4; padding: 0.4mm 1mm; border-radius: 1mm; }
  pre { font-family: "Courier New", monospace; font-size: 8.6pt; line-height: 1.45; background: #f5f5f4; border: 1px solid #e7e5e4; padding: 3mm; overflow-wrap: anywhere; white-space: pre-wrap; break-inside: avoid; }
  .math, .math-block { font-family: "Cambria Math", "Times New Roman", serif; }
  .math-block { background: #faf9f8; }
  table { width: 100%; border-collapse: collapse; margin: 4mm 0; font-size: 9.2pt; break-inside: avoid; }
  th, td { border: 1px solid #d6d3d1; padding: 1.8mm 2mm; text-align: left; vertical-align: top; }
  th { background: #f5f5f4; font-family: Arial, sans-serif; font-size: 8.8pt; }
  hr { border: 0; border-top: 1px solid #d6d3d1; margin: 6mm 0; }
  a { color: #1c1917; text-decoration: underline; }
  .image-placeholder { color: #777169; font-style: italic; }
  .license { margin-top: 10mm; border-top: 1px solid #d6d3d1; padding-top: 4mm; font-family: Arial, sans-serif; font-size: 8.2pt; color: #59544f; line-height: 1.5; }
  .draft { color: #b91c1c; font-weight: 700; }
</style>
</head>
<body>
  <div class="watermark">${escapeHtml(watermark)}</div>
  <div class="content">
    <section class="cover">
      <p class="kicker">${escapeHtml(resourceType.replace(/-/g, ' '))} &middot; ${escapeHtml(subjectCode || 'Subject')}</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="meta">${escapeHtml(subjectName)}${semester ? ` &middot; Semester ${escapeHtml(String(semester))}` : ''}</p>
      <p class="meta">Prepared ${escapeHtml(todayISO())}${aiAssisted ? ' &middot; AI-assisted draft' : ''}</p>
      <p class="meta">Reviewer: ${escapeHtml(reviewer)}</p>
      <hr class="rule" />
      <p class="notice">
        Original study material from ${escapeHtml(SITE.name)}. This is an independent student resource and is
        not affiliated with, endorsed by, or connected to Dr. A.P.J. Abdul Kalam Technical
        University (AKTU). Always confirm syllabus, scheme, dates, and results with the official
        university source.
      </p>
    </section>
    <main>
      ${bodyHtml}
    </main>
    <footer class="license">
      <p><strong>Licence:</strong> ${escapeHtml(licence)}</p>
      <p><strong>Reviewer:</strong> ${escapeHtml(reviewer)}</p>
      <p><strong>Generated:</strong> ${escapeHtml(todayISO())}</p>
      <p>
        If you believe this material infringes your rights, contact
        <a href="mailto:${escapeHtml(SITE.grievanceEmail)}">${escapeHtml(SITE.grievanceEmail)}</a> with the URL and
        the details. See the takedown policy on the site.
      </p>
      <p class="draft">${/todo|draft/i.test(reviewer) ? 'DRAFT - not approved for publication.' : 'Reviewed original study material.'}</p>
    </footer>
  </div>
</body>
</html>`;

await writeTextFile(htmlFile, html);
log.ok(`HTML: ${rel(htmlFile)}`);

if (htmlOnly) {
  log.info(
    'Stopped after HTML. Open it in a browser and print to PDF, or rerun without --html-only.',
  );
  process.exit(0);
}

const browser = findBrowser();
if (!browser) {
  log.error(
    'Chrome or Edge was not found. Install Chrome/Edge, or run with --html-only and print to PDF manually.',
  );
  process.exit(1);
}

const browserArgs = [
  '--headless=new',
  '--disable-gpu',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--hide-scrollbars',
  '--allow-file-access-from-files',
  '--print-to-pdf-no-header',
  '--virtual-time-budget=2000',
  `--print-to-pdf=${pdfFile}`,
  pathToFileURL(htmlFile).href,
];

await mkdir(path.dirname(pdfFile), { recursive: true });

let result = spawnSync(browser, browserArgs, { encoding: 'utf8', timeout: 120_000 });
if (result.status !== 0) {
  const fallbackArgs = browserArgs.map((value) =>
    value === '--headless=new' ? '--headless' : value,
  );
  log.warn('First print attempt failed. Retrying with legacy headless mode.');
  result = spawnSync(browser, fallbackArgs, { encoding: 'utf8', timeout: 120_000 });
}

if (result.status !== 0 || !existsSync(pdfFile)) {
  log.error(`PDF generation failed (exit ${result.status ?? 'unknown'}).`);
  if (result.stderr) log.dim(result.stderr.trim());
  process.exit(1);
}

const hash = await sha256File(pdfFile);
log.ok(`PDF: ${rel(pdfFile)}`);
log.info(`SHA-256: ${hash}`);
log.info('Upload the PDF to R2. Do not commit it.');

if (updateProvenance) {
  if (!existsSync(provenanceFile)) {
    log.warn(`No provenance file to update: ${rel(provenanceFile)}`);
  } else {
    const raw = await readJsonFile(provenanceFile);
    const parsed = provenanceSchema.safeParse(raw);
    if (!parsed.success) {
      log.error('Provenance file is invalid. Fix it before updating the hash.');
      process.exit(1);
    }
    const updated = {
      ...parsed.data,
      sha256: hash,
      created_at: todayISO(),
    };
    await writeJsonFile(provenanceFile, updated);
    log.ok(`Updated provenance hash: ${rel(provenanceFile)}`);
  }
}

log.info(
  'Next: upload the PDF to R2, update the resource r2_key/file_hash in the subject YAML, and run npm run validate.',
);
