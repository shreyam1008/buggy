# ⚡ Buggy — Offline Utility PWA

A blazing-fast, offline-first utility PWA built with the **latest bleeding-edge stack**:

| Tech | Version |
|------|---------|
| **Vite** | 8.0.0-beta.15 (Rolldown) |
| **TypeScript** | 6.0.0-beta |
| **React** | 19.1.1 |
| **Tailwind CSS** | 4.2.1 |
| **Linter** | oxlint (via npx) |

## 🛠️ Features

| Route | Tool | Description |
|-------|------|-------------|
| `/` | **Date Converter** | Nepali (BS) ↔ English (AD) with auto-format, debounced conversion, month reference |
| `/calendar` | **Nepali Calendar** | Monthly grid with BS/AD overlay, today highlight, Saturday markers |
| `/image` | **Image Compressor** | Drop, paste, or camera capture · JPEG/PNG/WebP · Quality slider · Stats |
| `/pdf` | **PDF Merger** | Merge PDFs + images into one document · Drag-drop · Reorder |
| `/notes` | **Notes** | IndexedDB local storage · Cloud sync via Cloudflare D1 · Tags · Search |
| `/bcrypt` | **Bcrypt Generator** | Generate + verify bcrypt hashes · Configurable rounds |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev       # → http://localhost:5173

# Production build
npm run build     # TypeScript check + Vite build

# Preview production build
npm run preview

# Lint with oxlint
npm run lint
```

## ☁️ Cloudflare Worker — `buggy-api`

A production-grade TypeScript Cloudflare Worker for Notes D1 sync. Designed for extensibility — future endpoints for AI, bookmarks, etc.

### Why TypeScript?

Cloudflare Workers run on **V8** natively — TypeScript compiles 1:1 to JS with zero overhead. Go would require WASM compilation, adding ~2MB cold start penalty and limited D1 binding support. **TypeScript is the best choice** for CF Workers.

### Architecture

```
worker/
├── wrangler.toml       # D1 binding + config
└── src/
    └── index.ts        # Router → Handler → D1
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check + endpoint list |
| `GET` | `/api/notes` | Fetch all notes from D1 |
| `POST` | `/api/notes/sync` | Merge local notes with D1 (last-write-wins) |
| `DELETE` | `/api/notes/:id` | Delete a note from D1 |

### Deploy

```bash
cd worker
npx wrangler deploy
```

The worker requires [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) and a Cloudflare account. The D1 database `buggythegret` is pre-configured in `wrangler.toml`.

### Adding Features

The worker uses a clean **route table** pattern. Add new endpoints by:

1. Create a handler function
2. Add a route entry to the `routes` array
3. Add any new D1 tables to `runMigrations()`

```ts
// Example: future AI endpoint
{ method: 'POST', pattern: /^\/api\/ai\/chat$/, handler: handleAIChat },
```

Supports future bindings: `R2Bucket`, `KVNamespace`, `AI_API_KEY` (via secrets).

## 📁 Project Structure

```
src/
├── App.tsx                    # Router (wouter) + lazy loading
├── main.tsx                   # Entry point
├── index.css                  # Tailwind v4 entry
├── components/
│   ├── Sidebar.tsx            # Navigation sidebar
│   └── Calendar.tsx           # Nepali calendar grid
├── pages/
│   ├── DateConverter.tsx      # BS ↔ AD converter
│   ├── Calendar.tsx           # Re-exports Calendar component
│   ├── ImageCompressor.tsx    # Image compression + format conversion
│   ├── PdfMerger.tsx          # PDF + image merge
│   ├── Notes.tsx              # Notes with D1 sync
│   └── BcryptGenerator.tsx    # Hash generator + verifier
├── data/
│   └── nepaliCalendar.ts      # BS year data (1990-2090)
└── utils/
    └── dateConverter.ts       # BS ↔ AD conversion (pure functions)

worker/
├── wrangler.toml              # Cloudflare Worker config
└── src/
    └── index.ts               # Worker API
```

## 📦 Build Output

```
CSS:              4.6 KB (gzip)
Core JS + React:  64 KB (gzip)
Calendar:        1.3 KB (gzip)
DateConverter:   1.7 KB (gzip)
Notes:           3.5 KB (gzip)
Bcrypt:         10.3 KB (gzip)
ImageCompressor: 21.8 KB (gzip)
PDF (pdf-lib):  175.6 KB (gzip)
PWA entries:    18 precache
Build time:     ~400ms
```

## 🔌 PWA

- Full offline support via Workbox service worker
- Installable on desktop + mobile
- Auto-update on new deployments
- Google Fonts cached for 1 year
- All assets precached on install

## 📜 License

MIT
