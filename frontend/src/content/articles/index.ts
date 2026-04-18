/**
 * Article runtime registry.
 *
 * Metadata lives in registry.ts (pure data, no React — also read at build
 * time by the Vite sitemap plugin). This file only adds the lazy() React
 * component imports.
 *
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║  TO ADD AN ARTICLE:                                             ║
 * ║  1. Create src/content/articles/YYYY-slug.tsx                   ║
 * ║  2. Add its metadata import + slug to registry.ts               ║
 * ║  3. Add one lazy() import line to COMPONENTS below.             ║
 * ║  4. Done. Sitemap, robots, SEO all auto-generated.              ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { ArticleMetadata, Category } from './types';
import { ARTICLE_METADATA } from './registry';

// --- Lazy body imports (code-split per article) ----------------------------
// Key = slug, value = lazy React component.
const COMPONENTS: Record<string, LazyExoticComponent<ComponentType>> = {
  'monk-who-sold-his-ferrari': lazy(() => import('./2022-monk-who-sold-his-ferrari')),
  'hundred-km-club':           lazy(() => import('./2023-hundred-km-club')),
};

// --- Derived exports --------------------------------------------------------

interface ArticleEntry {
  metadata: ArticleMetadata;
  Component: LazyExoticComponent<ComponentType>;
}

const REGISTRY: ArticleEntry[] = ARTICLE_METADATA
  .filter((m) => m.slug in COMPONENTS)
  .map((m) => ({ metadata: m, Component: COMPONENTS[m.slug] }));

/** By-slug lookup used by /log/:slug route. */
export const articles: Record<string, ArticleEntry> = Object.fromEntries(
  REGISTRY.map((e) => [e.metadata.slug, e])
);

/** Chronologically sorted, newest first. */
export const articlesSorted = [...REGISTRY].sort((a, b) => {
  return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime();
});

/** All categories present across published articles (in display order). */
export const CATEGORY_ORDER: Category[] = [
  'Accomplishment',
  'Book Review',
  'Cycling',
  'Tech',
  'Psychology',
  'Spiritual',
  'Gaming',
  'Journal',
];

export const categories: Category[] = CATEGORY_ORDER.filter((c) =>
  REGISTRY.some((e) => e.metadata.category === c)
);
