'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useBrain } from '@/lib/hooks/useBrain';
import Modal from '@/components/Modal';
import NoteForm from '@/components/NoteForm';
import { Note } from '@/types';
import { toast } from 'sonner';

type ViewMode = 'grid' | 'list' | 'kanban';

export default function NotesPage() {
  const router = useRouter();
  const { notes, updateNote, deleteNote, isLoading } = useBrain();
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  const handleUpdateNote = async (data: any) => {
    if (editingNote) {
      try {
        await updateNote(editingNote.id, data);
        setEditingNote(null);
        toast.success('Note updated successfully!');
      } catch (error) {
        toast.error('Failed to update note');
      }
    }
  };

  const handleDeleteNote = async (id: string) => {
    toast.custom((t) => (
      <div className="bg-white rounded-lg shadow-lg p-4 border border-slate-200">
        <p className="text-slate-900 font-medium mb-3">Are you sure you want to delete this note?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t);
              try {
                await deleteNote(id);
                toast.success('Note deleted successfully!');
              } catch (error) {
                toast.error('Failed to delete note');
              }
            }}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t)}
            className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 10000 });
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
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">Notes & Ideas</h1>
          <p className="text-slate-200 text-sm sm:text-base lg:text-lg">
            Capture your thoughts, ideas, and insights. Everything you need to remember, organized.
          </p>
        </div>

        {/* Categories */}
        {!isLoading && categories.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">Top Categories</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {categories.map((category) => (
                <button
                  key={category.name}
                  className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-200/60 hover:shadow-xl hover:shadow-blue-500/5 transition-all text-left hover:-translate-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{category.name}</p>
                      <p className="text-xs sm:text-sm text-gray-500">{category.count} {category.count === 1 ? 'note' : 'notes'}</p>
                    </div>
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 ${category.color} rounded-lg flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0`}>
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
          <div className="space-y-4 mb-6">
            {/* Mobile: Stack vertically */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white">All Notes</h2>
                <span className="text-xs sm:text-sm text-slate-300 font-medium px-2 py-1 bg-white/10 rounded-lg">
                  {notes.length}
                </span>
              </div>

              {/* Desktop: Right side controls */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-0.5 sm:gap-1 bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl p-0.5 sm:p-1 border border-slate-200/60 shadow-sm">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    title="Grid View"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    title="List View"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg transition-all ${
                      viewMode === 'kanban'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    title="Kanban View"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
                  </button>
                </div>

                <select className="px-2 py-1.5 sm:px-4 sm:py-2 border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm">
                  <option className="text-slate-900">Recent</option>
                  <option className="text-slate-900">Oldest</option>
                  <option className="text-slate-900">Title</option>
                  <option className="text-slate-900">Category</option>
                </select>
                <button className="p-1.5 sm:p-2 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 bg-white shadow-sm transition-all">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-3 sm:mb-4"></div>
              <p className="text-white text-base sm:text-lg">Loading your notes...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && notes.length === 0 && (
          <div className="flex items-center justify-center py-12 sm:py-20 px-4">
            <div className="text-center max-w-md">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">📝</div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">No notes yet</h3>
              <p className="text-slate-300 text-sm sm:text-base mb-5 sm:mb-6">
                Start capturing your thoughts and ideas. Click the + button below to create your first note.
              </p>
              <button
                onClick={() => router.push('/notes/new')}
                className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg sm:rounded-xl font-medium text-sm sm:text-base hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
              >
                Create Your First Note
              </button>
            </div>
          </div>
        )}

        {/* Notes Views */}
        {!isLoading && notes.length > 0 && (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 animate-in fade-in duration-300">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/60 p-5 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group hover:-translate-y-1 cursor-pointer"
                    onClick={() => router.push(`/notes/${note.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors flex-1 line-clamp-2">
                        {note.title}
                      </h3>
                      {note.isPinned && (
                        <span className="text-yellow-500 text-base ml-2">📌</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {getTextPreview(note.content)}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {note.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md whitespace-nowrap"
                        >
                          #{tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md">
                          +{note.tags.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {note.createdAt instanceof Date
                          ? note.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : note.createdAt}
                      </span>
                      <span className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs rounded-lg font-semibold">
                        {note.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-2 sm:space-y-3 animate-in fade-in duration-300">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white/90 backdrop-blur-sm rounded-lg sm:rounded-xl border border-slate-200/60 p-3 sm:p-5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group hover:translate-x-1 cursor-pointer"
                    onClick={() => router.push(`/notes/${note.id}`)}
                  >
                    <div className="flex items-start gap-2 sm:gap-4">
                      {/* Pin indicator - Hidden on very small screens */}
                      <div className="hidden xs:flex flex-shrink-0 mt-1">
                        {note.isPinned ? (
                          <span className="text-yellow-500 text-base sm:text-xl">📌</span>
                        ) : (
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {/* Pin on mobile - show inline with title */}
                            {note.isPinned && (
                              <span className="xs:hidden text-yellow-500 text-sm flex-shrink-0">📌</span>
                            )}
                            <h3 className="font-bold text-gray-900 text-base sm:text-lg group-hover:text-blue-600 transition-colors truncate sm:line-clamp-none">
                              {note.title}
                            </h3>
                          </div>
                          <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs rounded-md sm:rounded-lg font-semibold whitespace-nowrap flex-shrink-0">
                            {note.category}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-1 sm:line-clamp-2">
                          {getTextPreview(note.content)}
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-1 sm:gap-1.5 flex-1 min-w-0">
                            {note.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 sm:px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md whitespace-nowrap"
                              >
                                #{tag}
                              </span>
                            ))}
                            {note.tags.length > 2 && (
                              <span className="px-1.5 sm:px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md whitespace-nowrap">
                                +{note.tags.length - 2}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                            {note.createdAt instanceof Date
                              ? note.createdAt.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })
                              : note.createdAt}
                          </span>
                        </div>
                      </div>

                      {/* Actions - Hidden on mobile, shown on hover on desktop */}
                      <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNote(note);
                          }}
                          className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-all"
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
                          className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Kanban View (Original Card View) */}
            {viewMode === 'kanban' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in duration-300">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 p-4 sm:p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 group hover:-translate-y-1"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        onClick={() => router.push(`/notes/${note.id}`)}
                        className="flex-1 cursor-pointer min-w-0 pr-2"
                      >
                        <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {note.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        {note.isPinned && (
                          <span className="text-yellow-500 text-base sm:text-lg">📌</span>
                        )}
                        <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
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
                      className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-3 cursor-pointer leading-relaxed"
                    >
                      {getTextPreview(note.content)}
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-slate-100 text-slate-600 text-xs rounded-md sm:rounded-lg whitespace-nowrap font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-slate-100 text-slate-600 text-xs rounded-md sm:rounded-lg whitespace-nowrap font-medium">
                          +{note.tags.length - 3}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500 font-medium">
                        {note.createdAt instanceof Date
                          ? note.createdAt.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: window.innerWidth >= 640 ? 'numeric' : undefined
                            })
                          : note.createdAt}
                      </span>
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs rounded-md sm:rounded-lg font-bold">
                        {note.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Add Note Button - Adjusted for mobile bottom nav */}
        <button
          onClick={() => router.push('/notes/new')}
          className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl sm:rounded-2xl shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all hover:scale-110 flex items-center justify-center text-2xl sm:text-3xl font-light hover:rotate-90 duration-300 group z-40"
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
