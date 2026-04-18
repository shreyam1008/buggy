/**
 * registry.ts — The SINGLE source of truth for all article metadata.
 *
 * NO React imports. NO lazy(). Pure data.
 * Both the runtime (index.ts) and the build-time Vite plugin read from here.
 *
 * ╔═══════════════════════════════════════════════════════════════════╗
 * ║  TO ADD AN ARTICLE:                                             ║
 * ║  1. Create src/content/articles/YYYY-slug.tsx                   ║
 * ║  2. Import its metadata here + add to ARTICLE_METADATA array.   ║
 * ║  3. Add one line to index.ts (the lazy Component import).       ║
 * ║  4. Done. sitemap.xml is auto-generated at build time.          ║
 * ╚═══════════════════════════════════════════════════════════════════╝
 */
import type { ArticleMetadata } from './types';

import { metadata as m_bookMonk }  from './2022-monk-who-sold-his-ferrari';
import { metadata as m_hundredKm } from './2023-hundred-km-club';

/**
 * All articles, in any order. Sorting happens downstream.
 * Each entry must have a matching lazy Component import in index.ts.
 */
export const ARTICLE_METADATA: ArticleMetadata[] = [
  m_bookMonk,
  m_hundredKm,
];

/**
 * The module path (relative to this file) for each slug.
 * Used by index.ts to build the lazy import map.
 */
export const ARTICLE_MODULES: Record<string, string> = {
  'monk-who-sold-his-ferrari': './2022-monk-who-sold-his-ferrari',
  'hundred-km-club':           './2023-hundred-km-club',
};
