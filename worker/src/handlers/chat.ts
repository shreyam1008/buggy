import { Env } from '../index';

interface ChatClient {
  socket: WebSocket;
  username: string;
  canWrite: boolean;
}

const activeClients = new Set<ChatClient>();

const KRISHNA_NAMES = [
  'Govinda', 'Madhava', 'Keshava', 'Gopala', 'Murari', 'Vasudeva',
  'Damodara', 'Achyuta', 'Hari', 'Shyam', 'Giridhari', 'Muralidhar',
  'Nandakishor', 'Devakinandan', 'Jagannath', 'Dwarkadhish',
  'Banke', 'Mohan', 'Manohara', 'Radheshyam'
];

function generateUsername(): string {
  const name = KRISHNA_NAMES[Math.floor(Math.random() * KRISHNA_NAMES.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${name}_${num}`;
}

// Prune dead sockets and count writers in a single pass
function pruneAndCountWriters(): number {
  let writers = 0;
  for (const c of activeClients) {
    if (c.socket.readyState !== 1) {
      activeClients.delete(c);
    } else if (c.canWrite) {
      writers++;
    }
  }
  return writers;
}

// Broadcast JSON to all open sockets (optionally excluding one)
function broadcast(data: unknown, exclude?: WebSocket): void {
  const str = JSON.stringify(data);
  for (const c of activeClients) {
    if (c.socket !== exclude && c.socket.readyState === 1) {
      c.socket.send(str);
    }
  }
}

// Send JSON to all open sockets (including sender)
function broadcastAll(str: string): void {
  for (const c of activeClients) {
    if (c.socket.readyState === 1) c.socket.send(str);
  }
}

export async function handleChatConnection(env: Env, req: Request) {
  if (req.headers.get('Upgrade') !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }

  const { 0: client, 1: server } = new WebSocketPair();
  server.accept();

  // Resolve username — reuse stored name if valid and not conflicting live
  const url = new URL(req.url);
  const requestedName = url.searchParams.get('name');
  let username: string;

  if (requestedName && /^[A-Za-z]+_\d{3}$/.test(requestedName)) {
    // Only check live conflict (cheap, in-memory). Skip DB query —
    // the name format itself is proof of a previous assignment.
    const liveConflict = (() => {
      for (const c of activeClients) {
        if (c.username === requestedName && c.socket.readyState === 1) return true;
      }
      return false;
    })();
    username = liveConflict ? generateUsername() : requestedName;
  } else {
    username = generateUsername();
  }

  // Prune stale sockets + count writers in one pass
  const writers = pruneAndCountWriters();
  const canWrite = writers < 10;

  const ctx: ChatClient = { socket: server, username, canWrite };
  activeClients.add(ctx);

  // Welcome — client stores username in localStorage
  server.send(JSON.stringify({ type: 'welcome', username, canWrite }));

  // Load recent history — single query, only needed columns
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, username, message, createdAt FROM live_chat ORDER BY createdAt DESC LIMIT 31`
    ).all();
    const hasMore = results.length > 30;
    const msgs = (hasMore ? results.slice(0, 30) : results).reverse();
    server.send(JSON.stringify({ type: 'history', messages: msgs, hasMore }));
  } catch (e) {
    console.error('History load failed:', e);
  }

  if (canWrite) {
    broadcast({ type: 'system', message: `🙏 ${username} joined the ashram` });
  }

  server.addEventListener('message', async (event) => {
    try {
      const data = JSON.parse(event.data as string);

      if (data.type === 'chat' && ctx.canWrite && data.message?.trim()) {
        const id = crypto.randomUUID();
        const createdAt = Date.now();
        const message = data.message.trim().slice(0, 500);

        // Broadcast to everyone (including sender)
        broadcastAll(JSON.stringify({
          type: 'chat', id, username, message, createdAt,
        }));

        // Persist lazily — fire-and-forget
        env.DB.prepare(
          `INSERT INTO live_chat (id, username, message, createdAt) VALUES (?, ?, ?, ?)`
        ).bind(id, username, message, createdAt).run().catch(console.error);

      } else if (data.type === 'typing' && ctx.canWrite) {
        broadcast({ type: 'typing', username, isTyping: !!data.isTyping }, server);

      } else if (data.type === 'delete' && ctx.canWrite && data.id) {
        // Fetch only the columns we need for validation
        const row = await env.DB.prepare(
          `SELECT username, createdAt FROM live_chat WHERE id = ?`
        ).bind(data.id).first();

        if (row && row.username === username) {
          const age = Date.now() - (row.createdAt as number);
          if (age <= 30000) {
            await env.DB.prepare(`DELETE FROM live_chat WHERE id = ?`).bind(data.id).run();
            broadcastAll(JSON.stringify({ type: 'delete', id: data.id }));
          }
        }

      } else if (data.type === 'loadMore' && typeof data.before === 'number') {
        try {
          const { results } = await env.DB.prepare(
            `SELECT id, username, message, createdAt FROM live_chat WHERE createdAt < ? ORDER BY createdAt DESC LIMIT 31`
          ).bind(data.before).all();
          const hasMore = results.length > 30;
          const msgs = (hasMore ? results.slice(0, 30) : results).reverse();
          server.send(JSON.stringify({ type: 'history', messages: msgs, hasMore }));
        } catch (e) {
          console.error('Older messages load failed:', e);
        }
      }
    } catch { /* malformed JSON — ignore */ }
  });

  server.addEventListener('close', () => {
    activeClients.delete(ctx);
    if (ctx.canWrite) {
      broadcast({ type: 'system', message: `${username} left the ashram` });
    }
  });

  return new Response(null, { status: 101, webSocket: client });
}
