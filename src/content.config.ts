import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { blogSchema, subjectSchema } from './lib/schemas';

const subjects = defineCollection({
  loader: glob({
    pattern: ['**/*.{yaml,yml}', '!**/_*.{yaml,yml}'],
    base: './src/content/subjects',
  }),
  schema: subjectSchema,
});

const blog = defineCollection({
  loader: glob({
    pattern: ['**/*.{md,mdx}', '!**/_*.{md,mdx}'],
    base: './src/content/blog',
  }),
  schema: blogSchema,
});

export const collections = { subjects, blog };
