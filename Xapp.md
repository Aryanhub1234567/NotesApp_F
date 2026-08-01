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





//vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})



{/* Title with truncation so it doesn't break the layout */}
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">
              {activeCollection === null ? 'All Notes' :
               activeCollection === 'uncategorized' ? 'Uncategorized' :
               collections.find(c => c._id === activeCollection)?.name || 'Notes'}
            </h1>
          </div>



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
