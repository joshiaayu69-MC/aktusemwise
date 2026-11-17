import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { log, paths, readText } from './_utils';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
}

let envLoaded = false;

export async function loadEnv() {
  if (envLoaded) return;
  envLoaded = true;
  for (const name of ['.env.local', '.env']) {
    const file = path.join(paths.root, name);
    if (!existsSync(file)) continue;
    const text = await readFile(file, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const equals = trimmed.indexOf('=');
      if (equals <= 0) continue;
      const key = trimmed.slice(0, equals).trim();
      let value = trimmed.slice(equals + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}

export async function aiConfig(): Promise<AIConfig> {
  await loadEnv();
  const baseUrl = (process.env.AI_BASE_URL || 'https://api.openai.com/v1').replace(
    /\/$/,
    '',
  );
  const apiKey = process.env.AI_API_KEY || '';
  const model = process.env.AI_MODEL || '';
  if (!apiKey) {
    throw new Error(
      'AI_API_KEY is missing. Copy .env.example to .env and add a provider key, or export it.',
    );
  }
  if (!model) {
    throw new Error(
      'AI_MODEL is missing. Set it in .env (for example AI_MODEL=gpt-4.1-mini).',
    );
  }
  return { baseUrl, apiKey, model };
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function readPrompt(name: string, version = '1.0') {
  const text = await readText(paths.prompts);
  const pattern = new RegExp(
    `<!--\\s*prompt:${escapeRegExp(name)}:${escapeRegExp(version)}\\s*-->\\s*\\n\\x60\\x60\\x60(?:text)?\\s*\\n([\\s\\S]*?)\\x60\\x60\\x60`,
    'm',
  );
  const match = text.match(pattern);
  if (!match || !match[1]) {
    throw new Error(`Prompt "${name}:${version}" was not found in ${paths.prompts}.`);
  }
  return match[1].trim();
}

export function fillPrompt(template: string, values: Record<string, string>) {
  return template.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (match, key: string) => {
    return Object.prototype.hasOwnProperty.call(values, key)
      ? (values[key] ?? match)
      : match;
  });
}

export function truncate(value: string, maxChars: number) {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, maxChars)}\n\n[truncated at ${maxChars} characters]`;
}

export function extractJson(text: string) {
  const cleaned = text
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();
  const objectStart = cleaned.indexOf('{');
  const arrayStart = cleaned.indexOf('[');
  const starts = [objectStart, arrayStart].filter((index) => index >= 0);
  if (starts.length === 0) {
    throw new Error(`The model did not return JSON:\n${cleaned.slice(0, 500)}`);
  }
  const start = Math.min(...starts);
  const open = cleaned[start];
  const close = open === '{' ? '}' : ']';
  const end = cleaned.lastIndexOf(close);
  if (end <= start) {
    throw new Error(`The model returned incomplete JSON:\n${cleaned.slice(0, 500)}`);
  }
  const candidate = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(candidate) as unknown;
  } catch (error) {
    throw new Error(
      `Could not parse JSON: ${error instanceof Error ? error.message : String(error)}\n${candidate.slice(0, 800)}`,
    );
  }
}

export async function callAI(
  messages: ChatMessage[],
  options: { temperature?: number; maxTokens?: number; jsonMode?: boolean } = {},
) {
  const config = await aiConfig();
  const body: Record<string, unknown> = {
    model: config.model,
    messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.maxTokens ?? 4096,
  };
  if (options.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(180_000),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(
      `AI request failed (HTTP ${response.status}). ${text.slice(0, 800) || 'No response body.'}`,
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) =>
        part && typeof part === 'object' && 'text' in part
          ? String((part as { text?: unknown }).text ?? '')
          : '',
      )
      .join('');
  }
  throw new Error('The AI response did not include message content.');
}

export async function buildMessages(
  promptName: string,
  version: string,
  values: Record<string, string>,
  extraUserText?: string,
) {
  const shared = await readPrompt('shared', '1.0');
  const task = await readPrompt(promptName, version);
  const user = fillPrompt(task, values);
  log.dim(`Prompt: ${promptName}:${version}`);
  return [
    { role: 'system' as const, content: shared },
    {
      role: 'user' as const,
      content: extraUserText ? `${user}\n\n---\n\n${extraUserText}` : user,
    },
  ];
}
