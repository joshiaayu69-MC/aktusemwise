export const SITE = {
  name: 'AKTU SemWise',
  url: 'https://aktusemwise.com',
  filesUrl: 'https://files.aktusemwise.com',
  title: 'AKTU SemWise — AKTU Study Resources',
  description:
    'Free, original, exam-focused study resources for AKTU students: syllabus, notes, model papers, question banks, updates, and tools. No login, no paywall.',
  email: 'hello@aktusemwise.com',
  grievanceEmail: 'grievance@aktusemwise.com',
  locale: 'en_IN',
  language: 'en',
  nav: [
    { href: '/btech/', label: 'B.Tech' },
    { href: '/pyq/', label: 'PYQ Papers' },
    { href: '/syllabus/', label: 'Syllabus' },
    { href: '/updates/', label: 'Updates' },
    { href: '/tools/', label: 'Tools' },
    { href: '/search/', label: 'Search' },
  ],
} as const;

export const NON_AFFILIATION = `${SITE.name} is an independent student resource. It is not affiliated with, endorsed by, or connected to Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow. AKTU names and marks belong to their respective owners. Syllabus and question papers are referenced for educational purposes only.`;

export const LEGAL_LINKS = [
  { href: '/about/', label: 'About' },
  { href: '/contact/', label: 'Contact' },
  { href: '/privacy/', label: 'Privacy' },
  { href: '/terms/', label: 'Terms' },
  { href: '/disclaimer/', label: 'Disclaimer' },
  { href: '/takedown/', label: 'Copyright & Takedown' },
  { href: '/editorial-policy/', label: 'Editorial Policy' },
] as const;

export const CONTENT_TODO = {
  brand: 'Brand name: AKTU SemWise (aktusemwise.com).',
  reviewer: 'Every published resource needs a named human reviewer before it goes live.',
  contact: 'For inquiries and feedback, contact hello@aktusemwise.com.',
} as const;
