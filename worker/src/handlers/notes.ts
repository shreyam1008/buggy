import { Env } from '../index';
import { json, error } from '../utils/response';

export async function handleNotesSync(env: Env, req: Request) {
  try {
    const { notes } = await req.json() as { notes: any[] };
    if (!Array.isArray(notes)) {
      return error('Invalid payload', req);
    }

    const { results } = await env.DB.prepare(
      `SELECT * FROM notes`
    ).all();
    const remoteNotes = results as any[];

    const remoteMap = new Map(remoteNotes.map(n => [n.id, n]));
    const mergedMap = new Map();

    // 1. Add all remote notes initially
    for (const remote of remoteNotes) {
      mergedMap.set(remote.id, remote);
    }

    // 2. Resolve conflicts with incoming local notes
    const toInsertOrUpdate = [];
    for (const local of notes) {
      const remote = remoteMap.get(local.id);
      if (!remote || local.updatedAt > remote.updatedAt) {
        mergedMap.set(local.id, local);
        toInsertOrUpdate.push(local);
      }
    }

    // 3. Batch DB updates for the winning local notes
    if (toInsertOrUpdate.length > 0) {
      const stmts = toInsertOrUpdate.map(n => 
        env.DB.prepare(
          `INSERT INTO notes (id, title, content, tags, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             title=excluded.title,
             content=excluded.content,
             tags=excluded.tags,
             updatedAt=excluded.updatedAt`
        ).bind(
          n.id, n.title, n.content, JSON.stringify(n.tags), n.createdAt, n.updatedAt
        )
      );
      await env.DB.batch(stmts);
    }

    // Return the absolute source of truth back to the client
    return json({ notes: Array.from(mergedMap.values()) }, req);

  } catch (err: any) {
    return error(err.message, req, 500);
  }
}
