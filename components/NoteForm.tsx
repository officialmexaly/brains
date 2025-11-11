'use client';

import { useState, FormEvent } from 'react';
import { Note } from '@/types';

interface NoteFormProps {
  note?: Note;
  onSubmit: (data: {
    title: string;
    content: string;
    category: string;
    tags: string[];
    isPinned?: boolean;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function NoteForm({ note, onSubmit, onCancel }: NoteFormProps) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [category, setCategory] = useState(note?.category || 'Personal');
  const [tagsInput, setTagsInput] = useState(note?.tags.join(', ') || '');
  const [isPinned, setIsPinned] = useState(note?.isPinned || false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const tags = tagsInput.split(',').map((tag) => tag.trim()).filter(Boolean);
      await onSubmit({ title, content, category, tags, isPinned });
    } catch (error) {
      console.error('Error submitting note:', error);
      alert('Failed to save note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
          placeholder="Enter note title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">
          Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white text-slate-900"
          placeholder="Write your note content..."
          rows={8}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-900 mb-2">
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
        <label className="block text-sm font-medium text-slate-900 mb-2">
          Tags (comma separated)
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
          placeholder="e.g. important, ideas, project"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPinned"
          checked={isPinned}
          onChange={(e) => setIsPinned(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor="isPinned" className="text-sm font-medium text-slate-900">
          Pin this note
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-slate-200 text-slate-900 bg-white rounded-xl hover:bg-slate-50 transition-all font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : (note ? 'Update Note' : 'Create Note')}
        </button>
      </div>
    </form>
  );
}
