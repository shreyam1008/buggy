import { handleNotesSync } from './handlers/notes';
import { handleAIChat, handleAIImage } from './handlers/ai';
import { handleHealth } from './handlers/health';
import { json, error, getCorsHeaders } from './utils/response';

// Re-export the Durable Object so Wrangler bundles it
export { ChatRoom } from './ChatRoom';

export interface Env {
  DB: D1Database;
  AI_API_KEY: string;
  CHAT_ROOM: DurableObjectNamespace;
}

// Module-level flag — survives across requests in the same isolate.
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
    handler: handleHealth,
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
    handler: async (env, req) => {
      const id = env.CHAT_ROOM.idFromName('main-ashram');
      const stub = env.CHAT_ROOM.get(id);
      return stub.fetch(req);
    },
  }
];

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: getCorsHeaders(request) });
    }

    const url = new URL(request.url);

    for (const route of routes) {
      if (route.method === request.method && route.pattern.test(url.pathname)) {
        // Only run D1 migrations for non-chat routes
        if (route.pattern.source !== '^\\/api\\/chat$') {
          await ensureMigrations(env.DB);
        }
        return route.handler(env, request);
      }
    }

    return error('Route Not Found', request, 404);
  },
};
