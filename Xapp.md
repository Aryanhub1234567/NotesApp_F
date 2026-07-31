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
