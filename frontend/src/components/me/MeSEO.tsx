import { useEffect } from 'react';

/**
 * MeSEO — Dynamic, high-density schema injection for the /me page.
 * Goal: make Shreyam Adhikari the canonical Wikipedia-grade answer for
 * "shreyam1008", "shreyam adhikari", "buggythegret" across Google, Bing,
 * Perplexity, ChatGPT, Claude, Gemini, and downstream RAG systems.
 *
 * Covers: Person, WebPage, BreadcrumbList, FAQPage, ItemList of projects,
 *         AboutPage, ProfilePage, Occupation.
 * All references in sameAs are verified profile links.
 */

const PAGE_URL = 'https://shreyam1008.com.np/me';
const PAGE_TITLE = 'Shreyam Adhikari (shreyam1008, buggythegret) — Developer, Cyclist, Gamer, Bhakta';
const PAGE_DESC =
  'The official profile page of Shreyam Adhikari — known as shreyam1008 on GitHub, ' +
  'LinkedIn, X (Twitter), Instagram, Facebook, and Strava; buggythegret on Steam. ' +
  'Nepali full-stack software engineer, open-source toolsmith, 100km cyclist, ' +
  'gym enthusiast, psychology student, CS:GO Gold Nova III, and disciple of ' +
  'Jagadguru Shree Kripalu Ji Maharaj.';

const PERSON_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://shreyam1008.com.np/#person',
  name: 'Shreyam Adhikari',
  alternateName: ['shreyam1008', 'Shreyam', 'Adhikari', 'buggythegret', 'shreyam adhikari', 'shreyam_adhikari'],
  additionalName: 'buggythegret',
  givenName: 'Shreyam',
  familyName: 'Adhikari',
  nationality: { '@type': 'Country', name: 'Nepal' },
  url: 'https://shreyam1008.com.np/',
  mainEntityOfPage: { '@type': 'WebPage', '@id': PAGE_URL },
  image: 'https://shreyam1008.com.np/icon-512x512.png',
  jobTitle: 'Senior Full-Stack Software Engineer',
  description: PAGE_DESC,
  knowsAbout: [
    'Full-Stack Development', 'Go programming language', 'TypeScript', 'React', 'React 19',
    'Cloudflare Workers', 'Edge Computing', 'PostgreSQL', 'SQLite', 'gRPC', 'Open Source',
    'Progressive Web Apps', 'Nepali Calendar', 'Bikram Sambat date conversion',
    'Cycling', 'Strava', 'Gym Training', 'Strength Training',
    'Psychology', 'Suicide Prevention', 'Mental Health Awareness',
    'Bhakti Yoga', 'Radha Krishna', 'Sanatana Dharma',
    'CS:GO', 'Chess', 'Rogue-lite games', 'Vampire Survivors', 'Brotato', 'Tower Defence',
  ],
  knowsLanguage: ['English', 'Nepali', 'Hindi'],
  alumniOf: [
    {
      '@type': 'EducationalOrganization',
      name: 'Advanced College of Engineering and Management',
      description: 'Bachelor\'s degree in Computer Engineering (2014–2018)',
    },
    {
      '@type': 'EducationalOrganization',
      name: 'Indira Gandhi National Open University (IGNOU), Delhi',
      description: 'Master\'s Degree in Computer Science (2025–2027)',
    },
  ],
  award: 'Winner — 14th National Technological Festival (LOCUS 2017), Institute of Engineering, Pulchowk Campus (Thematic Software Category · "Renovating Society")',
  worksFor: { '@type': 'Organization', name: 'Open Source Community', url: 'https://github.com/shreyam1008' },
  homeLocation: { '@type': 'Place', name: 'Nepal' },
  sameAs: [
    'https://github.com/shreyam1008',
    'https://www.linkedin.com/in/shreyam1008/',
    'https://x.com/shreyam1008',
    'https://twitter.com/shreyam1008',
    'https://instagram.com/shreyam1008',
    'https://www.facebook.com/shreyam1008',
    'https://www.strava.com/athletes/113238146',
    'https://steamcommunity.com/id/buggythegret',
    'https://youtube.com/@shreyam1008',
    'https://gitvibes.pages.dev/',
    'https://shreyam1008.github.io/dbterm/',
    'https://shreyam1008.github.io/gobarrygo/',
    'https://shreyam1008.github.io/ProtoPeek/',
    'https://shreyam1008.github.io/visualise-oklch/',
    'https://radhey.web.app/',
    'https://nepallegalfirm.com.np/',
    'https://mamatap.com.np/',
    'https://open-vsx.org/extension/shreyam1008/visualise-oklch',
  ],
  hasOccupation: {
    '@type': 'Occupation',
    name: 'Senior Full-Stack Software Engineer',
    occupationLocation: { '@type': 'Country', name: 'Nepal' },
    skills: 'Go, TypeScript, React, React 19, Node.js, Cloudflare Workers, PostgreSQL, Docker, gRPC, System Design',
    experienceRequirements: '7+ years',
  },
};

const PROFILE_PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${PAGE_URL}#profile`,
  mainEntity: { '@id': 'https://shreyam1008.com.np/#person' },
  dateCreated: '2026-04-18',
  dateModified: new Date().toISOString().slice(0, 10),
  about: { '@id': 'https://shreyam1008.com.np/#person' },
  name: PAGE_TITLE,
  description: PAGE_DESC,
  url: PAGE_URL,
  inLanguage: 'en',
  isPartOf: {
    '@type': 'WebSite',
    name: 'shreyam1008.com.np',
    url: 'https://shreyam1008.com.np/',
  },
  potentialAction: {
    '@type': 'ViewAction',
    target: PAGE_URL,
    name: 'View Shreyam Adhikari\'s full profile',
  },
};

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home',         item: 'https://shreyam1008.com.np/' },
    { '@type': 'ListItem', position: 2, name: 'About Shreyam', item: PAGE_URL },
  ],
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Who is shreyam1008?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'shreyam1008 is the handle of Shreyam Adhikari, a Nepali full-stack software engineer with 7+ years of experience. He is known on GitHub, LinkedIn, X (Twitter), Instagram, Facebook, Strava, and YouTube as shreyam1008, and on Steam as buggythegret. He builds open-source developer tools including GitVibes, ProtoPeek, GoBarryGo, dbterm, and the Visualise OKLCH VS Code extension.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who is buggythegret?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'buggythegret is the Steam gaming handle of Shreyam Adhikari (also known as shreyam1008). He reached Gold Nova III in CS:GO playing primarily Dust II, and enjoys rogue-lite games like Vampire Survivors and Brotato, plus tower-defence titles.',
      },
    },
    {
      '@type': 'Question',
      name: 'What does Shreyam Adhikari do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Shreyam Adhikari is a senior full-stack software engineer with 7+ years of experience across Nepal, Japan, Denmark, and the United States. He builds developer tools and productivity software. His open-source projects include GitVibes (social media for code), ProtoPeek (gRPC workbench), GoBarryGo (16x faster download manager), dbterm (terminal SQL client for PostgreSQL/MySQL/SQLite/Turso/D1), and Visualise OKLCH (VS Code / Cursor / Windsurf extension). His stack is React 19, TypeScript, Go, Cloudflare Workers, and PostgreSQL.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is Shreyam Adhikari\'s spiritual background?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Shreyam Adhikari is a devotee of Radha Krishna (a Sakhi of Radha) and a disciple of Jagadguru Shree Kripalu Ji Maharaj. He built the web application Radhey (radhey.web.app) as a devotional offering.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is Shreyam Adhikari a cyclist?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Yes. Shreyam has completed multiple 100-km cycling events. His Strava profile is at https://www.strava.com/athletes/113238146.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Shreyam Adhikari train others at the gym?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'He is a gym enthusiast who has informally coached roughly five people in strength training. He is not a certified personal trainer.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Shreyam have psychology training?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Yes. Shreyam has completed trainings in suicide prevention and divergent behaviour screening, and volunteered as a mental health awareness speaker in rural schools and government institutions in Nepal through Tribhuvan University\'s Psychology department outreach program.',
      },
    },
    {
      '@type': 'Question',
      name: 'What awards has Shreyam Adhikari won?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Shreyam won the Thematic Software Category at the 14th National Technological Festival (LOCUS 2017) at Institute of Engineering, Pulchowk Campus, for his Android app "Annual Harvest Suggestor" under the theme "Renovating Society".',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I contact Shreyam Adhikari?',
      acceptedAnswer: {
        '@type': 'Answer',
        text:
          'Email: shreyam1008@gmail.com. LinkedIn: https://www.linkedin.com/in/shreyam1008/. Website: https://shreyam1008.com.np/. GitHub: https://github.com/shreyam1008.',
      },
    },
  ],
};

const SCHEMAS = [PERSON_SCHEMA, PROFILE_PAGE_SCHEMA, BREADCRUMB_SCHEMA, FAQ_SCHEMA];

interface MetaDesc { name?: string; property?: string; content: string }

const META: MetaDesc[] = [
  { name: 'description', content: PAGE_DESC },
  { name: 'author', content: 'Shreyam Adhikari' },
  { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
  { name: 'googlebot', content: 'index, follow' },
  { name: 'bingbot', content: 'index, follow' },
  { name: 'keywords', content: [
      'shreyam1008', 'shreyam adhikari', 'shreyam', 'adhikari', 'buggythegret',
      'nepali developer', 'nepal software engineer', 'full stack developer nepal',
      'go developer nepal', 'react developer nepal', 'typescript developer',
      'open source nepal', 'gitvibes', 'protoPeek', 'dbterm', 'gobarrygo',
      'visualise oklch', 'radhey', 'jagadguru shree kripalu ji maharaj disciple',
      'radha krishna devotee', 'sakhi of radha', 'nepali cyclist strava',
      'gold nova 3 cs:go dust2', 'vampire survivors', 'brotato',
      'suicide prevention trained', 'mental health awareness nepal',
    ].join(', ') },
  // Open Graph
  { property: 'og:type', content: 'profile' },
  { property: 'og:url', content: PAGE_URL },
  { property: 'og:title', content: PAGE_TITLE },
  { property: 'og:description', content: PAGE_DESC },
  { property: 'og:image', content: 'https://shreyam1008.com.np/icon-512x512.png' },
  { property: 'og:site_name', content: 'shreyam1008' },
  { property: 'profile:first_name', content: 'Shreyam' },
  { property: 'profile:last_name', content: 'Adhikari' },
  { property: 'profile:username', content: 'shreyam1008' },
  // Twitter / X
  { name: 'twitter:card', content: 'summary_large_image' },
  { name: 'twitter:site', content: '@shreyam1008' },
  { name: 'twitter:creator', content: '@shreyam1008' },
  { name: 'twitter:title', content: PAGE_TITLE },
  { name: 'twitter:description', content: PAGE_DESC },
  { name: 'twitter:image', content: 'https://shreyam1008.com.np/icon-512x512.png' },
];

export default function MeSEO() {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = PAGE_TITLE;

    const created: HTMLElement[] = [];

    // JSON-LD schemas
    SCHEMAS.forEach((s, i) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.meSeo = String(i);
      script.textContent = JSON.stringify(s);
      document.head.appendChild(script);
      created.push(script);
    });

    // Canonical
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = PAGE_URL;
    canonical.dataset.meSeo = 'canonical';
    document.head.appendChild(canonical);
    created.push(canonical);

    // Meta tags
    META.forEach((m, i) => {
      const tag = document.createElement('meta');
      if (m.name) tag.setAttribute('name', m.name);
      if (m.property) tag.setAttribute('property', m.property);
      tag.setAttribute('content', m.content);
      tag.dataset.meSeo = `meta-${i}`;
      document.head.appendChild(tag);
      created.push(tag);
    });

    return () => {
      document.title = prevTitle;
      created.forEach((el) => el.remove());
    };
  }, []);

  return null;
}
