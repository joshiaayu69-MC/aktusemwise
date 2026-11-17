import { parse } from 'yaml';
import { z } from 'zod';
import branchesYaml from '../data/branches.yaml?raw';
import coursesYaml from '../data/courses.yaml?raw';
import schemesYaml from '../data/schemes.yaml?raw';
import { branchSchema, courseSchema, schemeSchema } from './schemas';

function loadList<T>(raw: string, schema: z.ZodType<T>): T[] {
  return z.array(schema).parse(parse(raw));
}

export const courses = loadList(coursesYaml, courseSchema).sort(
  (a, b) => a.order - b.order,
);

export const branches = loadList(branchesYaml, branchSchema).sort(
  (a, b) => a.order - b.order,
);

export const schemes = loadList(schemesYaml, schemeSchema).sort(
  (a, b) => a.order - b.order,
);

export function getCourse(slug: string) {
  return courses.find((course) => course.slug === slug);
}

export function getBranchesForCourse(courseSlug: string) {
  return branches.filter((branch) => branch.course === courseSlug);
}

export function getBranch(courseSlug: string, branchSlug: string) {
  return branches.find(
    (branch) => branch.course === courseSlug && branch.slug === branchSlug,
  );
}

export function getScheme(slug: string) {
  return schemes.find((scheme) => scheme.slug === slug);
}

export function getActiveSchemes() {
  return schemes.filter((scheme) => scheme.active);
}

export function getSemesterNumbers(courseSlug: string) {
  const course = getCourse(courseSlug);
  return course ? Array.from({ length: course.semesters }, (_, i) => i + 1) : [];
}
