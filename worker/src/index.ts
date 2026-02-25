/**
 * buggy-api — Cloudflare Worker
 *
 * Production-grade API for the Buggy utilities PWA.
 * Currently handles Notes D1 sync. Designed to be extended
 * with AI endpoints, file processing, etc.
 *
 * Architecture:
 *   Router → Handler → D1
 *   Each feature gets its own handler function.
 *   CORS is handled globally.
 */
import type { D1Database } from '@cloudflare/workers-types';

// ─── Types ───────────────────────────────────────────────────
export interface Env {
  DB: D1Database;
  AI_API_KEY: string;
  // Future bindings:
  // BUCKET: R2Bucket;
  // KV: KVNamespace;
}

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string;       // JSON string in D1
  createdAt: number;
  updatedAt: number;
}

interface NotePayload {
  id: string;
  title: string;
  content: string;
  tags: string[] | string;
  createdAt: number;
  updatedAt: number;
  synced?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

function error(message: string, status = 400): Response {
  return json({ error: message }, status);
}

// ─── Database Migrations ─────────────────────────────────────
async function runMigrations(db: D1Database): Promise<void> {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    )`
  ).run();
}

// ─── Notes Handlers ──────────────────────────────────────────
async function handleGetNotes(db: D1Database): Promise<Response> {
  const { results } = await db.prepare(
    'SELECT * FROM notes ORDER BY updatedAt DESC'
  ).all();

  const notes = (results ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    tags: JSON.parse((r.tags as string) || '[]'),
    synced: true,
  }));

  return json({ notes, count: notes.length });
}

async function handleSyncNotes(db: D1Database, req: Request): Promise<Response> {
  const body = await req.json() as { notes?: NotePayload[] };
  const incoming = body.notes ?? [];

  if (!Array.isArray(incoming)) {
    return error('notes must be an array');
  }

  // Upsert each note (last-write-wins by updatedAt)
  const stmt = db.prepare(`
    INSERT INTO notes (id, title, content, tags, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = CASE WHEN excluded.updatedAt > notes.updatedAt THEN excluded.title ELSE notes.title END,
      content = CASE WHEN excluded.updatedAt > notes.updatedAt THEN excluded.content ELSE notes.content END,
      tags = CASE WHEN excluded.updatedAt > notes.updatedAt THEN excluded.tags ELSE notes.tags END,
      updatedAt = MAX(excluded.updatedAt, notes.updatedAt)
  `);

  // Batch for efficiency
  const batch = incoming.map((note) => {
    const tagsStr = Array.isArray(note.tags) ? JSON.stringify(note.tags) : (note.tags || '[]');
    return stmt.bind(
      note.id, note.title || '', note.content || '',
      tagsStr, note.createdAt, note.updatedAt
    );
  });

  if (batch.length > 0) {
    await db.batch(batch);
  }

  // Return merged set
  return handleGetNotes(db);
}

async function handleDeleteNote(db: D1Database, id: string): Promise<Response> {
  await db.prepare('DELETE FROM notes WHERE id = ?').bind(id).run();
  return json({ deleted: id });
}

// ─── AI Handlers ─────────────────────────────────────────────
async function handleAI(env: Env, req: Request): Promise<Response> {
  if (!env.AI_API_KEY) {
    return error('AI API key is missing from environment secrets', 500);
  }

  const body = await req.json() as { messages?: any[], model?: string };
  if (!body.messages || !Array.isArray(body.messages)) {
    return error('Request must contain a valid "messages" array', 400);
  }

  // Use NVIDIA's generic completion endpoint (Llama-3-70B by default)
  const model = body.model || 'meta/llama3-70b-instruct';

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.AI_API_KEY}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: body.messages,
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return error(`NVIDIA API Error: ${response.status} - ${errText}`, 502);
  }

  const data = await response.json();
  return json(data);
}

// ─── Router ──────────────────────────────────────────────────
type RouteHandler = (env: Env, req: Request, params: Record<string, string>) => Promise<Response>;

interface Route {
  method: string;
  pattern: RegExp;
  handler: RouteHandler;
}

const routes: Route[] = [
  // Health
  {
    method: 'GET',
    pattern: /^\/$/,
    handler: async () => json({
      name: 'buggy-api',
      version: '1.0.0',
      status: 'ok',
      endpoints: [
        'GET  /api/notes',
        'POST /api/notes/sync',
        'DELETE /api/notes/:id',
        'POST /api/ai',
      ],
    }),
  },

  // Notes
  {
    method: 'GET',
    pattern: /^\/api\/notes$/,
    handler: async (env) => handleGetNotes(env.DB),
  },
  {
    method: 'POST',
    pattern: /^\/api\/notes\/sync$/,
    handler: async (env, req) => handleSyncNotes(env.DB, req),
  },
  {
    method: 'DELETE',
    pattern: /^\/api\/notes\/([a-f0-9-]+)$/,
    handler: async (env, _req, params) => handleDeleteNote(env.DB, params.id),
  },

  // AI
  {
    method: 'POST',
    pattern: /^\/api\/ai$/,
    handler: async (env, req) => handleAI(env, req),
  },

  // Future routes:
  // { method: 'GET',  pattern: /^\/api\/bookmarks$/, handler: handleBookmarks },
];

// ─── Global State ──────────────────────────────────────────────
const START_TIME = Date.now();

// ─── Entry Point ─────────────────────────────────────────────
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(req.url);

    // Root route to verify the API is alive, equipped with rich stats
    if (url.pathname === '/' || url.pathname === '/api') {
      const now = Date.now();
      const uptimeSec = Math.floor((now - START_TIME) / 1000);
      
      return Response.json({ 
        name: 'buggy-api', 
        status: 'healthy',
        environment: 'production',
        version: '1.1.0',
        system: {
          uptime_seconds: uptimeSec,
          timestamp: new Date().toISOString(),
          datacenter: req.cf?.colo || 'unknown (local dev)',
          country: req.cf?.country || 'unknown',
          city: req.cf?.city || 'unknown',
          timezone: req.cf?.timezone || 'unknown',
          tls_version: req.cf?.tlsVersion || 'unknown',
          http_protocol: req.cf?.httpProtocol || 'unknown'
        },
        bindings: {
          database_d1: !!env.DB ? 'connected' : 'missing',
          ai_nim_api: !!env.AI_API_KEY ? 'configured' : 'missing'
        },
        endpoints: [
          'GET    /api/notes',
          'POST   /api/notes/sync',
          'DELETE /api/notes/:id',
          'POST   /api/ai'
        ]
      }, { headers: CORS_HEADERS });
    }

    // Run migrations (idempotent, ~1ms after first run)
    await runMigrations(env.DB);

    // Route matching
    for (const route of routes) {
      if (req.method !== route.method) continue;
      const match = url.pathname.match(route.pattern);
      if (!match) continue;

      const params: Record<string, string> = {};
      if (match[1]) params.id = match[1];

      try {
        return await route.handler(env, req, params);
      } catch (e) {
        console.error(`[${route.method} ${url.pathname}]`, e);
        return error(`Internal error: ${(e as Error).message}`, 500);
      }
    }

    return error('Not found', 404);
  },
};
