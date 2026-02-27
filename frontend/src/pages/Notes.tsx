import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

// Safely parse tags — handles string, array, or unexpected values
function parseTags(raw: any): string[] {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try { const parsed = JSON.parse(raw); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
  }
  return [];
}

async function loadAllNotes(): Promise<Note[]> {
  const result = await sql.sql`SELECT * FROM notes ORDER BY updatedAt DESC`;
  // result is an array of plain objects matching the table
  return result.map((r: any) => ({
    ...r,
    tags: parseTags(r.tags),
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
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Note | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [search, setSearch] = useState('');
  const [lastSynced, setLastSynced] = useState<string | null>(
    localStorage.getItem('notes-last-synced')
  );

  // Initialize DB once
  const { isPending: dbInitializing } = useQuery({
    queryKey: ['db-init'],
    queryFn: async () => { await initDB(); return true; },
    staleTime: Infinity,
  });

  const { data: notes = [] } = useQuery({
    queryKey: ['notes'],
    queryFn: loadAllNotes,
    enabled: !dbInitializing,
  });

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

  const saveMutation = useMutation({
    mutationFn: saveNote,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  });

  const handleSave = () => {
    if (!selected) return;
    const updated: Note = {
      ...selected, title: title || 'Untitled Note', content,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      updatedAt: Date.now(), synced: false,
    };
    saveMutation.mutate(updated, {
      onSuccess: () => { setSelected(updated); setEditing(false); }
    });
  };

  const cancelEdit = () => {
    if (selected && !notes.find((n) => n.id === selected.id)) setSelected(null);
    setEditing(false);
  };

  const deleteMutation = useMutation({
    mutationFn: deleteNoteFromDB,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        if (selected?.id === id) { setSelected(null); setEditing(false); }
      }
    });
  };

  const syncMutation = useMutation({
    mutationFn: async () => {
      const baseUrl = (import.meta.env.VITE_API_URL as string)?.replace(/\/$/, '');
      if (!baseUrl) throw new Error('VITE_API_URL is not configured.');

      const local = await loadAllNotes();
      const res = await fetch(`${baseUrl}/api/notes/sync`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: local }),
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      
      const { notes: merged } = await res.json() as { notes: Note[] };
      return merged;
    },
    onSuccess: async (merged) => {
      await sql.transaction(async (tx) => {
        for (const note of merged) {
          const tags = parseTags(note.tags);
          const tagsStr = JSON.stringify(tags);
          await tx.sql`
            INSERT INTO notes (id, title, content, tags, createdAt, updatedAt, synced)
            VALUES (${note.id}, ${note.title}, ${note.content}, ${tagsStr}, ${note.createdAt}, ${note.updatedAt}, 1)
            ON CONFLICT(id) DO UPDATE SET
              title = excluded.title, content = excluded.content, tags = excluded.tags,
              updatedAt = excluded.updatedAt, synced = 1
          `;
        }
      });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      const now = new Date().toLocaleString();
      localStorage.setItem('notes-last-synced', now);
      setLastSynced(now);
    },
    onError: (error: Error) => {
      alert(`Sync Failed: ${error.message}\nMake sure your Cloudflare Worker is deployed and running.`);
    }
  });

  // Auto-sync on mount if empty and hasn't synced recently
  useEffect(() => {
    if (dbInitializing) return;
    if (notes.length === 0 && !lastSynced && !syncMutation.isPending) {
      syncMutation.mutate();
    }
  }, [dbInitializing, notes.length, lastSynced, syncMutation]);

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    n.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-3xl mx-auto pt-12 lg:pt-0">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Local SQLite (OPFS) · Sync to Cloudflare D1</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}
            className="px-4 py-2 bg-transparent border-2 border-slate-300 dark:border-slate-700 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-2">
            {syncMutation.isPending ? '⏳ Syncing' : '☁️ Sync'}
          </button>
          <button onClick={createNote}
            className="px-4 py-2 bg-slate-200 hover:bg-white text-slate-900 border-2 border-slate-200 rounded-md text-sm font-bold transition-colors cursor-pointer flex items-center gap-2">
            ＋ New Note
          </button>
        </div>
      </div>

      {lastSynced && <p className="text-xs text-slate-600 mb-3">Last synced: {lastSynced}</p>}

      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search notes…"
        className="w-full bg-transparent border-2 border-slate-300 dark:border-slate-700 rounded-md px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-orange-500 dark:focus:border-slate-400 mb-6 transition-colors" />

      {editing && selected ? (
        <div className="bg-white dark:bg-transparent border-2 border-slate-300 dark:border-slate-700 rounded-md p-5 sm:p-6 space-y-4 mb-6">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 pb-2">{selected.createdAt === selected.updatedAt ? 'New Note' : 'Edit Note'}</h3>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" autoFocus
            className="w-full bg-transparent border-2 border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-base text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-orange-500 dark:focus:border-slate-400 transition-colors font-semibold" />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your note here…" rows={10}
            className="w-full bg-transparent border-2 border-slate-300 dark:border-slate-700 rounded-md px-3 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-orange-500 dark:focus:border-slate-400 resize-y transition-colors font-mono" />
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)"
            className="w-full bg-transparent border-2 border-slate-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 outline-none focus:border-orange-500 dark:focus:border-slate-400 transition-colors" />
          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={handleSave} className="px-5 py-2.5 bg-slate-200 hover:bg-white text-slate-900 border-2 border-slate-200 rounded-md text-sm font-bold transition-colors cursor-pointer">Save Note</button>
            <button onClick={cancelEdit} className="px-5 py-2.5 bg-transparent border-2 border-slate-300 dark:border-slate-700 rounded-md text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          {filtered.length === 0 ? (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center">
              <p className="text-slate-400">{notes.length === 0 ? 'No notes yet.' : 'No results.'}</p>
              {notes.length === 0 && (
                <button onClick={createNote} className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition cursor-pointer">＋ Create Note</button>
              )}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {filtered.map((note) => (
                <div key={note.id} onClick={() => startEdit(note)}
                  className="bg-white dark:bg-transparent border-2 border-slate-200 dark:border-slate-800 rounded-md p-5 cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex flex-col h-full group shadow-sm">
                  <div className="flex items-start justify-between mb-3 gap-2">
                    <strong className="text-base text-slate-800 dark:text-slate-200 font-semibold leading-tight">{note.title}</strong>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(note.id); }}
                      className="text-slate-500 hover:text-red-400 hover:bg-slate-800 p-1.5 rounded-md transition-colors cursor-pointer flex-shrink-0"
                      aria-label="Delete note"
                      title="Delete note">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-1">{note.content || '...'}</p>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {note.tags.slice(0, 3).map((t) => (
                         <span key={t} className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300">{t}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-200 dark:border-slate-800/50">
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                      {fmtDate(note.updatedAt)}
                    </p>
                    {!note.synced && <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Unsynced</span>}
                  </div>
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
