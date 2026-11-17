import { SITE } from './site';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type JsonLd = Record<string, unknown>;

function absolute(siteUrl: string, path: string) {
  return new URL(path, siteUrl).toString();
}

export function buildBreadcrumbList(items: BreadcrumbItem[], siteUrl: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absolute(siteUrl, item.href) } : {}),
    })),
  };
}

export function buildWebSite(siteUrl: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: siteUrl,
    description: SITE.description,
    inLanguage: SITE.language,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl.replace(/\/$/, '')}/search/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function buildOrganization(siteUrl: string): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: siteUrl,
    email: SITE.email,
    description: SITE.description,
  };
}

export function buildCourse(input: {
  name: string;
  description: string;
  url: string;
  siteUrl: string;
  courseCode?: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: input.name,
    description: input.description,
    url: absolute(input.siteUrl, input.url),
    ...(input.courseCode ? { courseCode: input.courseCode } : {}),
    provider: {
      '@type': 'Organization',
      name: SITE.name,
      url: input.siteUrl,
    },
    inLanguage: SITE.language,
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: 0,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
  };
}

export function buildLearningResource(input: {
  name: string;
  description: string;
  url: string;
  siteUrl: string;
  subjectCode: string;
  resources?: Array<{ title: string; type: string }>;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: input.name,
    description: input.description,
    url: absolute(input.siteUrl, input.url),
    learningResourceType: 'Study guide',
    educationalLevel: 'Undergraduate',
    inLanguage: SITE.language,
    isAccessibleForFree: true,
    about: {
      '@type': 'Thing',
      name: input.name,
    },
    provider: {
      '@type': 'Organization',
      name: SITE.name,
      url: input.siteUrl,
    },
    ...(input.resources?.length
      ? {
          hasPart: input.resources.map((resource) => ({
            '@type': 'CreativeWork',
            name: resource.title,
            learningResourceType: resource.type,
            isAccessibleForFree: true,
          })),
        }
      : {}),
  };
}

export function buildFaqPage(
  faqs: Array<{ question: string; answer: string }>,
): JsonLd | undefined {
  if (faqs.length === 0) return undefined;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function buildBlogPosting(input: {
  title: string;
  description: string;
  url: string;
  siteUrl: string;
  published: Date;
  updated?: Date;
  author: string;
  image?: string;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.title,
    description: input.description,
    url: absolute(input.siteUrl, input.url),
    mainEntityOfPage: absolute(input.siteUrl, input.url),
    datePublished: input.published.toISOString(),
    dateModified: (input.updated ?? input.published).toISOString(),
    author: {
      '@type': 'Person',
      name: input.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: input.siteUrl,
    },
    inLanguage: SITE.language,
    isAccessibleForFree: true,
    ...(input.image ? { image: absolute(input.siteUrl, input.image) } : {}),
  };
}

export function combineJsonLd(items: Array<JsonLd | undefined>): JsonLd[] {
  return items.filter((item): item is JsonLd => Boolean(item));
}
