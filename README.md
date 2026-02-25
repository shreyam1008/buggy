# ⚡ Buggy — Next-Gen Offline Utility PWA

**Buggy** is a bleeding-edge, maximum-performance Progressive Web Application (PWA) hosting a suite of daily developer utilities. Built with an uncompromising focus on speed, offline capability, and modern web architecture, it runs entirely in the browser using WebAssembly and synchronizes securely to the edge.

---

## 🚀 Tech Stack & Core Engine

Buggy abandons legacy bundlers and frameworks in favor of a zero-bloat, ultra-modern stack designed for absolute minimum latency.

| Technology | Details | Purpose |
|------------|-------------------|---------|
| **Vite `v8.0.0-beta`** | Rollup + Esbuild | Lightning-fast HMR and bundling. Custom Rollup `manualChunks` strips a 19s build down to **1.2s**, caching vendor libraries indefinitely on the client. |
| **TypeScript `v6.0.0-beta`** | Strict Mode | Enforces immaculate type safety across both frontend UI and backend Worker handlers. |
| **React `v19`** | Concurrent Mode | Next-generation React offering buttery-smooth transitions and hook-based concurrency. |
| **Tailwind CSS `v4`** | Utility-first | Zero-configuration Vite native integration for perfectly semantic styling. |
| **Bun** | JS Runtime/Manager | Used exclusively over npm/yarn for instant dependency resolution and script execution. |

---

## 🏗️ System Architecture & Data Flow

```mermaid
graph TD
    classDef frontend fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef worker fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#fff;
    classDef db fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#fff;
    classDef external fill:#0f172a,stroke:#8b5cf6,stroke-width:2px,color:#fff;

    subgraph "Client (Browser / Offline PWA)"
        UI[React 19 UI]:::frontend
        OPFS[(SQLite WASM\nOPFS Storage)]:::db
        SyncEngine[Sync Engine]:::frontend
        AI[AI Interface]:::frontend
        Cache[Service Worker\nCache]:::db
    end

    subgraph "Cloudflare Edge (api.shreyam1008.com.np)"
        Worker[Cloudflare Worker]:::worker
        D1[(D1 Global DB)]:::db
    end
    
    subgraph "NVIDIA Serverless Inference"
        NIM[NVIDIA NIM AI API]:::external
    end

    UI <--> |Local Read/Write (Zero Latency)| OPFS
    UI --> |Offline Asset Load| Cache
    UI <--> |Creates Prompts| AI
    SyncEngine <--> |Bidirectional Rest Sync| Worker
    AI <--> |SSE Stream / Base64 Image| Worker
    Worker <--> |Persist/Fetch via SQL| D1
    Worker <--> |Secure Bearer Request| NIM
```

---

## 🗄️ Database Deep-Dive

### 1. In-Browser: `SQLocal` (SQLite WASM + OPFS)
Buggy stores all your user data **locally** in the browser using a real SQLite engine.
- **How it works:** SQLite is compiled to WebAssembly (WASM).
- **Storage Layer:** It uses the **Origin Private File System (OPFS)**. This allows the WASM binary to perform synchronous read/write operations directly to your device's hard drive from the browser.
- **Why it matters:** Unlike `localStorage` (which blocks the main thread) or `IndexedDB` (which is famously slow and clunky), OPFS SQLite offers near-native C++ database speeds. Queries resolve in mere milliseconds.
- **Security Constraint:** OPFS requires `SharedArrayBuffer`, which is why the PWA strictly enforces `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers.

### 2. The Cloud Edge: Cloudflare D1
When the user clicks **Sync**, the entire local database payload is structurally matched to a serverless SQL database distributed across Cloudflare's global edge network.
- **Migrations:** The worker dynamically intercepts requests and runs a `runMigrations` SQL payload if the table doesn't exist, ensuring a zero-setup backend environment.
- **Conflict Resolution:** The `ON CONFLICT(id) DO UPDATE SET` logic guarantees that the latest edits are flawlessly merged without duplicating notes.

---

## ✨ Full Feature Suite

### 1. 📝 Notes (OPFS Native)
- **Local-First**: Notes are saved instantly to the local OPFS database.
- **Monochromatic Brutalism**: Redesigned UI adhering to ultra-semantic `oat.ink` aesthetics—no invisible hovers, perfect touch accessibility.
- **Cloud Sync**: Perform a bidirectional merge with Cloudflare D1.

### 2. ✨ AI Studio (NVIDIA NIM Integration)
- **Smart Offline Locks**: The UI gracefully detects `navigator.onLine` status and locks the studio with a warning when the device drops connection.
- **SSE Chat**: Blazing-fast Server-Sent Event streaming chat bypassing massive SDK wrappers. Switch between live open-weights like `Llama-3.1-70B`, `Llama-3.1-8B`, and `Gemma-2-9B`.
- **Image Generation**: Render prompts directly to massive `base64` image strings via a Worker proxy interpreting `stabilityai/stable-diffusion-xl`.

### 3. Client-Side Cryptography & File Tooling
- **📅 Date Converter**: Advanced Nepali-to-English (BS to AD) calendar manipulation.
- **�️ Image Compressor**: Canvas-based compression (`browser-image-compression`). Zero server uploads.
- **📄 PDF Merger**: Document byte-manipulation using `pdf-lib` securely in local memory.
- **🔒 Bcrypt Generator**: Instant, secure password hashing using `bcryptjs`.

---

## 📁 Repository Structure

```text
buggy/
├── frontend/        -> Deployed to Cloudflare Pages (shreyam1008.com.np)
│   ├── src/         -> React Components, Hooks, and Wouter routing
│   ├── public/      -> PWA Manifest, Icons, and Strict Security Headers
│   └── vite.config.ts -> Highly optimized Rollup manualChunks configuration
└── worker/          -> Deployed to Cloudflare Workers (apiv2.shreyam1008.com.np)
    ├── src/         -> Zero-dependency routing, D1 syncing, and AI Proxy logic
    └── wrangler.toml -> Edge configuration and Database bindings
```

---

## 🖥️ Getting Started Locally

```bash
# 1. Frontend setup
cd frontend
bun install

# Start ultra-fast Vite dev server
bun run dev       # → http://localhost:5173

# 2. Worker setup (Test backend locally)
cd ../worker
npx wrangler secret put AI_API_KEY # Put your NVIDIA key here
npx wrangler dev  # → http://localhost:8787
```

---

## 🔗 Related Projects

This project belongs to an interconnected ecosystem of tools:
- **[dbterm](https://shreyam1008.github.io/dbterm/)** - A beautiful, terminal-based database explorer.
- **[Radhey](https://radhey.web.app/)**
- **[Nepal Legal Firm](https://nepallegalfirm.com.np/)**

---

## 📜 License
MIT
