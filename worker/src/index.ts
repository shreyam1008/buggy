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

// ─── Types ───────────────────────────────────────────────────
export interface Env {
  DB: D1Database;
  // Future bindings:
  // AI_API_KEY: string;
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
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `);
  // Future tables:
  // CREATE TABLE IF NOT EXISTS bookmarks (...)
  // CREATE TABLE IF NOT EXISTS settings (...)
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

  // Future routes:
  // { method: 'POST', pattern: /^\/api\/ai\/.*/, handler: handleAI },
  // { method: 'GET',  pattern: /^\/api\/bookmarks$/, handler: handleBookmarks },
];

// ─── Entry Point ─────────────────────────────────────────────
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(req.url);

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
