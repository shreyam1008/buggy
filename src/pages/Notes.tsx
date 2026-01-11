import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Trash2, Save, X, Tag, Clock } from 'lucide-react';
import { openDB, type IDBPDatabase } from 'idb';
import { Button } from '../components/shared/Button';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  synced: boolean;
}

const DB_NAME = 'notes-db';
const STORE_NAME = 'notes';

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
      }
    },
  });
}

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTags, setEditTags] = useState('');

  const loadNotes = useCallback(async () => {
    try {
      const db = await getDB();
      const allNotes = await db.getAll(STORE_NAME);
      setNotes(allNotes.sort((a, b) => b.updatedAt - a.updatedAt));
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const saveNote = async (note: Note) => {
    try {
      const db = await getDB();
      await db.put(STORE_NAME, note);
      await loadNotes();
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const db = await getDB();
      await db.delete(STORE_NAME, id);
      await loadNotes();
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const createNewNote = () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: 'Untitled Note',
      content: '',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      synced: false,
    };
    setSelectedNote(newNote);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    setEditTags('');
    setIsEditing(true);
  };

  const startEditing = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTags(note.tags.join(', '));
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!selectedNote) return;
    
    const updatedNote: Note = {
      ...selectedNote,
      title: editTitle || 'Untitled Note',
      content: editContent,
      tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
      updatedAt: Date.now(),
      synced: false,
    };
    
    await saveNote(updatedNote);
    setSelectedNote(updatedNote);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    if (selectedNote && !notes.find(n => n.id === selectedNote.id)) {
      setSelectedNote(null);
    }
    setIsEditing(false);
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ maxWidth: '1000px' }}
    >
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Notes</h1>
          <p className="page-subtitle">Your notes, stored locally & synced</p>
        </div>
        <Button variant="primary" onClick={createNewNote}>
          <Plus size={18} /> New Note
        </Button>
      </div>

      <div className="input-group" style={{ marginBottom: '1.5rem' }}>
        <div className="input-wrapper">
          <div className="input-icon"><Search size={18} /></div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="input input-with-icon"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isEditing && selectedNote ? (
          <motion.div
            key="editor"
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title">{selectedNote.createdAt === selectedNote.updatedAt ? 'New Note' : 'Edit Note'}</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="ghost" size="sm" onClick={cancelEdit}>
                  <X size={16} /> Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSave}>
                  <Save size={16} /> Save
                </Button>
              </div>
            </div>
            <div className="card-content">
              <div className="input-group">
                <label className="label">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Note title..."
                  className="input"
                  autoFocus
                />
              </div>
              
              <div className="input-group">
                <label className="label">Content</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Write your note..."
                  className="input"
                  style={{ minHeight: '200px', resize: 'vertical' }}
                />
              </div>

              <div className="input-group">
                <label className="label"><Tag size={14} style={{ marginRight: '0.25rem' }} />Tags (comma separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  placeholder="tag1, tag2, tag3"
                  className="input"
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {filteredNotes.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>
                  {notes.length === 0 ? 'No notes yet. Create your first note!' : 'No notes match your search.'}
                </p>
                {notes.length === 0 && (
                  <Button variant="primary" onClick={createNewNote}>
                    <Plus size={18} /> Create Note
                  </Button>
                )}
              </div>
            ) : (
              <div className="notes-grid">
                {filteredNotes.map((note) => (
                  <motion.div
                    key={note.id}
                    className="note-card"
                    onClick={() => startEditing(note)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    layout
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 className="note-title">{note.title}</h4>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '0.25rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="note-preview">{note.content || 'No content'}</p>
                    
                    {note.tags.length > 0 && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        {note.tags.slice(0, 3).map((tag, i) => (
                          <span key={i} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                    
                    <div className="note-meta">
                      <Clock size={12} style={{ marginRight: '0.25rem' }} />
                      {formatDate(note.updatedAt)}
                      {!note.synced && <span style={{ marginLeft: '0.5rem', color: '#fbbf24' }}>• Unsynced</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
        {notes.length} notes stored locally
      </div>
    </motion.div>
  );
}
