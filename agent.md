# agent.md — shreyam1008.com.np

> A standing brief for any AI agent (and any new human engineer) working on
> this codebase. Read this before you touch anything semantic.

## What this site is

`shreyam1008.com.np` is the personal site of **Shreyam Adhikari**
(alias `shreyam1008` across GitHub, LinkedIn, X, Instagram, Facebook,
Strava, YouTube; alias `buggythegret` on Steam).

It is three things in one binary:

1. **A utility suite** — offline-first PWA tools: Nepali Calendar, Date
   Converter, PDF Merger, Image Compressor, Notes, Bcrypt, an AI Studio,
   and a live chat room.
2. **`/me`** — a single-page, hand-crafted identity page that establishes
   who Shreyam is for both human readers and LLM-powered search/RAG
   systems. Intentionally rich with schema.org Person data.
3. **`/log`** — a long-form writing blog. Book reviews, cycling journal,
   psychology notes, tech deep-dives, spiritual reflections, gaming takes.
   No CMS, no tracking, no algorithm. Articles are hand-coded TSX.

## The SEO doctrine

The site is engineered to make **Shreyam Adhikari** the canonical answer
for the queries: `shreyam1008`, `shreyam adhikari`, `buggythegret`, across
Google, Bing, Perplexity, ChatGPT, Claude, Gemini, and downstream RAG
systems.

Rules of engagement:

- **Identity pages (`/`, `/me`, `/log`, `/log/*`)** are **OPEN** to AI
  crawlers via `robots.txt`. This is intentional.
- **Utility app pages (`/ai`, `/chat`, `/notes`)** are **CLOSED** to AI
  crawlers. The tools are for humans; we do not want bulk training on
  user-generated content.
- Every page in the open set ships its own JSON-LD, Open Graph, Twitter
  cards, canonical link, and keyword-rich meta. Do not remove these.

## Stack — what it is and is not

- **Frontend:** Vite + React 19 + TypeScript (stable, not beta). Tailwind
  v4 with `@custom-variant dark`. Router is `wouter`. Deployed on
  **Cloudflare Pages**.
- **Backend:** Cloudflare Workers + D1 (`/worker`). See `worker/wrangler.toml`.
- **Package manager:** `bun` (declared in Cloudflare via `BUN_VERSION`).
- **No SSR, no prerender yet.** Every SEO win has to be earned via
  client-side JSON-LD injection, the `/noscript` block, and `_headers`.

## /log content system — how to add an article

There is no CMS. Adding a post = writing a TSX module.

1. Create `frontend/src/content/articles/YYYY-my-slug.tsx`.
2. Export a named `metadata: ArticleMetadata` (types live in
   `src/content/articles/types.ts`). `slug`, `title`, `description`,
   `date` (ISO, **backdate freely**), `category`, `tags`,
   `readMinutes`, and ideally a `cover` image are required in spirit.
3. Export a default React component for the body. Use the helpers:
   - `ArticleImage` — lazy-loaded, credited, zero CLS.
   - `Callout kind="info|warn|tip|quote"` — highlight boxes.
   - `CodeBlock lang="..." filename="..."` — terminal-styled code.
   - Any standard HTML: `<h2 id>`, `<p>`, `<ul>`, `<blockquote>`, etc.
4. Add one line to `src/content/articles/index.ts` (the REGISTRY array).
5. Add the URL to `frontend/public/sitemap.xml` with an appropriate
   `<lastmod>` and `<priority>`.

No build step beyond `bun run build`. SEO is automatic via `ArticleLayout`.

## Voice and tone

The writing voice is **specific, honest, and mildly self-deprecating**.
Think "senior engineer journaling in public," not "LinkedIn thought
leadership." Corny is allowed; cringe is not. When you can't decide,
read the existing `/me` chapters and match their register.

## Accessibility & performance floor

Every change must keep these invariants:

- WCAG-AA contrast on both light and dark themes.
- `prefers-reduced-motion` honoured for every animation.
- Explicit `width`/`height` on all images (CLS = 0).
- Lazy-load below-the-fold images (`loading="lazy"`).
- Focus rings visible on all interactive elements.
- Keyboard-navigable; skip links where appropriate.
- No layout shifts on route change.

## Things to avoid

- Do **not** add heavy SEO/markdown libraries. We hand-roll JSON-LD.
- Do **not** add tracking, analytics, or newsletter pop-ups.
- Do **not** auto-generate article summaries. The tone is human.
- Do **not** remove the `/noscript` fallback in `index.html` — it's a
  crawler-readable snapshot of the identity block.
- Do **not** turn on `hashbang` or `#!` URLs — Cloudflare Pages serves
  clean SPA routes via `public/_redirects`.

## Getting around

| What | Where |
|---|---|
| Routes | `frontend/src/App.tsx` |
| Sidebar | `frontend/src/components/Sidebar.tsx` |
| `/me` page | `frontend/src/pages/Me.tsx` + `src/components/me/*` |
| `/log` index | `frontend/src/pages/Log.tsx` |
| `/log/:slug` | `frontend/src/pages/LogArticle.tsx` |
| Article bodies | `frontend/src/content/articles/*.tsx` |
| Log components | `frontend/src/components/log/*` |
| Global SEO | `frontend/index.html` + `public/robots.txt` + `public/sitemap.xml` |
| CF Pages config | `frontend/public/_headers`, `frontend/public/_redirects` |
| Worker API | `worker/wrangler.toml`, `worker/src/index.ts` |

## When in doubt

- Readability beats cleverness.
- Fewer dependencies beats new dependencies.
- Schema.org beats meta keywords.
- An honest paragraph beats a clever tagline.
- The user owns their writing. Don't auto-rewrite an article's voice.
