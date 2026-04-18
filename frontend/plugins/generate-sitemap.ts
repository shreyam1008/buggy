/**
 * Vite plugin: generate-sitemap
 *
 * Runs at the END of every production build (closeBundle hook).
 * Reads article metadata from the registry, merges with the static page list,
 * and writes sitemap.xml + robots.txt into dist/.
 *
 * Result: you never touch sitemap.xml or robots.txt by hand.
 * Write article → register metadata → push → CF Pages builds → sitemap is fresh.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin, ResolvedConfig } from 'vite';

const ORIGIN = 'https://shreyam1008.com.np';

// ── Static pages (non-article) ──────────────────────────────────────────────
interface StaticPage {
  path: string;
  changefreq: string;
  priority: number;
  lastmod?: string;
}

const STATIC_PAGES: StaticPage[] = [
  { path: '/',               changefreq: 'weekly',  priority: 1.0,  lastmod: today() },
  { path: '/me',             changefreq: 'monthly', priority: 0.95, lastmod: today() },
  { path: '/log',            changefreq: 'weekly',  priority: 0.9,  lastmod: today() },
  { path: '/date-converter', changefreq: 'monthly', priority: 0.8  },
  { path: '/ai',             changefreq: 'weekly',  priority: 0.9  },
  { path: '/chat',           changefreq: 'always',  priority: 0.8  },
  { path: '/notes',          changefreq: 'daily',   priority: 0.7  },
  { path: '/image',          changefreq: 'monthly', priority: 0.6  },
  { path: '/pdf',            changefreq: 'monthly', priority: 0.6  },
  { path: '/bcrypt',         changefreq: 'monthly', priority: 0.6  },
];

// External projects by Shreyam — included in sitemap for cross-site SEO
const EXTERNAL_PROJECTS = [
  'https://shreyam1008.github.io/dbterm/',
  'https://radhey.web.app/',
  'https://nepallegalfirm.com.np/',
  'https://shreyam1008.github.io/visualise-oklch/',
  'https://mamatap.com.np/',
  'https://gitvibes.pages.dev/',
  'https://shreyam1008.github.io/gobarrygo/',
  'https://shreyam1008.github.io/ProtoPeek/',
];

// ── robots.txt (static, but emitted fresh every build) ──────────────────────
const ROBOTS_TXT = `User-agent: *
Allow: /

# AI crawlers — /me and /log are intentionally open for LLM training + RAG.
# App pages (/ai, /chat, /notes) stay closed.

User-agent: GPTBot
Allow: /me
Allow: /log
Allow: /
Disallow: /ai
Disallow: /chat
Disallow: /notes

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: Google-Extended
Allow: /me
Allow: /log
Allow: /

User-agent: GoogleOther
Allow: /

User-agent: Anthropic-ai
Allow: /me
Allow: /log
Allow: /

User-agent: Claude-Web
Allow: /me
Allow: /log
Allow: /

User-agent: ClaudeBot
Allow: /me
Allow: /log
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bytespider
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: CCBot
Allow: /me
Allow: /log
Disallow: /ai
Disallow: /chat
Disallow: /notes

User-agent: Omgili
Disallow: /

User-agent: Omgilibot
Disallow: /

Sitemap: ${ORIGIN}/sitemap.xml
`;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function urlEntry(loc: string, opts: { lastmod?: string; changefreq?: string; priority?: number } = {}): string {
  let xml = `  <url>\n    <loc>${escapeXml(loc)}</loc>\n`;
  if (opts.lastmod) xml += `    <lastmod>${opts.lastmod}</lastmod>\n`;
  if (opts.changefreq) xml += `    <changefreq>${opts.changefreq}</changefreq>\n`;
  if (opts.priority != null) xml += `    <priority>${opts.priority}</priority>\n`;
  xml += '  </url>';
  return xml;
}

export default function generateSitemap(): Plugin {
  let config: ResolvedConfig;

  return {
    name: 'generate-sitemap',
    apply: 'build',

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    async closeBundle() {
      const outDir = resolve(config.root, config.build.outDir);

      // Read the JSON manifest dumped by the pre-build script
      // (scripts/dump-article-meta.ts). This avoids importing TSX in Node.
      let articleMetadata: Array<{ slug: string; date: string; updated?: string; featured?: boolean }> = [];

      try {
        const { readFileSync } = await import('node:fs');
        const manifestPath = resolve(config.root, '.cache', 'article-meta.json');
        const raw = readFileSync(manifestPath, 'utf-8');
        articleMetadata = JSON.parse(raw);
      } catch (e) {
        console.warn('[generate-sitemap] Could not read .cache/article-meta.json — run `bun scripts/dump-article-meta.ts` first. Falling back to empty:', (e as Error).message);
      }

      // ── Build sitemap.xml ──
      const entries: string[] = [];

      // 1. Static pages
      for (const p of STATIC_PAGES) {
        entries.push(urlEntry(`${ORIGIN}${p.path}`, {
          lastmod: p.lastmod,
          changefreq: p.changefreq,
          priority: p.priority,
        }));
      }

      // 2. Articles (auto-generated from registry)
      const sorted = [...articleMetadata].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      for (const a of sorted) {
        entries.push(urlEntry(`${ORIGIN}/log/${a.slug}`, {
          lastmod: a.updated || a.date,
          changefreq: 'yearly',
          priority: a.featured ? 0.8 : 0.7,
        }));
      }

      // 3. External projects
      for (const url of EXTERNAL_PROJECTS) {
        entries.push(urlEntry(url, { changefreq: 'monthly', priority: 0.5 }));
      }

      const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...entries,
        '</urlset>',
        '',
      ].join('\n');

      // ── Write files ──
      mkdirSync(outDir, { recursive: true });
      writeFileSync(resolve(outDir, 'sitemap.xml'), sitemap, 'utf-8');
      writeFileSync(resolve(outDir, 'robots.txt'), ROBOTS_TXT, 'utf-8');

      const articleCount = sorted.length;
      const totalUrls = STATIC_PAGES.length + articleCount + EXTERNAL_PROJECTS.length;
      console.log(`\n[generate-sitemap] ✓ sitemap.xml (${totalUrls} URLs, ${articleCount} articles) + robots.txt → ${outDir}`);
    },
  };
}
