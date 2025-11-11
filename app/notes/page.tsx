'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useBrain } from '@/lib/hooks/useBrain';
import Modal from '@/components/Modal';
import NoteForm from '@/components/NoteForm';
import { Note } from '@/types';

export default function NotesPage() {
  const router = useRouter();
  const { notes, updateNote, deleteNote, isLoading } = useBrain();
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const handleUpdateNote = async (data: any) => {
    if (editingNote) {
      await updateNote(editingNote.id, data);
      setEditingNote(null);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      await deleteNote(id);
    }
  };

  // Strip HTML tags and get plain text preview
  const getTextPreview = (html: string): string => {
    // Remove HTML tags
    const text = html.replace(/<[^>]*>/g, '');
    // Decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  // Calculate categories dynamically from actual notes
  const categories = useMemo(() => {
    const categoryMap = new Map<string, { name: string; count: number; color: string }>();
    const colorMap: Record<string, string> = {
      Work: 'bg-blue-100 text-blue-700',
      Learning: 'bg-purple-100 text-purple-700',
      Personal: 'bg-green-100 text-green-700',
      Health: 'bg-orange-100 text-orange-700',
      Ideas: 'bg-pink-100 text-pink-700',
    };

    notes.forEach((note) => {
      const existing = categoryMap.get(note.category);
      if (existing) {
        existing.count++;
      } else {
        categoryMap.set(note.category, {
          name: note.category,
          count: 1,
          color: colorMap[note.category] || 'bg-slate-100 text-slate-700',
        });
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count).slice(0, 4);
  }, [notes]);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-3">Notes & Ideas</h1>
          <p className="text-slate-200 text-lg">
            Capture your thoughts, ideas, and insights. Everything you need to remember, organized.
          </p>
        </div>

        {/* Categories */}
        {!isLoading && categories.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Top Categories</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <button
                  key={category.name}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/60 hover:shadow-xl hover:shadow-blue-500/5 transition-all text-left hover:-translate-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-500">{category.count} {category.count === 1 ? 'note' : 'notes'}</p>
                    </div>
                    <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center font-bold`}>
                      {category.count}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Sort */}
        {!isLoading && notes.length > 0 && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white">All Notes</h2>
              <span className="text-sm text-slate-300 font-medium">{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
            </div>
            <div className="flex items-center gap-3">
              <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option className="text-slate-900">Sort by: Recent</option>
                <option className="text-slate-900">Sort by: Oldest</option>
                <option className="text-slate-900">Sort by: Title</option>
                <option className="text-slate-900">Sort by: Category</option>
              </select>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading your notes...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && notes.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-white mb-3">No notes yet</h3>
              <p className="text-slate-300 mb-6">
                Start capturing your thoughts and ideas. Click the + button below to create your first note.
              </p>
              <button
                onClick={() => router.push('/notes/new')}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
              >
                Create Your First Note
              </button>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {!isLoading && notes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  onClick={() => router.push(`/notes/${note.id}`)}
                  className="flex-1 cursor-pointer"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {note.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {note.isPinned && (
                    <span className="text-yellow-500 text-lg">📌</span>
                  )}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingNote(note);
                      }}
                      className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-lg transition-all"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNote(note.id);
                      }}
                      className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <p
                onClick={() => router.push(`/notes/${note.id}`)}
                className="text-sm text-gray-600 mb-4 line-clamp-3 cursor-pointer"
              >
                {getTextPreview(note.content)}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  {note.createdAt instanceof Date
                    ? note.createdAt.toLocaleDateString()
                    : note.createdAt}
                </span>
                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">
                  {note.category}
                </span>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Add Note Button */}
        <button
          onClick={() => router.push('/notes/new')}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all hover:scale-110 flex items-center justify-center text-3xl font-light hover:rotate-90 duration-300 group"
        >
          <span className="group-hover:rotate-[-90deg] transition-transform duration-300">+</span>
        </button>

        {/* Edit Modal */}
        <Modal
          isOpen={!!editingNote}
          onClose={() => {
            setEditingNote(null);
          }}
          title="Edit Note"
        >
          <NoteForm
            note={editingNote || undefined}
            onSubmit={handleUpdateNote}
            onCancel={() => {
              setEditingNote(null);
            }}
          />
        </Modal>
      </div>
    </div>
  );
}
