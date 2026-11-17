// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import matter from 'gray-matter';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { parse } from 'yaml';

const site = 'https://aktusemwise.com';

/**
 * Exclude pages that render with noindex from the sitemap: empty semester/branch pages,
 * unverified subject hubs, and unverified or empty blog indexes/posts.
 */
function makeSitemapFilter() {
  const subjectsDir = path.join(process.cwd(), 'src', 'content', 'subjects');
  const blogDir = path.join(process.cwd(), 'src', 'content', 'blog');
  const coursesFile = path.join(process.cwd(), 'src', 'data', 'courses.yaml');
  const semesterPaths = new Set();
  const branchPaths = new Set();
  const subjectPaths = new Set();
  const blogPostPaths = new Set();
  const courseSlugs = new Set();
  let hasIndexableBlogPosts = false;

  try {
    const courses = parse(readFileSync(coursesFile, 'utf8'));
    if (Array.isArray(courses)) {
      for (const course of courses) {
        if (course?.slug) courseSlugs.add(course.slug);
      }
    }
  } catch {
    // Fall back to the course slugs found in subject files.
  }

  try {
    for (const file of readdirSync(subjectsDir)) {
      if (!/\.ya?ml$/i.test(file) || file.startsWith('_')) continue;
      const data = parse(readFileSync(path.join(subjectsDir, file), 'utf8'));
      if (!data || data.draft === true) continue;
      const units = Array.isArray(data.syllabus_units) ? data.syllabus_units : [];
      const resources = Array.isArray(data.resources) ? data.resources : [];
      if (units.length === 0 && resources.length === 0) continue;
      if (data.course) courseSlugs.add(data.course);
      for (const branch of Array.isArray(data.branches) ? data.branches : []) {
        branchPaths.add(`/${data.course}/${branch}/`);
        semesterPaths.add(`/${data.course}/${branch}/sem-${data.semester}/`);
      }
      if (data.verified === true && data.code) {
        subjectPaths.add(`/subject/${String(data.code).toLowerCase()}/`);
      }
    }
  } catch {
    // If the content cannot be read, keep the site buildable with the basic filter.
  }

  try {
    for (const file of readdirSync(blogDir)) {
      if (!/\.mdx?$/i.test(file) || file.startsWith('_')) continue;
      const { data } = matter(readFileSync(path.join(blogDir, file), 'utf8'));
      if (data.draft === true || data.verified !== true) continue;
      hasIndexableBlogPosts = true;
      blogPostPaths.add(`/blog/${file.replace(/\.mdx?$/i, '')}/`);
    }
  } catch {
    // If the blog cannot be read, keep the site buildable with the basic filter.
  }

  /**
   * @param {string} page
   * @returns {boolean}
   */
  return (page) => {
    let pathname;
    try {
      pathname = new URL(page).pathname;
    } catch {
      return false;
    }
    if (pathname.includes('/search') || pathname.includes('/404')) return false;
    if (pathname === '/blog/') return hasIndexableBlogPosts;

    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'blog' && segments.length === 2) {
      return blogPostPaths.has(pathname);
    }
    if (segments[0] === 'subject' && segments.length === 2) {
      return subjectPaths.has(pathname);
    }
    if (
      segments.length === 3 &&
      courseSlugs.has(segments[0]) &&
      segments[2].startsWith('sem-')
    ) {
      return semesterPaths.has(pathname);
    }
    if (segments.length === 2 && courseSlugs.has(segments[0])) {
      return branchPaths.has(pathname);
    }
    return true;
  };
}

// https://astro.build/config
export default defineConfig({
  site,
  output: 'static',
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
  integrations: [
    mdx(),
    sitemap({
      filter: makeSitemapFilter(),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
