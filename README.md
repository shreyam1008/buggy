# Buggy - Utilities & Sync PWA
![Offline PWA Utilities](https://img.shields.io/badge/Status-Production-emerald?style=for-the-badge) ![Vite Build](https://img.shields.io/badge/Frontend-Vite_8_PWA-blue?style=for-the-badge) ![Worker](https://img.shields.io/badge/Backend-Cloudflare_Workers-f38020?style=for-the-badge)

**Buggy** is an incredibly fast, bleeding-edge offline-first Progressive Web App (PWA) containing a suite of productivity utilities natively programmed for performance and massive scale. 

Developed and distributed by **Shreyam Adhikari (shreyam1008)**.

## 🚀 Features

- **Live Ashram (WebSockets)**: Global real-time chat with 10 max writers, random Vedic usernames, typing indicators, and a strict 30-second self-destruct function built directly on Cloudflare Edge Memory.
- **NVIDIA AI Studio**: Utilize cutting-edge LLMs (`Llama-3.1-70B`, `Gemma-2-9B`, `Mixtral-8x22B`) and `Stable Diffusion XL` via NVIDIA's blazing fast NIM APIs with full HTTP streaming support.
- **OPFS Notes Sync**: Browser local-first SQLite (`sqlocal`) database holding your notes, which sync seamlessly to Cloudflare D1 across all your devices on command.
- **Nepali Calendar**: Native, offline-first Nepali BS to English AD chronological engine.
- **In-Browser Utilities**: Client-side Image Compression (WASM), PDF Merging (`pdf-lib`), and Bcrypt Hash generation. No server bandwidth required for heavy tasks!
- **Native UI/UX**: Designed around OS-level `prefers-color-scheme` optimizations with a dedicated manual Dark Mode override that shifts pure CSS variables for hardware-accelerated animations and an incredible 100/100 Lighthouse score.

---

## 🏗️ Architecture

The project has been aggressively refactored to separate the Data Layer, Network Layer, and Rendering Layer perfectly.

### Frontend (`/frontend`)
- **React 19 + TypeScript**: Strong typing combined with TanStack React Query (`useQuery`, `useMutation`) drastically reduces loading state boilerplate.
- **Vite 8**: Sub-second build times relying entirely on `bun` with optimized manual chunks (`vendor-query`, `vendor-sqlite`) to keep the initial load under a few KBs.
- **Tailwind v4**: Native CSS variable interpolation instead of heavy JS-in-CSS injection, delivering a pure `index.css` aesthetic.
- **Custom React Hooks**: Features like `useLiveChat` cleanly separate the chaotic WebSocket connection loop from the pristine React presentation layer.

### Backend (`/worker`)
- **Cloudflare Workers (Edge)**: Runs instantly on V8 Isolates across thousands of datacenters globally.
- **Modular Domain Design**: The `index.ts` Router is exceptionally minimal (< 100 lines), redirecting traffic intelligently to `handlers/ai.ts`, `handlers/notes.ts`, and `handlers/chat.ts`.
- **Cloudflare D1 SQL**: Highly available SQL database for historical message persistence and global Note states. 

---

## 💻 Local Development Setup

We strictly use `bun` as the blazing fast package manager.

```bash
# 1. Clone the repository
git clone https://github.com/shreyam1008/buggy
cd buggy

# 2. Setup the Worker & Database
cd worker
npm i -g npx # Assure npx is installed
npx wrangler d1 create buggythegret # Or use your specific DB reference 
npx wrangler deploy

# 3. Start the Frontend
cd ../frontend
bun install
bun run dev
```

Remember to map your `VITE_API_URL` inside `frontend/.env` to point to the live Worker edge location so the WebSockets and AI requests hit your datacenter correctly.

---

## 🕸️ SEO & Indexing

- All indexing routes are configured via `sitemap.xml`.
- **AI Crawlers are aggressively blocked** in `robots.txt` (`GPTBot`, `Claude-Web`, `CCBot`, etc.).
- Deep JSON-LD structure metadata applied indicating Shreyam Adhikari as the Creator.

---

## 🔗 Connect With Me

- **Twitter / X**: [@shreyam1008](https://x.com/shreyam1008)
- **LinkedIn**: [Shreyam Adhikari](https://linkedin.com/in/shreyam1008)
- **GitHub**: [shreyam1008](https://github.com/shreyam1008)
- **YouTube**: [@shreyam1008](https://youtube.com/@shreyam1008)
