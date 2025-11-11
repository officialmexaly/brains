'use client';

import { useParams, useRouter } from 'next/navigation';
import { useBrain } from '@/lib/hooks/useBrain';
import { useState } from 'react';
import Modal from '@/components/Modal';
import NoteForm from '@/components/NoteForm';
import NoteContent from '@/components/NoteContent';
import { toast } from 'sonner';

export default function NotePage() {
  const params = useParams();
  const router = useRouter();
  const { notes, updateNote, deleteNote, isLoading } = useBrain();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const note = notes.find((n) => n.id === params.id);

  const handleUpdate = async (data: any) => {
    if (note) {
      try {
        await updateNote(note.id, data);
        setIsEditModalOpen(false);
        toast.success('Note updated successfully!');
      } catch (error) {
        toast.error('Failed to update note');
      }
    }
  };

  const handleDelete = async () => {
    if (!note) return;

    toast.custom((t) => (
      <div className="bg-white rounded-lg shadow-lg p-4 border border-slate-200">
        <p className="text-slate-900 font-medium mb-3">Are you sure you want to delete this note?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t);
              try {
                await deleteNote(note.id);
                toast.success('Note deleted successfully!');
                router.push('/notes');
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

  const togglePin = async () => {
    if (note) {
      try {
        await updateNote(note.id, { isPinned: !note.isPinned });
        toast.success(note.isPinned ? 'Note unpinned' : 'Note pinned');
      } catch (error) {
        toast.error('Failed to update note');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center !bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading note...</p>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Note Not Found</h3>
            <p className="text-slate-600 mb-6">
              The note you're looking for doesn't exist or has been deleted.
            </p>
            <button
              onClick={() => router.push('/notes')}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
            >
              Back to Notes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen !bg-white !text-black" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header Navigation */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/notes')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Notes
          </button>

          {/* Title and Meta */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold !text-black mb-4 leading-tight" style={{ color: '#000000' }}>{note.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm !text-slate-800" style={{ color: '#1e293b' }}>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {note.createdAt instanceof Date
                  ? note.createdAt.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : note.createdAt}
              </span>
              <span className="text-slate-400">•</span>
              <span className="px-2.5 py-1 bg-slate-100 text-slate-900 rounded-md font-medium text-xs whitespace-nowrap">
                {note.category}
              </span>
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md text-xs whitespace-nowrap"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-3 pb-6 border-b border-slate-200">
            <button
              onClick={() => {
                router.push(`/notes/${note.id}/edit`);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={togglePin}
              className={`px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${
                note.isPinned
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {note.isPinned ? 'Unpin' : 'Pin'}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="pb-12">
          <NoteContent content={note.content} />
        </div>

        {/* Footer Metadata */}
        <div className="border-t border-slate-200 pt-8 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-xs font-semibold !text-slate-600 uppercase tracking-wide mb-2" style={{ color: '#475569' }}>Statistics</h3>
              <div className="space-y-1 text-sm !text-black" style={{ color: '#000000' }}>
                <p>{note.content.split(' ').length} words</p>
                <p>{note.content.length} characters</p>
                <p>{Math.ceil(note.content.split(' ').length / 200)} min read</p>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold !text-slate-600 uppercase tracking-wide mb-2" style={{ color: '#475569' }}>Created</h3>
              <p className="text-sm !text-black" style={{ color: '#000000' }}>
                {note.createdAt instanceof Date
                  ? note.createdAt.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : String(note.createdAt)}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold !text-slate-600 uppercase tracking-wide mb-2" style={{ color: '#475569' }}>Last Updated</h3>
              <p className="text-sm !text-black" style={{ color: '#000000' }}>
                {note.updatedAt instanceof Date
                  ? note.updatedAt.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : String(note.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Note"
      >
        <NoteForm
          note={note}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
