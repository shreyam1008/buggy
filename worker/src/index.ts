import { handleNotesSync } from './handlers/notes';
import { handleAIChat, handleAIImage } from './handlers/ai';
import { handleChatConnection } from './handlers/chat';
import { json, error, getCorsHeaders } from './utils/response';

export interface Env {
  DB: D1Database;
  AI_API_KEY: string;
}

async function runMigrations(db: D1Database): Promise<void> {
  const migrations = [
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
  ];

  await db.batch(migrations);
}

type Route = {
  method: 'GET' | 'POST' | 'OPTIONS';
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
    const url = new URL(request.url);

    try {
      if (request.method === 'GET' || request.method === 'POST') {
        const check = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='notes'").first();
        if (!check) await runMigrations(env.DB);
      }
    } catch (e) {
      console.log('Migration check var:', e);
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: getCorsHeaders(request) });
    }

    for (const route of routes) {
      if (route.method === request.method && route.pattern.test(url.pathname)) {
        return route.handler(env, request);
      }
    }

    return error('Route Not Found', request, 404);
  },
};
