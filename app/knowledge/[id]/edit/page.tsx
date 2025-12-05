'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import RichTextEditor from '@/components/RichTextEditor';
import { useKnowledgeArticles } from '@/lib/hooks/useKnowledgeArticles';
import { toast } from 'sonner';

const CATEGORIES = [
    { value: 'Development', label: 'Development', icon: '💻' },
    { value: 'Productivity', label: 'Productivity', icon: '⚡' },
    { value: 'Learning', label: 'Learning', icon: '🎓' },
    { value: 'Health', label: 'Health', icon: '❤️' },
    { value: 'Finance', label: 'Finance', icon: '💰' },
    { value: 'Design', label: 'Design', icon: '🎨' },
];

export default function EditArticlePage() {
    const router = useRouter();
    const params = useParams();
    const { articles, updateArticle, deleteArticle } = useKnowledgeArticles();
    const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('Development');
    const [tagInput, setTagInput] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const article = articles.find((a) => a.id === params.id);

    useEffect(() => {
        if (article) {
            setTitle(article.title);
            setContent(article.content);
            setCategory(article.category);
            setTagInput(article.tags?.join(', ') || '');
            setImageUrl(article.imageUrl || '');
            setLoading(false);
        } else if (articles.length > 0) {
            // Articles loaded but article not found
            setLoading(false);
        }
    }, [article, articles]);

    const calculateReadTime = (text: string): number => {
        const wordsPerMinute = 200;
        const plainText = text.replace(/<[^>]*>/g, '');
        const wordCount = plainText.trim().split(/\s+/).length;
        return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    };

    const generateExcerpt = (html: string): string => {
        const plainText = html.replace(/<[^>]*>/g, '');
        return plainText.slice(0, 200) + (plainText.length > 200 ? '...' : '');
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSaving || !article) return;

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
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);

            await updateArticle(article.id, {
                title: title.trim(),
                content: content.trim(),
                excerpt: generateExcerpt(content),
                category,
                tags,
                imageUrl: imageUrl.trim() || undefined,
                readTime: calculateReadTime(content),
            });

            toast.success('Article updated successfully');
            router.push(`/knowledge/${article.id}`);
        } catch (err) {
            console.error('Error updating article:', err);
            toast.error('Failed to update article');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!article) return;
        if (!confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteArticle(article.id);
            toast.success('Article deleted successfully');
            router.push('/knowledge');
        } catch (err) {
            console.error('Error deleting article:', err);
            toast.error('Failed to delete article');
        }
    };

    const handleCancel = () => {
        if (article) {
            router.push(`/knowledge/${article.id}`);
        } else {
            router.push('/knowledge');
        }
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-screen-xl mx-auto">
                    <div className="text-center py-12 sm:py-20">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading article...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-12 text-center shadow-lg">
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">Article Not Found</h3>
                        <p className="text-slate-600 mb-6">
                            The article you're trying to edit doesn't exist or has been deleted.
                        </p>
                        <button
                            onClick={() => router.push('/knowledge')}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
                        >
                            Back to Knowledge Base
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-screen-xl mx-auto">
                {/* Header */}
                <div className="mb-4 sm:mb-6">
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="text-sm sm:text-base">Back to Knowledge Base</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Article Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
                        {/* Entry Header */}
                        <div className="p-4 sm:p-6 border-b border-slate-200/60">
                            <div className="mb-4">
                                <div className="flex-1 mb-4">
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="text-2xl sm:text-3xl font-bold text-slate-900 bg-transparent border-none focus:outline-none w-full placeholder:text-slate-400"
                                        placeholder="Article title..."
                                        required
                                    />
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                                        <span className="flex items-center gap-1 text-xs sm:text-sm text-slate-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                            <span>{category}</span>
                                        </span>
                                        <span className="flex items-center gap-1 text-xs sm:text-sm text-slate-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{calculateReadTime(content)} min read</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium text-sm sm:text-base order-2 sm:order-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-2"
                                    >
                                        {isSaving ? 'Updating...' : 'Update Article'}
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
                            <div className="flex px-4 sm:px-6">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('overview')}
                                    className={`px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'overview'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Content
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('details')}
                                    className={`px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'details'
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
                            <div className="p-4 sm:p-8">
                                <RichTextEditor
                                    content={content}
                                    onChange={setContent}
                                    placeholder="Write your article content..."
                                />
                            </div>
                        )}

                        {activeTab === 'details' && (
                            <div className="p-4 sm:p-8">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Category
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {CATEGORIES.map((cat) => (
                                                <button
                                                    key={cat.value}
                                                    type="button"
                                                    onClick={() => setCategory(cat.value)}
                                                    className={`px-3 py-3 rounded-xl border-2 transition-all text-center ${category === cat.value
                                                        ? 'bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-offset-2 ring-blue-500'
                                                        : 'bg-white border-slate-200 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <div className="text-xl sm:text-2xl mb-1">{cat.icon}</div>
                                                    <div className="text-xs font-medium">{cat.label}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Cover Image URL (Optional)
                                        </label>
                                        <input
                                            type="url"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                            placeholder="https://example.com/image.jpg"
                                        />
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
                                            placeholder="e.g. web, scalability, architecture"
                                        />
                                        <p className="text-sm text-slate-500 mt-2">Separate tags with commas</p>
                                    </div>

                                    {/* Delete Button */}
                                    <div className="pt-4 border-t border-slate-200">
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-medium"
                                        >
                                            Delete Article
                                        </button>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Tip</h4>
                                        <p className="text-sm text-blue-700">
                                            Use the rich text editor to format your article. You can add headings, lists, code blocks, and more to create engaging content.
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
