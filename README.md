# ⚡ Buggy — Offline Utility PWA

A blazing-fast, offline-first utility PWA built with a next-gen, zero-bloat architecture.

| Tech | Version |
|------|---------|
| **Vite** | 8.0.0-beta.15 |
| **TypeScript** | 6.0.0-beta |
| **React** | 19.2 |
| **Tailwind CSS** | 4.2.1 |
| **Database** | SQLite WASM (OPFS) + Cloudflare D1 |
| **Toolchain** | Bun + oxlint |

## 📁 Repository Reorganization

The project is split cleanly for Cloudflare hosting:

```
frontend/        -> Cloudflare Pages
worker/          -> Cloudflare Workers
```

---

## 🖥️ 1. Frontend (`/frontend`)

The frontend is completely powered by **Bun**. It uses `sqlocal` to run a true SQLite WebAssembly database in the browser, persisting to the Origin Private File System (OPFS). This allows our offline app to use the exact same SQL architecture as our Cloudflare D1 backend.

### Features
| Route | Tool | Description |
|-------|------|-------------|
| `/` | **Date Converter** | Nepali (BS) ↔ English (AD) |
| `/calendar` | **Nepali Calendar** | Monthly grid with BS/AD overlay |
| `/image` | **Image Compressor** | Drop, paste, camera capture · Format conversion |
| `/pdf` | **PDF Merger** | Merge PDFs + Images · Reorder |
| `/notes` | **Notes** | **OPFS SQLite** storage · Sync to D1 |
| `/bcrypt` | **Bcrypt Generator** | Hasher + Verifier |

### Getting Started

```bash
cd frontend

# Install dependencies insanely fast
bun install

# Start development server
bun run dev       # → http://localhost:5173

# Production build, typecheck, and lint (oxlint)
bun run build
bun run lint
```

### PWA & OPFS Notes
The frontend serves `_headers` containing `Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin`. This is required to isolate the browser context and enable `SharedArrayBuffer`, allowing SQLite to perform synchronous, maximum-speed IO on the OPFS.

---

## ☁️ 2. Backends & Sync (`/worker`)

Our worker (`buggy-api`) is an ultra-minimalism masterpiece. It is entirely **zero-dependency** — there is no `package.json`, no `node_modules`, and no bloat. It's just massive native V8 processing power.

### Why Zero-Dependency & TypeScript?
Cloudflare Workers execute on V8 Isolates. Because TypeScript compiles down to raw JavaScript with no overhead, we don't need heavyweight tools. Go or Rust would require WASM compilation, which introduces a 1–2MB cold start penalty. Pure TS is the fastest.

### Deploying the Worker

```bash
cd worker
npx wrangler deploy
```

The worker connects to Cloudflare D1 (`buggythegret`). When the frontend `/notes` page hits exactly `POST /api/notes/sync`, the worker batches a massive `.batch()` SQLite update mapping the frontend OPFS SQLite directly to the Cloudflare D1 SQLite. Same queries, same logic. 

## 📜 License
MIT
