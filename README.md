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

---

## 📁 Repository Structure

The project is split cleanly for independent Cloudflare hosting.

```
frontend/        -> Cloudflare Pages (shreyam1008.com.np)
worker/          -> Cloudflare Workers (api.shreyam1008.com.np)
```

- **`frontend/`**: Uses `bun` as the package manager and test runner. Contains all React UI logic. Use `oxlint` for lightning-fast linting.
- **`worker/`**: **100% Zero Dependency**. No `package.json`, no `node_modules`. Pure TypeScript compiled on-the-fly by Cloudflare's V8 isolates for zero cold-starts.

---

## 🖥️ 1. Frontend (`shreyam1008.com.np`)

Powered entirely by **Bun**. We run **SQLite WebAssembly** directly in the browser via `sqlocal` and persist it to the **OPFS (Origin Private File System)**. This allows the offline frontend to run the *exact same SQL queries* as the backend D1 database.

### Getting Started Locally
```bash
cd frontend

# Install dependencies insanely fast
bun install

# Start development server
bun run dev       # → http://localhost:5173

# Lint with oxlint (fastest linter)
bun run lint
```

### Cloudflare Pages Deployment
To deploy to **Cloudflare Pages** and map to your custom domain (`shreyam1008.com.np`):

1. Go to **Cloudflare Dashboard → Workers & Pages → Create Application → Pages → Connect to Git**.
2. Select your repository.
3. Configure the build settings:
   - **Framework Preset**: `None`
   - **Build command**: `bun run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory (Advanced)**: `/frontend`
4. Once deployed, go to the project's **Custom Domains** tab and enter `shreyam1008.com.np`.

*(Note: The `public/_headers` file handles the strict `COOP` and `COEP` headers automatically required for SQLite `SharedArrayBuffer` speed in production.)*

---

## ☁️ 2. Backends & API (`api.shreyam1008.com.np`)

Our worker (`buggy-api`) is an ultra-minimalism masterpiece. It synchronizes the frontend's local SQLite database seamlessly with your Cloudflare D1 database.

### ❓ Is `wrangler.toml` safe to push to GitHub?
**Yes.** 
The `wrangler.toml` file contains Configuration details (like your `database_id`), which are safe and intended to be committed to version control. They are public routing IDs within Cloudflare's network, not passwords. 

**However, NEVER put API Keys (like OpenAI keys) in `wrangler.toml`.**
You should put API keys in `.env` files locally or inject them using `wrangler secret`.

### Setting up Secrets (API Keys)
To add a secret to your worker (e.g., an AI API key for the future):
```bash
cd worker
npx wrangler secret put AI_API_KEY
```
Cloudflare will prompt you to securely enter the value. Your code can then read it via `env.AI_API_KEY`. It will never touch git.

### Cloudflare Workers Deployment
To deploy the worker and map it to your custom domain (`api.shreyam1008.com.np`):

1. Deploy the worker from your terminal:
   ```bash
   cd worker
   npx wrangler deploy
   ```
2. Go to **Cloudflare Dashboard → Workers & Pages → buggy-api → Triggers -> Custom Domains**.
3. Click "Add Custom Domain" and type `api.shreyam1008.com.np`.
4. Update the sync URL in your frontend (it asks you when you click the 'Sync' button in the Notes app) to `https://api.shreyam1008.com.np`.

### Testing Worker Locally
You can test the worker using Cloudflare's local simulator:
```bash
cd worker
npx wrangler dev
```

---

## 📜 License
MIT
