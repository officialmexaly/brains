'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useKnowledgeArticles } from '@/lib/hooks/useKnowledgeArticles';

export default function KnowledgePage() {
  const router = useRouter();
  const { articles, isLoading } = useKnowledgeArticles();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Read category from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const categoryParam = params.get('category');
      if (categoryParam) {
        setSelectedCategory(categoryParam);
      }
    }
  }, []);

  const categories = useMemo(() => {
    const categoryMap = new Map<string, { name: string; count: number; icon: string }>();
    const iconMap: Record<string, string> = {
      Development: '💻',
      Productivity: '⚡',
      Learning: '🎓',
      Health: '❤️',
      Finance: '💰',
      Design: '🎨',
    };

    articles.forEach((article) => {
      const existing = categoryMap.get(article.category);
      if (existing) {
        existing.count++;
      } else {
        categoryMap.set(article.category, {
          name: article.category,
          count: 1,
          icon: iconMap[article.category] || '📚',
        });
      }
    });

    return Array.from(categoryMap.values()).sort((a, b) => b.count - a.count);
  }, [articles]);

  // Filter articles by selected category
  const filteredArticles = useMemo(() => {
    if (selectedCategory === 'all') return articles;
    return articles.filter(article => article.category === selectedCategory);
  }, [articles, selectedCategory]);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    // Update URL
    if (category === 'all') {
      router.push('/knowledge');
    } else {
      router.push(`/knowledge?category=${encodeURIComponent(category)}`);
    }
  };

  const handleArticleClick = (id: string) => {
    router.push(`/knowledge/${id}`);
  };

  const handleNewArticle = () => {
    router.push('/knowledge/new');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2 sm:mb-3">Knowledge Base</h1>
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg">
            Your personal library of articles, insights, and documented knowledge.
          </p>
        </div>

        {/* Categories */}
        {!isLoading && categories.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Top Categories</h2>
              <button className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium">
                See all →
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {categories.map((category) => (
                <button
                  key={category.name}
                  className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 border border-slate-200/60 hover:shadow-xl hover:shadow-blue-500/5 transition-all hover:-translate-y-1 group"
                >
                  <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{category.icon}</div>
                  <p className="font-semibold text-gray-900 text-xs sm:text-sm mb-0.5 sm:mb-1 truncate">{category.name}</p>
                  <p className="text-xs text-gray-500">{category.count} articles</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters and Sort */}
        {!isLoading && articles.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6">
            <div className="flex items-center gap-2 sm:gap-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900">Articles</h2>
              <span className="text-xs sm:text-sm text-gray-500">{filteredArticles.length} articles</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="px-2 py-1.5 sm:px-4 sm:py-2 border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex-1 sm:flex-initial"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
              <select className="px-2 py-1.5 sm:px-4 sm:py-2 border border-gray-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex-1 sm:flex-initial">
                <option>Sort by: Recent</option>
                <option>Sort by: Oldest</option>
                <option>Sort by: Read Time</option>
                <option>Sort by: Category</option>
              </select>
              <button className="p-1.5 sm:p-2 border border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 bg-white flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12 sm:py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:h-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
              <p className="text-gray-600 text-base sm:text-lg">Loading articles...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && articles.length === 0 && (
          <div className="flex items-center justify-center py-12 sm:py-20 px-4">
            <div className="text-center max-w-md">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">📚</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No articles yet</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-5 sm:mb-6">
                Start building your knowledge base. Click the + button below to create your first article.
              </p>
              <button
                onClick={handleNewArticle}
                className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg sm:rounded-xl font-medium text-sm sm:text-base hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
              >
                Create Your First Article
              </button>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {!isLoading && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => handleArticleClick(article.id)}
                className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group hover:-translate-y-1"
              >
                {/* Image placeholder */}
                <div className="h-40 sm:h-48 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
                  <span className="text-4xl sm:text-5xl lg:text-6xl">📚</span>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <span className="px-2 py-0.5 sm:py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium whitespace-nowrap">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">⏱ {article.readTime} min read</span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-600 text-xs rounded-md whitespace-nowrap"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {article.author[0]}
                      </div>
                      <span className="text-xs text-gray-600 truncate">{article.author}</span>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                      {article.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Article Button */}
        <button
          onClick={handleNewArticle}
          className="fixed bottom-20 right-4 lg:bottom-8 lg:right-8 w-14 h-14 sm:w-16 sm:w-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl sm:rounded-2xl shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all hover:scale-110 flex items-center justify-center text-2xl sm:text-3xl font-light hover:rotate-90 duration-300 group z-40"
        >
          <span className="group-hover:rotate-[-90deg] transition-transform duration-300">+</span>
        </button>
      </div>
    </div>
  );
}
