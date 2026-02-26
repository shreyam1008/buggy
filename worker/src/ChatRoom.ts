import { DurableObject } from 'cloudflare:workers';

interface Env {
  CHAT_ROOM: DurableObjectNamespace<ChatRoom>;
}

interface Attachment {
  username: string;
  canWrite: boolean;
}

const KRISHNA_NAMES = [
  'Govinda', 'Madhava', 'Keshava', 'Gopala', 'Murari', 'Vasudeva',
  'Damodara', 'Achyuta', 'Hari', 'Shyam', 'Giridhari', 'Muralidhar',
  'Nandakishor', 'Devakinandan', 'Jagannath', 'Dwarkadhish',
  'Banke', 'Mohan', 'Manohara', 'Radheshyam',
];

function generateUsername(): string {
  const name = KRISHNA_NAMES[Math.floor(Math.random() * KRISHNA_NAMES.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${name}_${num}`;
}

export class ChatRoom extends DurableObject<Env> {

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    // Create chat table in DO's colocated SQLite (runs once, idempotent)
    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        message TEXT NOT NULL,
        createdAt INTEGER NOT NULL
      )
    `);
  }

  // ─── Helpers ────────────────────────────────────────────

  private getAttachment(ws: WebSocket): Attachment | null {
    return ws.deserializeAttachment() as Attachment | null;
  }

  private getSockets(): WebSocket[] {
    return this.ctx.getWebSockets();
  }

  private countWriters(): number {
    let n = 0;
    for (const ws of this.getSockets()) {
      const a = this.getAttachment(ws);
      if (a?.canWrite) n++;
    }
    return n;
  }

  private isNameTaken(name: string): boolean {
    for (const ws of this.getSockets()) {
      const a = this.getAttachment(ws);
      if (a?.username === name) return true;
    }
    return false;
  }

  private broadcast(data: unknown, exclude?: WebSocket): void {
    const str = JSON.stringify(data);
    for (const ws of this.getSockets()) {
      if (ws !== exclude) {
        try { ws.send(str); } catch { /* dead */ }
      }
    }
  }

  private broadcastAll(str: string): void {
    for (const ws of this.getSockets()) {
      try { ws.send(str); } catch { /* dead */ }
    }
  }

  // ─── WebSocket lifecycle ────────────────────────────────

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected Upgrade: websocket', { status: 426 });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    // Resolve username
    const url = new URL(request.url);
    const requested = url.searchParams.get('name');
    let username: string;
    if (requested && /^[A-Za-z]+_\d{3}$/.test(requested) && !this.isNameTaken(requested)) {
      username = requested;
    } else {
      username = generateUsername();
      let attempts = 0;
      while (this.isNameTaken(username) && attempts++ < 5) username = generateUsername();
    }

    // Max 10 writers
    const canWrite = this.countWriters() < 10;

    // Accept via Hibernation API
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ username, canWrite } satisfies Attachment);

    // Welcome
    server.send(JSON.stringify({ type: 'welcome', username, canWrite }));

    // Load recent history from DO's colocated SQLite
    const rows = this.ctx.storage.sql.exec(
      `SELECT id, username, message, createdAt FROM messages ORDER BY createdAt DESC LIMIT 31`
    ).toArray();
    const hasMore = rows.length > 30;
    const msgs = (hasMore ? rows.slice(0, 30) : rows).reverse();
    server.send(JSON.stringify({ type: 'history', messages: msgs, hasMore }));

    if (canWrite) {
      this.broadcast({ type: 'system', message: `🙏 ${username} joined the ashram` }, server);
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void> {
    if (typeof message !== 'string') return;
    const a = this.getAttachment(ws);
    if (!a) return;

    try {
      const data = JSON.parse(message);
      const { username, canWrite } = a;

      if (data.type === 'chat' && canWrite && data.message?.trim()) {
        const id = crypto.randomUUID();
        const createdAt = Date.now();
        const msg = data.message.trim().slice(0, 500);

        // Persist in DO's colocated SQLite (synchronous, zero-latency)
        this.ctx.storage.sql.exec(
          `INSERT INTO messages (id, username, message, createdAt) VALUES (?, ?, ?, ?)`,
          id, username, msg, createdAt
        );

        this.broadcastAll(JSON.stringify({
          type: 'chat', id, username, message: msg, createdAt,
        }));

      } else if (data.type === 'typing' && canWrite) {
        this.broadcast({ type: 'typing', username, isTyping: !!data.isTyping }, ws);

      } else if (data.type === 'delete' && canWrite && data.id) {
        const row = this.ctx.storage.sql.exec(
          `SELECT username, createdAt FROM messages WHERE id = ?`, data.id
        ).toArray()[0];

        if (row && row.username === username) {
          const age = Date.now() - (row.createdAt as number);
          if (age <= 30000) {
            this.ctx.storage.sql.exec(`DELETE FROM messages WHERE id = ?`, data.id);
            this.broadcastAll(JSON.stringify({ type: 'delete', id: data.id }));
          }
        }

      } else if (data.type === 'loadMore' && typeof data.before === 'number') {
        const rows = this.ctx.storage.sql.exec(
          `SELECT id, username, message, createdAt FROM messages WHERE createdAt < ? ORDER BY createdAt DESC LIMIT 31`,
          data.before
        ).toArray();
        const hasMore = rows.length > 30;
        const msgs = (hasMore ? rows.slice(0, 30) : rows).reverse();
        ws.send(JSON.stringify({ type: 'history', messages: msgs, hasMore }));
      }
    } catch { /* malformed JSON */ }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string, _wasClean: boolean): Promise<void> {
    const a = this.getAttachment(ws);
    if (a?.canWrite) {
      this.broadcast({ type: 'system', message: `${a.username} left the ashram` });
    }
    ws.close(code, reason);
  }

  async webSocketError(ws: WebSocket, _error: unknown): Promise<void> {
    const a = this.getAttachment(ws);
    if (a?.canWrite) {
      this.broadcast({ type: 'system', message: `${a.username} left the ashram` });
    }
    ws.close(1011, 'WebSocket error');
  }
}
