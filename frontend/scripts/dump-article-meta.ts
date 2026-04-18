/**
 * dump-article-meta.ts
 *
 * Pre-build script. Run with `bun run scripts/dump-article-meta.ts`.
 * Reads the article registry (which imports .tsx files — Bun handles this
 * natively) and writes a pure JSON manifest that the Vite plugin can read
 * without needing TSX support.
 *
 * Output: dist/.article-meta.json
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ARTICLE_METADATA } from '../src/content/articles/registry';

const rootDir = resolve(import.meta.dirname!, '..');
const cacheDir = resolve(rootDir, '.cache');
mkdirSync(cacheDir, { recursive: true });

// Strip to only the fields the sitemap plugin needs
const manifest = ARTICLE_METADATA.map((m) => ({
  slug: m.slug,
  title: m.title,
  date: m.date,
  updated: m.updated,
  featured: m.featured ?? false,
  category: m.category,
  description: m.description,
  tags: m.tags,
  readMinutes: m.readMinutes,
  coverSrc: m.cover?.src,
}));

const outPath = resolve(cacheDir, 'article-meta.json');
writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`[dump-article-meta] ✓ ${manifest.length} articles → .cache/article-meta.json`);
