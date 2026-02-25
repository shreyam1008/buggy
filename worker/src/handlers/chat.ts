import { Env } from '../index';

interface ChatMessage {
  type: 'chat' | 'system';
  id?: string;
  username?: string;
  message: string;
  createdAt?: number;
}

interface ChatClient {
  socket: WebSocket;
  username: string;
  canWrite: boolean;
}

const activeClients = new Set<ChatClient>();

// Krishna-only epithets
const KRISHNA_NAMES = [
  'Govinda', 'Madhava', 'Keshava', 'Gopala', 'Murari', 'Vasudeva',
  'Damodara', 'Achyuta', 'Hari', 'Shyam', 'Giridhari', 'Muralidhar',
  'Nandakishor', 'Devakinandan', 'Jagannath', 'Dwarkadhish',
  'Banke', 'Mohan', 'Manohara', 'Radheshyam'
];

function generateKrishnaUsername(): string {
  const name = KRISHNA_NAMES[Math.floor(Math.random() * KRISHNA_NAMES.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${name}_${num}`;
}

export async function handleChatConnection(env: Env, req: Request) {
  if (req.headers.get("Upgrade") !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 });
  }

  const { 0: client, 1: server } = new WebSocketPair();
  server.accept();

  // Identity persistence: client can request a stored name via URL param
  const url = new URL(req.url);
  const requestedName = url.searchParams.get('name');
  let username: string;

  if (requestedName && /^[A-Za-z]+_\d{3}$/.test(requestedName)) {
    // Validate: check if this name was used recently in DB (anti-impersonation)
    const recent = await env.DB.prepare(
      `SELECT username FROM live_chat WHERE username = ? ORDER BY createdAt DESC LIMIT 1`
    ).bind(requestedName).first();
    // Allow reuse if the name exists in history (returning user) OR if nobody is using it live
    const liveConflict = [...activeClients].some(c => c.username === requestedName);
    username = (recent && !liveConflict) ? requestedName : generateKrishnaUsername();
  } else {
    username = generateKrishnaUsername();
  }

  // *** CRITICAL: Prune stale/dead sockets before counting writers ***
  // Plain Workers don't guarantee `close` fires for every dead connection.
  // Without this, phantom entries accumulate and block all new writers.
  for (const c of activeClients) {
    if (c.socket.readyState !== 1) { // 1 = OPEN
      activeClients.delete(c);
    }
  }

  // Max 10 concurrent writers
  let writers = 0;
  for (const c of activeClients) {
    if (c.canWrite) writers++;
  }
  const canWrite = writers < 10;
  
  const ctx: ChatClient = { socket: server, username, canWrite };
  activeClients.add(ctx);

  // Welcome packet — client stores this username in localStorage
  server.send(JSON.stringify({ type: 'welcome', username, canWrite }));

  // Load last 30 messages (cursor-based, newest first then reversed)
  try {
    const { results } = await env.DB.prepare(
      `SELECT * FROM live_chat ORDER BY createdAt DESC LIMIT 31`
    ).all();
    const hasMore = results.length > 30;
    const msgs = (hasMore ? results.slice(0, 30) : results).reverse();
    server.send(JSON.stringify({ type: 'history', messages: msgs, hasMore }));
  } catch (e) {
    console.error("Failed to load chat history:", e);
  }

  // Broadcast to all except sender
  const broadcast = (data: any, sender: WebSocket | null = null) => {
    const str = JSON.stringify(data);
    for (const c of activeClients) {
      if (c.socket !== sender && c.socket.readyState === 1) {
        c.socket.send(str);
      }
    }
  };

  if (canWrite) {
    broadcast({ type: 'system', message: `🙏 ${username} joined the ashram` });
  }

  server.addEventListener('message', async (event) => {
    try {
      const data = JSON.parse(event.data as string);
      
      if (data.type === 'chat' && ctx.canWrite && data.message?.trim()) {
        const msgId = crypto.randomUUID();
        const msgTime = Date.now();
        const msgPayload: ChatMessage = { 
          type: 'chat', id: msgId, username, 
          message: data.message.trim().slice(0, 500), // hard limit
          createdAt: msgTime 
        };
        
        // Broadcast to everyone including sender
        const str = JSON.stringify(msgPayload);
        for (const c of activeClients) {
          if (c.socket.readyState === 1) c.socket.send(str);
        }

        // Persist lazily — fire-and-forget
        env.DB.prepare(
          `INSERT INTO live_chat (id, username, message, createdAt) VALUES (?, ?, ?, ?)`
        ).bind(msgId, username, msgPayload.message, msgTime).run().catch(console.error);
        
      } else if (data.type === 'typing' && ctx.canWrite) {
        broadcast({ type: 'typing', username, isTyping: !!data.isTyping }, server);

      } else if (data.type === 'delete' && ctx.canWrite && data.id) {
        const msgId = data.id;
        const msgRecord = await env.DB.prepare(
          `SELECT * FROM live_chat WHERE id = ?`
        ).bind(msgId).first();

        if (msgRecord && msgRecord.username === username) {
          const age = Date.now() - (msgRecord.createdAt as number);
          if (age <= 30000) {
            await env.DB.prepare(`DELETE FROM live_chat WHERE id = ?`).bind(msgId).run();
            const dPayload = JSON.stringify({ type: 'delete', id: msgId });
            for (const c of activeClients) {
              if (c.socket.readyState === 1) c.socket.send(dPayload);
            }
          }
        }

      } else if (data.type === 'loadMore' && typeof data.before === 'number') {
        // Cursor-based pagination: fetch 30 messages older than `before` timestamp
        try {
          const { results } = await env.DB.prepare(
            `SELECT * FROM live_chat WHERE createdAt < ? ORDER BY createdAt DESC LIMIT 31`
          ).bind(data.before).all();
          const hasMore = results.length > 30;
          const msgs = (hasMore ? results.slice(0, 30) : results).reverse();
          server.send(JSON.stringify({ type: 'history', messages: msgs, hasMore }));
        } catch (e) {
          console.error("Failed to load older messages:", e);
        }
      }
    } catch (_) { /* malformed JSON — ignore */ }
  });

  server.addEventListener('close', () => {
    activeClients.delete(ctx);
    if (ctx.canWrite) {
      broadcast({ type: 'system', message: `${username} left the ashram` });
    }
  });

  return new Response(null, { status: 101, webSocket: client });
}
