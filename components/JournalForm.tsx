'use client';

import { useState, FormEvent } from 'react';
import { JournalEntry } from '@/types';
import { toast } from 'sonner';
import RichTextEditor from './RichTextEditor';

interface JournalFormProps {
    entry?: JournalEntry;
    onSubmit: (data: {
        title: string;
        content: string;
        mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
        tags: string[];
        date: Date;
    }) => Promise<void>;
    onCancel: () => void;
}

const MOODS = [
    { value: 'great', label: 'Great', emoji: '😄', color: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' },
    { value: 'good', label: 'Good', emoji: '🙂', color: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200' },
    { value: 'okay', label: 'Okay', emoji: '😐', color: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200' },
    { value: 'bad', label: 'Bad', emoji: '😞', color: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200' },
    { value: 'terrible', label: 'Terrible', emoji: '😢', color: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' },
] as const;

export default function JournalForm({ entry, onSubmit, onCancel }: JournalFormProps) {
    const [title, setTitle] = useState(entry?.title || '');
    const [content, setContent] = useState(entry?.content || '');
    const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'bad' | 'terrible' | undefined>(entry?.mood);
    const [tagInput, setTagInput] = useState(entry?.tags.join(', ') || '');
    const [date, setDate] = useState(
        entry?.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        if (!content.trim()) {
            toast.error('Please enter some content');
            return;
        }

        try {
            setIsSubmitting(true);

            // Parse tags from comma-separated input
            const tags = tagInput
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            await onSubmit({
                title: title.trim(),
                content: content.trim(),
                mood,
                tags,
                date: new Date(date),
            });
        } catch (error) {
            console.error('Error submitting journal entry:', error);
            toast.error('Failed to save journal entry. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Title
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Give your entry a title..."
                    required
                />
            </div>

            {/* Date */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date
                </label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
            </div>

            {/* Mood Selector */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                    How are you feeling?
                </label>
                <div className="grid grid-cols-5 gap-2">
                    {MOODS.map((moodOption) => (
                        <button
                            key={moodOption.value}
                            type="button"
                            onClick={() => setMood(mood === moodOption.value ? undefined : moodOption.value as any)}
                            className={`px-3 py-3 rounded-xl border-2 transition-all text-center ${mood === moodOption.value
                                    ? moodOption.color + ' ring-2 ring-offset-2 ring-blue-500'
                                    : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <div className="text-2xl mb-1">{moodOption.emoji}</div>
                            <div className="text-xs font-medium">{moodOption.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Content
                </label>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <RichTextEditor
                        content={content}
                        onChange={setContent}
                        placeholder="Write your thoughts..."
                    />
                </div>
            </div>

            {/* Tags */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tags
                </label>
                <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter tags separated by commas (e.g., gratitude, work, reflection)"
                />
                <p className="text-xs text-slate-500 mt-1">Separate tags with commas</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Saving...' : (entry ? 'Update Entry' : 'Create Entry')}
                </button>
            </div>
        </form>
    );
}
