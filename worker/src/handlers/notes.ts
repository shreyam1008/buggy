import { Env } from '../index';
import { json, error } from '../utils/response';

// Safely normalize tags — D1 stores as JSON string, client sends as array
function parseTags(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }
  return [];
}

export async function handleNotesSync(env: Env, req: Request) {
  try {
    const { notes } = await req.json() as { notes: any[] };
    if (!Array.isArray(notes)) {
      return error('Invalid payload', req);
    }

    // Single query — fetch only needed columns
    const { results: remoteNotes } = await env.DB.prepare(
      `SELECT id, title, content, tags, createdAt, updatedAt FROM notes`
    ).all();

    // Build merged map in a single pass from remote notes
    const merged = new Map<string, any>();
    for (const r of remoteNotes) {
      merged.set(r.id as string, {
        id: r.id, title: r.title, content: r.content,
        tags: parseTags(r.tags), createdAt: r.createdAt, updatedAt: r.updatedAt,
      });
    }

    // Resolve conflicts — local wins if newer
    const upserts: any[] = [];
    for (const local of notes) {
      const tags = parseTags(local.tags);
      const remote = merged.get(local.id);
      if (!remote || local.updatedAt > remote.updatedAt) {
        const clean = {
          id: local.id, title: local.title, content: local.content,
          tags, createdAt: local.createdAt, updatedAt: local.updatedAt,
        };
        merged.set(local.id, clean);
        upserts.push(clean);
      }
    }

    // Batch write only changed notes
    if (upserts.length > 0) {
      await env.DB.batch(
        upserts.map(n =>
          env.DB.prepare(
            `INSERT INTO notes (id, title, content, tags, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
               title=excluded.title, content=excluded.content,
               tags=excluded.tags, updatedAt=excluded.updatedAt`
          ).bind(n.id, n.title, n.content, JSON.stringify(n.tags), n.createdAt, n.updatedAt)
        )
      );
    }

    return json({ notes: Array.from(merged.values()) }, req);

  } catch (err: any) {
    return error(err.message, req, 500);
  }
}
