import { handleNotesSync } from './handlers/notes';
import { handleAIChat, handleAIImage } from './handlers/ai';
import { handleChatConnection } from './handlers/chat';
import { json, error, getCorsHeaders } from './utils/response';

export interface Env {
  DB: D1Database;
  AI_API_KEY: string;
}

// Module-level flag — survives across requests in the same isolate.
// Avoids hitting D1 on every single request just to check if tables exist.
let migrated = false;

async function ensureMigrations(db: D1Database): Promise<void> {
  if (migrated) return;
  try {
    const check = await db.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='notes'"
    ).first();
    if (!check) {
      await db.batch([
        db.prepare(`
          CREATE TABLE IF NOT EXISTS notes (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            tags TEXT NOT NULL,
            createdAt INTEGER NOT NULL,
            updatedAt INTEGER NOT NULL,
            synced INTEGER NOT NULL DEFAULT 1
          )
        `),
        db.prepare(`
          CREATE TABLE IF NOT EXISTS live_chat (
            id TEXT PRIMARY KEY,
            username TEXT NOT NULL,
            message TEXT NOT NULL,
            createdAt INTEGER NOT NULL
          )
        `),
        db.prepare(`CREATE INDEX IF NOT EXISTS idx_chat_time ON live_chat(createdAt)`)
      ]);
    }
    migrated = true;
  } catch (e) {
    console.error('Migration error:', e);
  }
}

type Route = {
  method: 'GET' | 'POST';
  pattern: RegExp;
  handler: (env: Env, req: Request) => Promise<Response>;
};

const routes: Route[] = [
  {
    method: 'GET',
    pattern: /^\/$/,
    handler: async (_env, req) => json({ 
      status: 'Buggy Cloudflare Edge is Live', 
      latencyInfo: 'Globally Distributed via Workers',
      routes: ['/api/notes/sync', '/api/ai', '/api/ai/image', '/api/chat (ws)']
    }, req),
  },
  {
    method: 'POST',
    pattern: /^\/api\/notes\/sync$/,
    handler: handleNotesSync,
  },
  {
    method: 'POST',
    pattern: /^\/api\/ai$/,
    handler: handleAIChat,
  },
  {
    method: 'POST',
    pattern: /^\/api\/ai\/image$/,
    handler: handleAIImage,
  },
  {
    method: 'GET',
    pattern: /^\/api\/chat$/,
    handler: handleChatConnection,
  }
];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Fast-path: CORS preflight — no DB work needed
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: getCorsHeaders(request) });
    }

    const url = new URL(request.url);

    for (const route of routes) {
      if (route.method === request.method && route.pattern.test(url.pathname)) {
        // Only run migrations for routes that actually need the DB
        await ensureMigrations(env.DB);
        return route.handler(env, request);
      }
    }

    return error('Route Not Found', request, 404);
  },
};
