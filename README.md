# ⚡ Buggy — Next-Gen Offline Utility PWA

**Buggy** is a bleeding-edge, maximum-performance Progressive Web Application (PWA) hosting a suite of daily developer utilities. Built with an uncompromising focus on speed, offline capability, and modern web architecture, it runs entirely in the browser using WebAssembly and synchronizes securely to the edge.

---

## 🚀 Tech Stack & Architecture

Buggy abandons legacy bundlers and frameworks in favor of a zero-bloat, ultra-modern stack:

| Technology | Version / Details | Purpose |
|------------|-------------------|---------|
| **Vite** | `^8.0.0-beta.15` | Lightning-fast HMR and Rollup bundling with parallel ESBuild minification (1.2s production build). |
| **TypeScript** | `^6.0.0-beta` | Strict type safety across both frontend UI and backend Worker handlers. |
| **React** | `^19.1.1` | Concurrent rendering with functional components and hooks. |
| **Tailwind CSS** | `^4.2.1` | Utility-first styling with zero-configuration Vite integration. |
| **SQLocal** | `^0.17.0` | In-browser SQLite powered by WebAssembly and OPFS (Origin Private File System) for synchronous-speed persistence. |
| **Cloudflare Workers** | `/worker` | Zero-dependency, V8-isolate serverless backend. 0ms cold starts. |
| **Cloudflare D1** | `SQLite Edge` | globally distributed SQL database for cross-device syncing. |
| **NVIDIA NIM API** | `v1` | High-performance inference endpoints for Llama 3.1, Gemma 2, and Stable Diffusion XL. |
| **Bun** | `Latest` | Used exclusively as the package manager and test runner for instant dependency resolution. |

---

## ✨ Features

- **✅ Fully Offline PWA**: Installable on iOS/Android/Desktop. Once loaded, the app functions entirely without an internet connection (excluding Cloud Sync and AI generation).
- **📅 Date Converter & Calendar**: Advanced Nepali-to-English (BS to AD) date conversion and calendar rendering.
- **🖼️ Image Compressor**: Client-side image compression using `browser-image-compression`. Zero server uploads required.
- **📄 PDF Merger**: Client-side PDF manipulation via `pdf-lib` to merge multiple documents securely in local memory.
- **🔒 Bcrypt Generator**: Instant, secure password hashing using `bcryptjs`.
- **📝 Notes with Cloud Sync**: 
  - **Local-First**: Notes are saved instantly to the local OPFS SQLite database.
  - **Edge Sync**: Click "Sync" to perform a bidirectional merge with a Cloudflare D1 database, allowing cross-device accessibility.
- **✨ AI Studio (Accelerated by NVIDIA NIM)**:
  - **Chat**: Blazing-fast Server-Sent Event (SSE) streaming chat. Switch instantly between live models like `Llama-3.1-70B`, `Llama-3.1-8B`, and `Gemma-2-9B`.
  - **Image Generation**: Render prompts directly to `base64` using `stabilityai/stable-diffusion-xl`.
  - **Smart Offline Detection**: The UI gracefully detects `navigator.onLine` status and locks the AI studio with a warning when the device drops connection.
- **🛡️ Strict API Security**: The `/api` backend is protected by a rigid CORS policy, strictly rejecting requests from any domain other than `shreyam1008.com.np` or `localhost`.

---

## 📁 Repository Structure

The project is split strictly into two independent deployment zones:

```text
buggy/
├── frontend/        -> Deployed to Cloudflare Pages (shreyam1008.com.np)
│   ├── src/         -> React Components, Pages, and Wouter routing
│   ├── public/      -> PWA Manifest, Icons, and strict COOP/COEP Headers
│   └── vite.config.ts -> Highly optimized Rollup manualChunks configuration
└── worker/          -> Deployed to Cloudflare Workers (apiv2.shreyam1008.com.np)
    ├── src/         -> Zero-dependency routing, D1 syncing, and AI Proxy logic
    └── wrangler.toml -> Edge configuration and Database bindings
```

---

## 🖥️ 1. Frontend Development (`frontend/`)

### Getting Started Locally
Ensure you have [Bun](https://bun.sh/) installed. We use Bun exclusively over npm/yarn for speed.

```bash
cd frontend
bun install

# Start ultra-fast Vite dev server
bun run dev       # → http://localhost:5173

# Build for production (1.2s build time)
bun run build
```

### Build Pipeline Optimizations
The build script (`vite build`) has been hyper-optimized:
1. **Removed `tsc` blocking**: TypeScript transpilation is handled directly by Esbuild, dropping build times from ~19s to ~1s.
2. **Rollup `manualChunks`**: Heavy dependencies (`react`, `sqlocal`, `pdf-lib`) are split into distinct `vendor-*.js` files. The PWA Service Worker perfectly caches these chunks so returning users only download your tiny UI changes.

### Cloudflare Pages Deployment
1. Navigate to **Cloudflare Dashboard → Workers & Pages → Create Application → Pages → Connect to Git**.
2. Select the repository and set:
   - **Framework Preset**: `None`
   - **Build command**: `bun run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory**: `/frontend`
3. Map to your Custom Domain (`shreyam1008.com.np`).

*(Note: SQLocal WebAssembly requires `SharedArrayBuffer`. The `/public/_headers` file automatically applies strict `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` to satisfy security constraints).*

---

## ☁️ 2. Backend & Worker Setup (`worker/`)

The Cloudflare Worker manages both the D1 Database for syncing notes and acts as a secure reverse-proxy for the NVIDIA AI API.

### Getting Started Locally

```bash
cd worker
npm install # Only installs Cloudflare types

# Run the local worker simulator
npx wrangler dev  # → http://localhost:8787
```

### Managing Secrets (NVIDIA AI Key)
**NEVER** commit API keys to `wrangler.toml` or Git. Security keys are injected securely into the Cloudflare environment:

```bash
cd worker
npx wrangler secret put AI_API_KEY
# Paste your NVIDIA API key when prompted
```

### Cloudflare Workers Deployment
1. Deploy the worker from your terminal:
   ```bash
   cd worker
   npx wrangler deploy
   ```
2. Navigate to **Cloudflare Dashboard → Workers & Pages → buggy-api → Custom Domains**.
3. Add your routing domain (e.g., `api.shreyam1008.com.np`).

### D1 Database Migrations
The worker automatically manages SQLite schema creation on-the-fly via the `runMigrations` function. Simply binding the database in `wrangler.toml` allows the worker to construct the `notes` table upon the first sync request.

---

## 🔗 Related Projects

This project is part of a larger ecosystem of tools and applications:
- **[dbterm](https://github.com/shreyam1008/dbterm)** - A terminal-based database explorer.
- **[Radhey](https://radhey.web.app/)**
- **[Nepal Legal Firm](https://nepallegalfirm.com.np/)**

---

## 📜 License
MIT
