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

// Vedic Username pool
const VEDIC_NAMES = [
  'Shiva', 'Vishnu', 'Brahma', 'Indra', 'Agni', 'Surya', 'Varuna', 'Vayu', 
  'Ganesha', 'Kartikeya', 'Rama', 'Krishna', 'Saraswati', 'Lakshmi', 'Parvati', 
  'Durga', 'Kali', 'Sita', 'Radha', 'Hanuman', 'Yama', 'Kubera', 'Kama'
];

function generateVedicUsername(): string {
  const name = VEDIC_NAMES[Math.floor(Math.random() * VEDIC_NAMES.length)];
  const num = Math.floor(100 + Math.random() * 900); // 100-999
  return `${name}_${num}`;
}

export async function handleChatConnection(env: Env, req: Request) {
  if (req.headers.get("Upgrade") !== "websocket") {
    return new Response("Expected Upgrade: websocket", { status: 426 });
  }

  const { 0: client, 1: server } = new WebSocketPair();
  server.accept();

  const username = generateVedicUsername();
  
  // Logic: Max 10 writers. If > 10, they are pure observers.
  let writers = 0;
  for (const c of activeClients) {
    if (c.canWrite) writers++;
  }
  const canWrite = writers < 10;
  
  const ctx: ChatClient = { socket: server, username, canWrite };
  activeClients.add(ctx);

  // Send welcome packet
  server.send(JSON.stringify({ type: 'welcome', username, canWrite }));

  // Load last 50 messages from DB
  try {
    const { results } = await env.DB.prepare(
      `SELECT * FROM live_chat ORDER BY createdAt DESC LIMIT 50`
    ).all();
    server.send(JSON.stringify({ type: 'history', messages: results.reverse() }));
  } catch (e) {
    console.error("Failed to load chat history:", e);
  }

  const broadcast = (data: any, sender: WebSocket | null = null) => {
    const str = JSON.stringify(data);
    for (const c of activeClients) {
      if (c.socket !== sender && c.socket.readyState === 1) {
        c.socket.send(str);
      }
    }
  };

  if (canWrite) {
    broadcast({ type: 'system', message: `${username} joined the ashram` });
  }

  server.addEventListener('message', async (event) => {
    try {
      const data = JSON.parse(event.data as string);
      
      if (data.type === 'chat' && ctx.canWrite && data.message?.trim()) {
        const msgId = crypto.randomUUID();
        const msgTime = Date.now();
        const msgPayload: ChatMessage = { 
          type: 'chat', 
          id: msgId, 
          username, 
          message: data.message.trim(), 
          createdAt: msgTime 
        };
        
        // Broadcast instantly
        for (const c of activeClients) {
           if (c.socket.readyState === 1) {
              c.socket.send(JSON.stringify(msgPayload));
           }
        }

        // Persist
        env.DB.prepare(
          `INSERT INTO live_chat (id, username, message, createdAt) VALUES (?, ?, ?, ?)`
        ).bind(msgId, username, msgPayload.message, msgTime).run().catch(console.error);
        
      } else if (data.type === 'typing' && ctx.canWrite) {
        broadcast({ type: 'typing', username, isTyping: !!data.isTyping }, server);
      } else if (data.type === 'delete' && ctx.canWrite && data.id) {
        // Enforce 30-sec delete rule
        const msgId = data.id;
        const msgRecord = await env.DB.prepare(`SELECT * FROM live_chat WHERE id = ?`).bind(msgId).first();
        if (msgRecord && msgRecord.username === username) {
            const age = Date.now() - (msgRecord.createdAt as number);
            if (age <= 30000) { // 30 seconds
                await env.DB.prepare(`DELETE FROM live_chat WHERE id = ?`).bind(msgId).run();
                const dData = { type: 'delete', id: msgId };
                for (const c of activeClients) {
                    if (c.socket.readyState === 1) {
                        c.socket.send(JSON.stringify(dData));
                    }
                }
            }
        }
      }
    } catch (e) {}
  });

  server.addEventListener('close', () => {
    activeClients.delete(ctx);
    if (ctx.canWrite) {
      broadcast({ type: 'system', message: `${username} left the ashram` });
    }
  });

  return new Response(null, { status: 101, webSocket: client });
}
