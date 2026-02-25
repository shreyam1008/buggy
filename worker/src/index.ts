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
const ALLOWED_ORIGINS = [
  'https://shreyam1008.com.np',
  'https://apiv2.shreyam1008.com.np'
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin');
  let allowedOrigin = 'https://shreyam1008.com.np'; // Default strict

  if (origin) {
    if (ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost:')) {
      allowedOrigin = origin;
    }
  }

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data: unknown, status = 200, req?: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      'Content-Type': 'application/json', 
      ...(req ? getCorsHeaders(req) : getCorsHeaders({ headers: new Headers() } as unknown as Request))
    },
  });
}

function error(message: string, status = 400, req?: Request): Response {
  return json({ error: message }, status, req);
}

async function runMigrations(db: D1Database): Promise<void> {
  await db.batch([
    db.prepare(
      `CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        tags TEXT NOT NULL DEFAULT '[]',
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        synced INTEGER NOT NULL DEFAULT 0
      )`
    ),
    db.prepare(
      `CREATE TABLE IF NOT EXISTS live_chat (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        message TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      )`
    )
  ]);
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

  return json({ notes, count: notes.length }, 200, undefined);
}

async function handleSyncNotes(db: D1Database, req: Request): Promise<Response> {
  const body = await req.json() as { notes?: NotePayload[] };
  const incoming = body.notes ?? [];

  if (!Array.isArray(incoming)) {
    return error('notes must be an array', 400, req);
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

  return handleGetNotes(db).then(async (res) => {
      const data = await res.json();
      return json(data, 200, req);
  });
}

async function handleDeleteNote(db: D1Database, id: string): Promise<Response> {
  await db.prepare('DELETE FROM notes WHERE id = ?').bind(id).run();
  return json({ deleted: id }); // Handled implicitly safely since it's just an internal call or passes down generic CORS.
}

// ─── AI Handlers ─────────────────────────────────────────────
async function handleAI(env: Env, req: Request): Promise<Response> {
  if (!env.AI_API_KEY) return error('AI API key is missing from environment secrets', 500, req);
  if (req.method === 'OPTIONS') return new Response(null, { headers: getCorsHeaders(req) });

  const body = await req.json() as { messages?: any[], model?: string, stream?: boolean };
  if (!body.messages || !Array.isArray(body.messages)) return error('Request must contain a valid "messages" array', 400, req);

  const model = body.model || 'meta/llama3-70b-instruct';
  const stream = body.stream === true;

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.AI_API_KEY}`,
      'Accept': stream ? 'text/event-stream' : 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: body.messages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: stream,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return error(`NVIDIA API Error: ${response.status} - ${errText}`, 502, req);
  }

  // If streaming, return the readable stream directly
  if (stream) {
    return new Response(response.body, {
      headers: {
        ...getCorsHeaders(req),
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  }

  // Normal JSON
  const data = await response.json();
  return json(data, 200, req);
}

async function handleAIImage(env: Env, req: Request): Promise<Response> {
  if (!env.AI_API_KEY) return error('AI API key is missing from environment secrets', 500, req);
  
  const body = await req.json() as { prompt?: string, model?: string };
  if (!body.prompt) return error('Request must contain a "prompt" string', 400, req);

  const model = body.model || 'stabilityai/stable-diffusion-xl';

  // NVIDIA changed their image endpoints
  const endpoint = `https://ai.api.nvidia.com/v1/genai/${model}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.AI_API_KEY}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text_prompts: [{ text: body.prompt }],
      steps: 30,
      cfg_scale: 5,
      sampler: "K_EULER_ANCESTRAL"
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return error(`NVIDIA Image generation failed: ${response.status} - ${errText}`, 502, req);
  }

  const data = await response.json() as any;
  
  // Transform NIM output back into the OpenAI structure so frontend AI.tsx stays identical
  if (data.artifacts && data.artifacts[0]?.base64) {
    return json({ data: [{ b64_json: data.artifacts[0].base64 }] }, 200, req);
  }

  return json(data, 200, req);
}

// ─── Chat WebSockets ──────────────────────────────────────────

interface ChatClient {
  socket: WebSocket;
  username: string;
  canWrite: boolean;
  active: boolean;
}

const activeClients = new Set<ChatClient>();

const VEDIC_PREFIXES = ['Shiva', 'Vishnu', 'Brahma', 'Krishna', 'Rama', 'Ganesha', 'Hanuman', 'Indra', 'Agni', 'Surya', 'Saraswati', 'Lakshmi', 'Parvati', 'Durga', 'Kali', 'Bhagwati'];

function generateVedicUsername(): string {
  const prefix = VEDIC_PREFIXES[Math.floor(Math.random() * VEDIC_PREFIXES.length)];
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${prefix}_${suffix}`;
}

function broadcast(msg: any) {
  const str = JSON.stringify(msg);
  for (const client of activeClients) {
    if (client.active) {
      try { client.socket.send(str); } catch (e) { /* ignore disconnected */ }
    }
  }
}

async function handleChatConnection(env: Env, req: Request): Promise<Response> {
  const upgradeHeader = req.headers.get('Upgrade');
  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }

  const [client, server] = Object.values(new WebSocketPair());

  const currentWriters = Array.from(activeClients).filter(c => c.canWrite && c.active).length;
  const canWrite = currentWriters < 10;
  const username = generateVedicUsername();

  const chatClient: ChatClient = { socket: server, username, canWrite, active: true };
  activeClients.add(chatClient);

  server.accept();

  // Send initial state & recent history
  server.send(JSON.stringify({ type: 'welcome', username, canWrite }));
  
  env.DB.prepare('SELECT * FROM live_chat ORDER BY createdAt DESC LIMIT 50').all()
    .then(({ results }) => {
      if (results && results.length > 0) {
        // Reverse so chronological locally
        server.send(JSON.stringify({ type: 'history', messages: results.reverse() }));
      }
    }).catch(e => console.error('Failed to load history', e));

  // Announce join
  broadcast({ type: 'system', message: `${username} joined the ashram.`, count: activeClients.size, writers: currentWriters + (canWrite ? 1 : 0) });

  server.addEventListener('message', async (event: any) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'chat' && canWrite) {
        const msg = {
          id: crypto.randomUUID(),
          username,
          message: data.message,
          createdAt: Date.now()
        };
        // Broadcast instantly
        broadcast({ type: 'chat', ...msg });
        // Persist
        await env.DB.prepare('INSERT INTO live_chat (id, username, message, createdAt) VALUES (?, ?, ?, ?)').bind(msg.id, msg.username, msg.message, msg.createdAt).run();
      } 
      else if (data.type === 'typing' && canWrite) {
        broadcast({ type: 'typing', username, isTyping: data.isTyping });
      }
      else if (data.type === 'delete' && canWrite) {
        const targetId = data.id;
        const msgRecord = await env.DB.prepare('SELECT * FROM live_chat WHERE id = ?').bind(targetId).first();
        if (msgRecord && msgRecord.username === username) {
          const age = Date.now() - (msgRecord.createdAt as number);
          if (age <= 30000) { // 30 second window
            await env.DB.prepare('DELETE FROM live_chat WHERE id = ?').bind(targetId).run();
            broadcast({ type: 'delete', id: targetId });
          }
        }
      }
    } catch (e) {
      console.error('Socket message parse error', e);
    }
  });

  server.addEventListener('close', () => {
    chatClient.active = false;
    activeClients.delete(chatClient);
    broadcast({ type: 'system', message: `${username} left.`, count: activeClients.size, writers: Array.from(activeClients).filter(c => c.canWrite).length });
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
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
        'GET  /api/chat',
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
  {
    method: 'POST',
    pattern: /^\/api\/ai\/image$/,
    handler: async (env, req) => handleAIImage(env, req),
  },

  // Live Chat
  {
    method: 'GET',
    pattern: /^\/api\/chat$/,
    handler: async (env, req) => handleChatConnection(env, req),
  },

  // Future routes:
  // { method: 'GET',  pattern: /^\/api\/bookmarks$/, handler: handleBookmarks },
];

// ─── Global State ──────────────────────────────────────────────
const START_TIME = Date.now();

// ─── Entry Point ─────────────────────────────────────────────
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const corsHeaders = getCorsHeaders(req);

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(req.url);

    // Enforce origin strictness on API routes if not a preflight
    const origin = req.headers.get('Origin');
    if (url.pathname.startsWith('/api') && origin && !ALLOWED_ORIGINS.includes(origin) && !origin.startsWith('http://localhost:')) {
      return error('Access Denied: Invalid Origin. Requests must come from shreyam1008.com.np', 403, req);
    }

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
          'POST   /api/ai',
          'POST   /api/ai/image',
          'GET    /api/chat (WebSocket)'
        ]
      }, { headers: corsHeaders });
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
        return error(`Internal error: ${(e as Error).message}`, 500, req);
      }
    }

    return error('Not found', 404, req);
  },
};
