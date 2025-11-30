'use client';

import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/RichTextEditor';
import { supabase } from '@/lib/supabase';

const MOODS = [
    { value: 'great', label: 'Great', emoji: '😄', color: 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' },
    { value: 'good', label: 'Good', emoji: '🙂', color: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200' },
    { value: 'okay', label: 'Okay', emoji: '😐', color: 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200' },
    { value: 'bad', label: 'Bad', emoji: '😞', color: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200' },
    { value: 'terrible', label: 'Terrible', emoji: '😢', color: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' },
] as const;

export default function NewJournalPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [mood, setMood] = useState<'great' | 'good' | 'okay' | 'bad' | 'terrible' | undefined>();
    const [tagInput, setTagInput] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSaving) return;

        if (!title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        if (!content.trim()) {
            toast.error('Please enter some content');
            return;
        }

        try {
            setIsSaving(true);

            const tags = tagInput
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            const { error } = await supabase
                .from('journal_entries')
                .insert([
                    {
                        title: title.trim(),
                        content: content.trim(),
                        mood,
                        tags,
                        date: new Date(date).toISOString(),
                    },
                ]);

            if (error) throw error;

            toast.success('Journal entry created successfully');
            router.push('/journal');
        } catch (err) {
            console.error('Error creating journal entry:', err);
            toast.error('Failed to create journal entry');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.push('/journal');
    };

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
                        Back to Journal
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Journal Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
                        {/* Entry Header */}
                        <div className="p-6 border-b border-slate-200/60">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="text-3xl font-bold text-slate-900 bg-transparent border-none focus:outline-none w-full placeholder:text-slate-400"
                                        placeholder="Entry title..."
                                        required
                                    />
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className="flex items-center gap-1 text-sm text-slate-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {new Date(date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                        {mood && (
                                            <span className="flex items-center gap-1 text-sm">
                                                <span className="text-lg">{MOODS.find(m => m.value === mood)?.emoji}</span>
                                                <span className="text-slate-600 capitalize">{mood}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSaving ? 'Saving...' : 'Save Entry'}
                                    </button>
                                </div>
                            </div>

                            {/* Tags Input */}
                            <div>
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
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
                                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'overview'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Overview
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('details')}
                                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'details'
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
                                    placeholder="Write your thoughts..."
                                />
                            </div>
                        )}

                        {activeTab === 'details' && (
                            <div className="p-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-3">
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

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Tags
                                        </label>
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                            placeholder="e.g. gratitude, work, reflection"
                                        />
                                        <p className="text-sm text-slate-500 mt-2">Separate tags with commas</p>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Tip</h4>
                                        <p className="text-sm text-blue-700">
                                            Use the rich text editor to format your journal entries. You can add headings, lists, and more to organize your thoughts.
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
