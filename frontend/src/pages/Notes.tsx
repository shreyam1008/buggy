import { useState, useEffect, useCallback } from 'react';
import { SQLocal } from 'sqlocal';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  synced: boolean;
}

const sql = new SQLocal('notes-db.sqlite3');

async function initDB() {
  await sql.sql`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    )
  `;
}

async function loadAllNotes(): Promise<Note[]> {
  const result = await sql.sql`SELECT * FROM notes ORDER BY updatedAt DESC`;
  // result is an array of plain objects matching the table
  return result.map((r: any) => ({
    ...r,
    tags: JSON.parse(r.tags),
    synced: Boolean(r.synced),
  }));
}

async function saveNote(note: Note): Promise<void> {
  const tagsStr = JSON.stringify(note.tags);
  const syncedInt = note.synced ? 1 : 0;
  
  await sql.sql`
    INSERT INTO notes (id, title, content, tags, createdAt, updatedAt, synced)
    VALUES (${note.id}, ${note.title}, ${note.content}, ${tagsStr}, ${note.createdAt}, ${note.updatedAt}, ${syncedInt})
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      content = excluded.content,
      tags = excluded.tags,
      updatedAt = excluded.updatedAt,
      synced = excluded.synced
  `;
}

async function deleteNoteFromDB(id: string): Promise<void> {
  await sql.sql`DELETE FROM notes WHERE id = ${id}`;
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selected, setSelected] = useState<Note | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [search, setSearch] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(
    localStorage.getItem('notes-last-synced')
  );

  const loadNotes = useCallback(async () => {
    setNotes(await loadAllNotes());
  }, []);

  useEffect(() => {
    initDB().then(loadNotes);
  }, [loadNotes]);

  const createNote = () => {
    const note: Note = {
      id: crypto.randomUUID(), title: 'Untitled Note', content: '',
      tags: [], createdAt: Date.now(), updatedAt: Date.now(), synced: false,
    };
    setSelected(note); setTitle(note.title); setContent(''); setTags(''); setEditing(true);
  };

  const startEdit = (note: Note) => {
    setSelected(note); setTitle(note.title); setContent(note.content);
    setTags(note.tags.join(', ')); setEditing(true);
  };

  const handleSave = async () => {
    if (!selected) return;
    const updated: Note = {
      ...selected, title: title || 'Untitled Note', content,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      updatedAt: Date.now(), synced: false,
    };
    await saveNote(updated); setSelected(updated); setEditing(false); await loadNotes();
  };

  const cancelEdit = () => {
    if (selected && !notes.find((n) => n.id === selected.id)) setSelected(null);
    setEditing(false);
  };

  const handleDelete = async (id: string) => {
    await deleteNoteFromDB(id); await loadNotes();
    if (selected?.id === id) { setSelected(null); setEditing(false); }
  };

  const syncToCloud = async () => {
    const baseUrl = (import.meta.env.VITE_API_URL as string)?.replace(/\/$/, '');
    
    if (!baseUrl) {
      alert('VITE_API_URL is not configured. Please add it to your .env file or Cloudflare Pages environment variables.');
      return;
    }

    setSyncing(true);
    try {
      const local = await loadAllNotes();
      
      const res = await fetch(`${baseUrl}/api/notes/sync`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: local }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      
      const { notes: merged } = await res.json() as { notes: Note[] };
      
      await sql.transaction(async (tx) => {
        for (const note of merged) {
          const tagsStr = JSON.stringify(note.tags);
          tx.sql`
            INSERT INTO notes (id, title, content, tags, createdAt, updatedAt, synced)
            VALUES (${note.id}, ${note.title}, ${note.content}, ${tagsStr}, ${note.createdAt}, ${note.updatedAt}, 1)
            ON CONFLICT(id) DO UPDATE SET
              title = excluded.title, content = excluded.content, tags = excluded.tags,
              updatedAt = excluded.updatedAt, synced = 1
          `;
        }
      });

      await loadNotes();
      const now = new Date().toLocaleString();
      localStorage.setItem('notes-last-synced', now);
      setLastSynced(now);
    } catch (e) {
      console.error('Sync error:', e);
      alert(`Sync Failed: ${(e as Error).message}\nMake sure your Cloudflare Worker is deployed and running.`);
    } finally { 
      setSyncing(false); 
    }
  };

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-3xl mx-auto pt-12 lg:pt-0">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Notes</h1>
          <p className="text-sm text-slate-400">Local SQLite (OPFS) · Sync to Cloudflare D1</p>
        </div>
        <div className="flex gap-2">
          <button onClick={syncToCloud} disabled={syncing}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-50 transition cursor-pointer">
            {syncing ? '⏳' : '☁️'} Sync
          </button>
          <button onClick={createNote}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition cursor-pointer">
            ＋ New
          </button>
        </div>
      </div>

      {lastSynced && <p className="text-xs text-slate-600 mb-3">Last synced: {lastSynced}</p>}

      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 Search notes…"
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-red-600 mb-4 transition" />

      {editing && selected ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-sm">{selected.createdAt === selected.updatedAt ? 'New Note' : 'Edit Note'}</h3>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title…" autoFocus
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-red-600 transition" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your note…" rows={8}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-red-600 resize-y transition" />
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-red-600 transition" />
          <div className="flex gap-2">
            <button onClick={handleSave} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition cursor-pointer">💾 Save</button>
            <button onClick={cancelEdit} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-700 transition cursor-pointer">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-400">{notes.length === 0 ? 'No notes yet.' : 'No results.'}</p>
              {notes.length === 0 && (
                <button onClick={createNote} className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition cursor-pointer">＋ Create Note</button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {filtered.map((note) => (
                <div key={note.id} onClick={() => startEdit(note)}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-slate-600 transition group">
                  <div className="flex items-start justify-between mb-2">
                    <strong className="text-sm">{note.title}</strong>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                      className="text-slate-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100 cursor-pointer">🗑</button>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-3 mb-2">{note.content || 'No content'}</p>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {note.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">{t}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-600">
                    {fmtDate(note.updatedAt)}
                    {!note.synced && <span className="text-amber-500"> · Unsynced</span>}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <p className="text-center text-xs text-slate-600 mt-6">{notes.length} notes stored locally via SQLite</p>
    </div>
  );
}
