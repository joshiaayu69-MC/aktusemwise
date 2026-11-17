import { getCollection, type CollectionEntry } from 'astro:content';

export type SubjectEntry = CollectionEntry<'subjects'>;
export type BlogEntry = CollectionEntry<'blog'>;

export function hasUsefulContent(subject: SubjectEntry['data']) {
  return subject.syllabus_units.length > 0 || subject.resources.length > 0;
}

export function isVisible(data: { draft: boolean }) {
  return import.meta.env.DEV || !data.draft;
}

export async function getPublishedSubjects(): Promise<SubjectEntry[]> {
  const subjects = await getCollection('subjects');
  return subjects
    .filter(({ data }) => isVisible(data) && hasUsefulContent(data))
    .sort((a, b) => {
      if (a.data.semester !== b.data.semester) {
        return a.data.semester - b.data.semester;
      }
      return a.data.code.localeCompare(b.data.code);
    });
}

export async function getSubjectsFor(
  course: string,
  branch: string,
  semester: number,
): Promise<SubjectEntry[]> {
  const subjects = await getPublishedSubjects();
  return subjects.filter(
    (subject) =>
      subject.data.course === course &&
      subject.data.branches.includes(branch) &&
      subject.data.semester === semester,
  );
}

export async function getSubjectsForCourse(course: string): Promise<SubjectEntry[]> {
  const subjects = await getPublishedSubjects();
  return subjects.filter((subject) => subject.data.course === course);
}

export async function getSubjectByCode(code: string) {
  const subjects = await getPublishedSubjects();
  const normalized = code.toUpperCase();
  return subjects.find((subject) => subject.data.code === normalized);
}

export async function getPublishedBlogPosts(): Promise<BlogEntry[]> {
  const posts = await getCollection('blog');
  return posts
    .filter(({ data }) => isVisible(data))
    .sort((a, b) => b.data.published.getTime() - a.data.published.getTime());
}

export function countResources(subject: SubjectEntry['data']) {
  return subject.resources.length;
}

export function getResourceTypes(subject: SubjectEntry['data']) {
  return [...new Set(subject.resources.map((resource) => resource.type))];
}
