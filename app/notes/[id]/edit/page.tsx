'use client';

import { useRouter, useParams } from 'next/navigation';
import { useBrain } from '@/lib/hooks/useBrain';
import { useState, useEffect, FormEvent } from 'react';
import RichTextEditor from '@/components/RichTextEditor';

export default function EditNotePage() {
  const router = useRouter();
  const params = useParams();
  const { notes, updateNote } = useBrain();
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Personal');
  const [tagsInput, setTagsInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load note data
  useEffect(() => {
    const note = notes.find((n) => n.id === params.id);
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category);
      setTagsInput(note.tags.join(', '));
      setIsPinned(note.isPinned || false);
      setLoading(false);
    } else {
      // Note not found, redirect to notes list
      router.push('/notes');
    }
  }, [notes, params.id, router]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const tags = tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean);
    updateNote(params.id as string, { title, content, category, tags, isPinned });
    router.push(`/notes/${params.id}`);
  };

  const handleCancel = () => {
    router.push(`/notes/${params.id}`);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Note
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Note Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
            {/* Note Header */}
            <div className="p-6 border-b border-slate-200/60">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-3xl font-bold text-slate-900 bg-transparent border-none focus:outline-none w-full placeholder:text-slate-400"
                    placeholder="Note title..."
                    required
                  />
                  <div className="flex items-center gap-3 mt-3">
                    <span className="flex items-center gap-1 text-sm text-slate-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Learning">Learning</option>
                      <option value="Health">Health</option>
                      <option value="Ideas">Ideas</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPinned(!isPinned)}
                    className={`p-2.5 rounded-xl transition-all ${
                      isPinned
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={isPinned ? 'Unpin' : 'Pin'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium"
                  >
                    Update Note
                  </button>
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 text-slate-700 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                  placeholder="Add tags (comma separated)..."
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200/60">
              <div className="flex px-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                    activeTab === 'overview'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                    activeTab === 'details'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Details
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="p-8">
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Start writing your note content..."
                />
              </div>
            )}

            {activeTab === 'details' && (
              <div className="p-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                    >
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Learning">Learning</option>
                      <option value="Health">Health</option>
                      <option value="Ideas">Ideas</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Tags
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                      placeholder="e.g. important, ideas, project"
                    />
                    <p className="text-sm text-slate-500 mt-2">Separate tags with commas</p>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="isPinned"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="isPinned" className="text-sm font-medium text-slate-900">
                      Pin this note to the top
                    </label>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Tip</h4>
                    <p className="text-sm text-blue-700">
                      Use markdown formatting in your note content for better organization. Code blocks are automatically formatted with syntax highlighting.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
