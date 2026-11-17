import { z } from 'zod';

export const RESOURCE_TYPES = [
  'notes',
  'pyq',
  'solution',
  'model-paper',
  'question-bank',
  'lab-file',
  'viva',
  'syllabus',
  'important-questions',
] as const;

export const RESOURCE_LICENCES = [
  'site-original',
  'cc0-1.0',
  'public-domain',
  'cc-by-4.0',
  'cc-by-sa-4.0',
  'godl-1.0',
  'permission-granted',
] as const;

export const SOURCE_LICENCES = [
  'site-original',
  'cc0-1.0',
  'public-domain',
  'cc-by-4.0',
  'cc-by-sa-4.0',
  'cc-by-nc-4.0',
  'cc-by-nc-sa-4.0',
  'godl-1.0',
  'official-facts-only',
  'link-only',
  'permission-granted',
  'blocked',
] as const;

export const SOURCE_USES = [
  'facts-only',
  'link-only',
  'quote-limited',
  'adapt-cc-by',
  'adapt-cc-by-sa',
  'rehost-cc-by',
  'rehost-cc-by-sa',
  'rehost-cc0-pd',
  'rehost-godl',
  'rehost-permission',
] as const;

export const RESOURCE_SOURCES = [
  'original',
  'contributor',
  'open-license',
  'official-link',
] as const;

export const RISK_LEVELS = ['low', 'medium', 'high'] as const;

export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase hyphenated slugs only.');

export const resourceTypeSchema = z.enum(RESOURCE_TYPES);
export const resourceLicenceSchema = z.enum(RESOURCE_LICENCES);
export const sourceLicenceSchema = z.enum(SOURCE_LICENCES);
export const sourceUseSchema = z.enum(SOURCE_USES);
export const resourceSourceSchema = z.enum(RESOURCE_SOURCES);
export const riskSchema = z.enum(RISK_LEVELS);

export const sourceBasisSchema = z.object({
  url: z.url(),
  use: sourceUseSchema,
});

export const resourceSchema = z.object({
  type: resourceTypeSchema,
  title: z.string().min(3).max(180),
  description: z.string().max(600).optional(),
  r2_key: z
    .string()
    .regex(
      /^[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+\.pdf$/,
      'Use the code/type/file.pdf naming convention.',
    )
    .optional(),
  pages: z.number().int().positive().max(2000).optional(),
  size_mb: z.number().positive().max(25).optional(),
  updated: z.coerce.date().optional(),
  verified: z.boolean().default(false),
  source: resourceSourceSchema.optional(),
  official_url: z.url().optional(),
  licence: resourceLicenceSchema.default('site-original'),
  source_basis: z.array(sourceBasisSchema).default([]),
  provenance: z
    .string()
    .regex(/^content-ops\/provenance\/[a-z0-9-]+\.json$/)
    .optional(),
  ai_assisted: z.boolean().default(false),
  reviewer: z.string().min(1).optional(),
  reviewed_at: z.coerce.date().optional(),
  similarity_score: z.number().min(0).max(1).optional(),
  file_hash: z
    .string()
    .regex(/^(sha256:)?[a-f0-9]{64}$/)
    .optional(),
  year: z.string().min(1).max(20).optional(),
  unit: z.number().int().positive().max(20).optional(),
});

export const unitQuestionSchema = z.object({
  question: z.string().min(5).max(500),
  marks: z.number().int().positive().max(20).optional(),
  frequency: z.number().int().positive().optional(),
  years: z.array(z.string().min(1).max(30)).default([]),
  key_points: z.array(z.string().min(1).max(300)).default([]),
  importance: z.enum(['high', 'medium', 'standard']).default('standard'),
});

export const syllabusUnitSchema = z.object({
  unit: z.number().int().positive().max(20),
  title: z.string().min(1).max(200),
  topics: z.array(z.string().min(1).max(240)).min(1),
  hours: z.number().positive().max(100).optional(),
  marks: z.number().positive().max(200).optional(),
  questions: z.array(unitQuestionSchema).default([]),
});

export const faqSchema = z.object({
  question: z.string().min(5).max(300),
  answer: z.string().min(10).max(2000),
});

export const subjectSchema = z.object({
  code: z
    .string()
    .regex(/^[A-Z]{2,5}\d{3}[A-Z]?$/, 'Use an official uppercase subject code.'),
  name: z.string().min(3).max(200),
  course: slugSchema,
  branches: z.array(slugSchema).min(1),
  semester: z.number().int().positive().max(12),
  scheme: z.string().min(1).max(40),
  credits: z.number().positive().max(30).optional(),
  source_url: z.url(),
  verified: z.boolean().default(false),
  draft: z.boolean().default(false),
  description: z.string().min(150).max(3000),
  syllabus_units: z.array(syllabusUnitSchema).default([]),
  resources: z.array(resourceSchema).default([]),
  faqs: z.array(faqSchema).default([]),
  aliases: z.array(z.string().min(1).max(120)).default([]),
  tags: z.array(z.string().min(1).max(80)).default([]),
  updated: z.coerce.date().optional(),
  last_verified: z.coerce.date().optional(),
});

export const blogSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(50).max(500),
  published: z.coerce.date(),
  updated: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  tags: z.array(z.string().min(1).max(80)).default([]),
  source_url: z.url().optional(),
  verified: z.boolean().default(false),
  author: z.string().min(1).max(120).default('Editorial Team'),
  ai_assisted: z.boolean().default(false),
  reviewer: z.string().min(1).max(120).optional(),
  reviewed_at: z.coerce.date().optional(),
  hero_image: z.string().optional(),
});

export const courseSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(80),
  full_name: z.string().min(1).max(200),
  duration_years: z.number().int().positive().max(6),
  semesters: z.number().int().positive().max(12),
  order: z.number().int().default(0),
});

export const branchSchema = z.object({
  slug: slugSchema,
  course: slugSchema,
  name: z.string().min(1).max(80),
  full_name: z.string().min(1).max(200),
  aliases: z.array(z.string().min(1).max(80)).default([]),
  order: z.number().int().default(0),
});

export const schemeSchema = z.object({
  slug: z.string().min(1).max(40),
  label: z.string().min(1).max(120),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
});

export const sourceRecordSchema = z.object({
  id: slugSchema,
  title: z.string().min(3).max(240),
  url: z.url(),
  publisher: z.string().min(1).max(240).optional(),
  accessed_at: z.coerce.date(),
  licence: sourceLicenceSchema,
  allowed_operations: z.array(sourceUseSchema).min(1),
  commercial_use_ok: z.boolean(),
  attribution_required: z.boolean().default(true),
  share_alike: z.boolean().default(false),
  rehost_pdf: z.boolean().default(false),
  risk: riskSchema,
  notes: z.string().max(2000).optional(),
});

export const sourcesFileSchema = z.array(sourceRecordSchema).min(1);

export const factSchema = z.object({
  id: z.string().min(1).max(40),
  unit: z.number().int().positive().max(20).optional(),
  topic: z.string().min(1).max(240),
  claim: z.string().min(1).max(1200),
  page: z.number().int().positive().optional(),
  confidence: z.enum(['high', 'medium', 'low']).default('medium'),
});

export const factSheetSchema = z.object({
  resource_id: z.string().min(1).max(120),
  subject_code: z.string().min(1).max(20).optional(),
  source_url: z.url(),
  accessed_at: z.coerce.date(),
  licence: sourceLicenceSchema,
  facts: z.array(factSchema).min(1),
});

export const provenanceSchema = z.object({
  resource_id: z.string().min(1).max(120),
  file: z.string().min(1).max(240),
  sha256: z.string().regex(/^(sha256:)?[a-f0-9]{64}$/),
  created_at: z.coerce.date(),
  author: z.string().min(1).max(240),
  model: z.string().min(1).max(120).optional(),
  prompt_version: z.string().min(1).max(80).optional(),
  fact_sheet: z.string().min(1).max(240),
  sources: z
    .array(
      z.object({
        url: z.url(),
        licence: sourceLicenceSchema,
        use: sourceUseSchema,
      }),
    )
    .min(1),
  review: z.object({
    reviewer: z.string().min(1).max(120),
    date: z.coerce.date(),
    checklist: z.string().min(1).max(240),
  }),
  similarity: z.object({
    score: z.number().min(0).max(1),
    report: z.string().min(1).max(240),
  }),
  licence: resourceLicenceSchema,
  watermark: z.string().max(120).optional(),
  takedown_contact: z.string().max(240).optional(),
});

export const reviewSchema = z.object({
  resource_id: z.string().min(1).max(120),
  checked_at: z.coerce.date(),
  similarity_score: z.number().min(0).max(1),
  max_ngram_overlap: z.number().min(0).max(1),
  web_matches: z.array(z.string().max(500)).default([]),
  fact_check: z.enum(['pass', 'fail', 'not-run']),
  flags: z.array(z.string().max(500)).default([]),
  verdict: z.enum(['approve', 'revise', 'reject']),
  reviewer: z.string().max(120).optional(),
  notes: z.string().max(2000).optional(),
});

export type Subject = z.infer<typeof subjectSchema>;
export type Resource = z.infer<typeof resourceSchema>;
export type UnitQuestion = z.infer<typeof unitQuestionSchema>;
export type BlogPost = z.infer<typeof blogSchema>;
export type SourceRecord = z.infer<typeof sourceRecordSchema>;
export type FactSheet = z.infer<typeof factSheetSchema>;
export type Provenance = z.infer<typeof provenanceSchema>;
export type Review = z.infer<typeof reviewSchema>;
