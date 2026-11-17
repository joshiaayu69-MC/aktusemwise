export function courseUrl(courseSlug: string) {
  return `/${courseSlug}/`;
}

export function branchUrl(courseSlug: string, branchSlug: string) {
  return `/${courseSlug}/${branchSlug}/`;
}

export function semesterUrl(courseSlug: string, branchSlug: string, semester: number) {
  return `/${courseSlug}/${branchSlug}/sem-${semester}/`;
}

export function subjectUrl(code: string) {
  return `/subject/${code.toLowerCase()}/`;
}

export function blogUrl(slug: string) {
  return `/blog/${slug}/`;
}

export function toolUrl(slug: string) {
  return `/tools/${slug}/`;
}
