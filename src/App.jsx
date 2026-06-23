import React, { useState, useEffect } from 'react';
import {
  Clipboard, Check, Trash2, Edit, Plus, Folder,
  FolderOpen, LogOut, FileText, X, Menu, Maximize2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// --- CONFIGURATION ---
// Change this if your backend runs on a different port (e.g., 5000)
const API_BASE_URL = 'https://notesapp-backend-80vm.onrender.com/api/v1';
const AUTH_URL = `${API_BASE_URL}/auth`;
const NOTES_URL = `${API_BASE_URL}/notes`;
const COLLECTIONS_URL = `${API_BASE_URL}/collections`;

// --- UTILITIES ---
const formatTimestamp = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;

  const elapsed = now - past;

  if (elapsed < msPerMinute) return 'Just now';
  if (elapsed < msPerHour) return Math.round(elapsed / msPerMinute) + 'm ago';
  if (elapsed < msPerDay) return Math.round(elapsed / msPerHour) + 'h ago';
  if (elapsed < msPerDay * 7) return Math.round(elapsed / msPerDay) + 'd ago';

  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// --- COMPONENTS ---

const NoteCard = ({ note, onEdit, onDelete, onView }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800 line-clamp-1">{note.title}</h3>
        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
          {formatTimestamp(note.createdAt)}
        </span>
      </div>

      {/* REVERTED: Standard, non-clickable text area */}
      <div className="flex-grow">
        <p className="text-gray-600 text-sm whitespace-pre-wrap line-clamp-4 group-hover:text-gray-800 transition-colors">
          {note.content}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          {copied ? <Check size={16} className="text-green-500" /> : <Clipboard size={16} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        <div className="flex gap-2">
          {/* THE EXPAND BUTTON: This is now the only way to open the viewer */}
          <button onClick={() => onView(note)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors" title="Read Note">
            <Maximize2 size={16} />
          </button>

          <button onClick={() => onEdit(note)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit Note">
            <Edit size={16} />
          </button>
          <button onClick={() => onDelete(note._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete Note">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? `${AUTH_URL}/login` : `${AUTH_URL}/register`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      onLogin(data.token, data.data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <FileText size={24} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h2>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email" required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password" required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-medium hover:underline">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default function App() {

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState(null);

  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const [notes, setNotes] = useState([]);
  const [collections, setCollections] = useState([]);
  const [activeCollection, setActiveCollection] = useState(null); // null = all notes

  // Note Form State
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);

  // Collection Form State
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showColForm, setShowColForm] = useState(false);

  // --- API HELPERS ---
  const fetchOptions = (method = 'GET', body = null) => ({
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : null
  });

const loadData = async () => {
    try {
      // 1. Fetch Collections
      const colRes = await fetch(COLLECTIONS_URL, fetchOptions());
      if (colRes.ok) {
        const colData = await colRes.json();
        // Safely extract the array whether it's wrapped in an object or sent directly
        const extractedCols = Array.isArray(colData) ? colData : (colData.data || []);
        setCollections(extractedCols);
      } else {
        console.error("Collection Fetch Error:", await colRes.text());
      }

      // 2. Fetch Notes
      let url = NOTES_URL;
      if (activeCollection && activeCollection !== 'uncategorized') {
        url += `?collectionId=${activeCollection}`;
      } else if (activeCollection === 'uncategorized') {
        url += `?collectionId=null`; // Ensure backend receives 'null' string
      }

      const noteRes = await fetch(url, fetchOptions());
      if (noteRes.ok) {
        const noteData = await noteRes.json();
        // Safely extract the array whether it's wrapped in an object or sent directly
        const extractedNotes = Array.isArray(noteData) ? noteData : (noteData.data || []);
        setNotes(extractedNotes);
      } else {
        console.error("Notes Fetch Error:", await noteRes.text());
      }
    } catch (err) {
      console.error("Network error while loading data:", err);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token, activeCollection]);

  // --- ACTIONS ---
  const handleLogin = (newToken, userData) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    const payload = {
      title: noteTitle,
      content: noteContent,
      collectionId: activeCollection !== 'uncategorized' ? activeCollection : null
    };

    try {
      if (editingNoteId) {
        await fetch(`${NOTES_URL}/${editingNoteId}`, fetchOptions('PUT', payload));
      } else {
        await fetch(NOTES_URL, fetchOptions('POST', payload));
      }
      setShowNoteForm(false);
      setNoteTitle('');
      setNoteContent('');
      setEditingNoteId(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (id) => {
    if (window.confirm('Delete this note?')) {
      await fetch(`${NOTES_URL}/${id}`, fetchOptions('DELETE'));
      loadData();
    }
  };

  const openEditNote = (note) => {
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setEditingNoteId(note._id);
    setShowNoteForm(true);
  };

  const handleAddCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    try {
      await fetch(COLLECTIONS_URL, fetchOptions('POST', { name: newCollectionName }));
      setNewCollectionName('');
      setShowColForm(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCollection = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Delete collection? Notes will be moved to Uncategorized.')) {
      await fetch(`${COLLECTIONS_URL}/${id}`, fetchOptions('DELETE'));
      if (activeCollection === id) setActiveCollection(null);
      loadData();
    }
  };

  // --- RENDERING ---
  if (!token) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="flex h-screen bg-white font-sans text-gray-800 overflow-hidden">

      {/* NEW: Dark Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* UPDATED SIDEBAR: Added absolute positioning and slide animations */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-50 border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded text-white flex items-center justify-center">
            <FileText size={18} />
          </div>
          <span className="font-semibold text-lg">My Notes</span>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-2">Views</div>

          <button
            onClick={() => setActiveCollection(null)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${activeCollection === null ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <FolderOpen size={18} /> All Notes
          </button>
          <button
            onClick={() => setActiveCollection('uncategorized')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${activeCollection === 'uncategorized' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Folder size={18} /> Uncategorized
          </button>

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6 flex justify-between items-center">
            Collections
            <button onClick={() => setShowColForm(!showColForm)} className="hover:text-blue-600 p-1">
              <Plus size={14} />
            </button>
          </div>

          {showColForm && (
            <form onSubmit={handleAddCollection} className="mb-2">
              <input
                autoFocus type="text" placeholder="Folder name..."
                className="w-full text-sm p-2 border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={newCollectionName} onChange={e => setNewCollectionName(e.target.value)}
                onBlur={() => setShowColForm(false)}
              />
            </form>
          )}

          {collections.map(col => (
            <div
              key={col._id}
              onClick={() => setActiveCollection(col._id)}
              className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition ${activeCollection === col._id ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <div className="flex items-center gap-3 truncate">
                <Folder size={18} className={activeCollection === col._id ? 'text-blue-600' : 'text-gray-400'} />
                <span className="truncate">{col.name}</span>
              </div>
              <button
                onClick={(e) => handleDeleteCollection(col._id, e)}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="truncate font-medium">{user?.email}</span>
            <button onClick={handleLogout} className="p-1.5 hover:bg-gray-200 rounded text-gray-500 hover:text-red-600 transition">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen relative bg-[#fcfcfc] min-w-0">

        {/* UPDATED HEADER */}
        <header className="px-4 md:px-8 py-4 md:py-6 border-b border-gray-100 flex justify-between items-center bg-white gap-4">

          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Title with truncation so it doesn't break the layout */}
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">
              {activeCollection === null ? 'All Notes' :
               activeCollection === 'uncategorized' ? 'Uncategorized' :
               collections.find(c => c._id === activeCollection)?.name || 'Notes'}
            </h1>
          </div>

          {/* New Note Button protected from shrinking */}
          <button
            onClick={() => {
              setNoteTitle(''); setNoteContent(''); setEditingNoteId(null); setShowNoteForm(true);
            }}
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition shadow-sm text-sm md:text-base"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Note</span>
          </button>
        </header>

        {/* Note Grid */}
        <div className="flex-1 overflow-y-auto p-8">
          {notes.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-20">
               <FileText size={48} className="mb-4 opacity-50" />
               <p>No notes found in this view.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map(note => (
                <NoteCard
                  key={note._id}
                  note={note}
                  onEdit={openEditNote}
                  onDelete={handleDeleteNote}
                  onView={setViewingNote}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create/Edit Modal overlay */}
        {showNoteForm && (
          <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingNoteId ? 'Edit Note' : 'Create Note'}
                </h2>
                <button onClick={() => setShowNoteForm(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSaveNote} className="p-6 flex flex-col flex-grow">
                <input
                  type="text" required placeholder="Note Title"
                  className="w-full text-xl font-semibold mb-4 outline-none placeholder-gray-300"
                  value={noteTitle} onChange={e => setNoteTitle(e.target.value)}
                />
                <textarea
                  required placeholder="Start writing..."
                  className="w-full flex-grow resize-none outline-none text-gray-600 mb-6 placeholder-gray-300 min-h-[200px]"
                  value={noteContent} onChange={e => setNoteContent(e.target.value)}
                />
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setShowNoteForm(false)} className="px-5 py-2 rounded-lg text-gray-600 font-medium hover:bg-gray-100 transition">
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
                    Save Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 👇 THIS IS WHERE THE NEW MODAL GOES 👇 */}
        {/* View Note Modal Overlay */}
        {viewingNote && (
          <div
            className="absolute inset-0 bg-gray-900/40 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
            onClick={() => setViewingNote(null)}
          >
            <div
              className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 break-words pr-4">{viewingNote.title}</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    {viewingNote.createdAt ? formatTimestamp(viewingNote.createdAt) : ''}
                  </p>
                </div>
                <button onClick={() => setViewingNote(null)} className="text-gray-400 hover:text-gray-600 shrink-0 p-1 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                <div className="prose prose-blue prose-sm md:prose-base max-w-none text-gray-700">
                  <ReactMarkdown>{viewingNote.content}</ReactMarkdown>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
                 <button
                   onClick={() => {
                     setViewingNote(null);
                     openEditNote(viewingNote);
                   }}
                   className="px-4 py-2 flex items-center gap-2 rounded-lg text-blue-600 font-medium hover:bg-blue-100 transition"
                 >
                   <Edit size={16} /> Edit Note
                 </button>
                 <button onClick={() => setViewingNote(null)} className="px-5 py-2 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-900 transition">
                   Close
                 </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
