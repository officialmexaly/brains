'use client';

import { useParams, useRouter } from 'next/navigation';
import { useKnowledgeArticles } from '@/lib/hooks/useKnowledgeArticles';
import { useState } from 'react';
import { toast } from 'sonner';

const CATEGORIES = [
    { value: 'Development', label: 'Development', icon: '💻' },
    { value: 'Productivity', label: 'Productivity', icon: '⚡' },
    { value: 'Learning', label: 'Learning', icon: '🎓' },
    { value: 'Health', label: 'Health', icon: '❤️' },
    { value: 'Finance', label: 'Finance', icon: '💰' },
    { value: 'Design', label: 'Design', icon: '🎨' },
];

export default function ViewArticlePage() {
    const params = useParams();
    const router = useRouter();
    const { articles, deleteArticle, isLoading } = useKnowledgeArticles();
    const [activeTab, setActiveTab] = useState<'content' | 'details'>('content');

    const article = articles.find((a) => a.id === params.id);

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

    const handleEdit = () => {
        if (article) {
            router.push(`/knowledge/${article.id}/edit`);
        }
    };

    const getCategoryIcon = (categoryName: string) => {
        const category = CATEGORIES.find((c) => c.value === categoryName);
        return category?.icon || '📚';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading article...</p>
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
                            The article you're looking for doesn't exist or has been deleted.
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
        <div className="min-h-screen bg-white text-black">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Header Navigation */}
                <div className="mb-6 sm:mb-8">
                    <button
                        onClick={() => router.push('/knowledge')}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors text-sm font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Knowledge Base
                    </button>

                    {/* Title and Meta */}
                    <div className="mb-6">
                        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4 leading-tight">{article.title}</h1>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-800">
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {article.createdAt.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {article.readTime} min read
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-900 rounded-md font-medium text-xs whitespace-nowrap flex items-center gap-1">
                                <span>{getCategoryIcon(article.category)}</span>
                                {article.category}
                            </span>
                            {article.tags.map((tag) => (
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
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 pb-6 border-b border-slate-200">
                        <button
                            onClick={handleEdit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
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

                {/* Tabs */}
                <div className="border-b border-slate-200 mb-6">
                    <div className="flex gap-1">
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'content'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Content
                        </button>
                        <button
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
                {activeTab === 'content' && (
                    <div className="pb-12">
                        <div
                            className="prose prose-slate max-w-none prose-headings:text-black prose-p:text-black prose-li:text-black prose-strong:text-black"
                            dangerouslySetInnerHTML={{ __html: article.content }}
                        />
                    </div>
                )}

                {activeTab === 'details' && (
                    <div className="pb-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Article Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Article Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Category</label>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="text-2xl">{getCategoryIcon(article.category)}</span>
                                            <span className="text-slate-900">{article.category}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Author</label>
                                        <p className="mt-1 text-slate-900">{article.author}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Reading Time</label>
                                        <p className="mt-1 text-slate-900">{article.readTime} minutes</p>
                                    </div>
                                    {article.imageUrl && (
                                        <div>
                                            <label className="text-sm font-medium text-slate-600">Cover Image</label>
                                            <div className="mt-2">
                                                <img
                                                    src={article.imageUrl}
                                                    alt={article.title}
                                                    className="w-full h-48 object-cover rounded-lg"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tags and Metadata */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Tags & Metadata</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Tags</label>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {article.tags.length > 0 ? (
                                                article.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))
                                            ) : (
                                                <p className="text-slate-500 text-sm">No tags</p>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Created</label>
                                        <p className="mt-1 text-slate-900">
                                            {article.createdAt.toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Last Updated</label>
                                        <p className="mt-1 text-slate-900">
                                            {article.updatedAt.toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Statistics</label>
                                        <div className="mt-1 space-y-1 text-sm text-slate-900">
                                            <p>{article.content.replace(/<[^>]*>/g, '').split(' ').length} words</p>
                                            <p>{article.content.replace(/<[^>]*>/g, '').length} characters</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
