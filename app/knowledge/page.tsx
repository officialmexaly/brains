'use client';

import { useState } from 'react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  readTime: number;
  author: string;
  createdAt: string;
  imageUrl?: string;
}

export default function KnowledgePage() {
  const [articles] = useState<Article[]>([
    {
      id: '1',
      title: 'Building Scalable Web Applications',
      excerpt: 'Learn the best practices for building scalable web applications that can handle millions of users...',
      category: 'Development',
      tags: ['web', 'scalability', 'architecture'],
      readTime: 15,
      author: 'You',
      createdAt: 'Apr 12, 25',
    },
    {
      id: '2',
      title: 'Understanding React Server Components',
      excerpt: 'A deep dive into React Server Components and how they revolutionize data fetching in React applications...',
      category: 'Development',
      tags: ['react', 'server-components'],
      readTime: 20,
      author: 'You',
      createdAt: 'Apr 10, 25',
    },
    {
      id: '3',
      title: 'The Art of Time Management',
      excerpt: 'Practical strategies for managing your time effectively and achieving your goals faster...',
      category: 'Productivity',
      tags: ['time-management', 'productivity'],
      readTime: 10,
      author: 'You',
      createdAt: 'Apr 8, 25',
    },
    {
      id: '4',
      title: 'Introduction to Machine Learning',
      excerpt: 'A beginner-friendly guide to understanding machine learning concepts and algorithms...',
      category: 'Learning',
      tags: ['ml', 'ai', 'learning'],
      readTime: 25,
      author: 'You',
      createdAt: 'Apr 5, 25',
    },
    {
      id: '5',
      title: 'Healthy Eating Habits',
      excerpt: 'Simple and effective ways to develop healthy eating habits that stick long-term...',
      category: 'Health',
      tags: ['nutrition', 'health', 'wellness'],
      readTime: 12,
      author: 'You',
      createdAt: 'Apr 3, 25',
    },
    {
      id: '6',
      title: 'Financial Planning for Beginners',
      excerpt: 'Essential financial planning tips to help you build wealth and secure your future...',
      category: 'Finance',
      tags: ['finance', 'investing', 'planning'],
      readTime: 18,
      author: 'You',
      createdAt: 'Apr 1, 25',
    },
  ]);

  const categories = [
    { name: 'Development', count: 28, icon: '💻' },
    { name: 'Productivity', count: 15, icon: '⚡' },
    { name: 'Learning', count: 22, icon: '🎓' },
    { name: 'Health', count: 12, icon: '❤️' },
    { name: 'Finance', count: 9, icon: '💰' },
    { name: 'Design', count: 18, icon: '🎨' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">Knowledge Base</h1>
          <p className="text-slate-600 text-lg">
            Your personal library of articles, insights, and documented knowledge.
          </p>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Top Categories</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              See all →
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.name}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/60 hover:shadow-xl hover:shadow-blue-500/5 transition-all hover:-translate-y-1 group"
              >
                <div className="text-3xl mb-2">{category.icon}</div>
                <p className="font-semibold text-gray-900 text-sm mb-1">{category.name}</p>
                <p className="text-xs text-gray-500">{category.count} articles</p>
              </button>
            ))}
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Articles</h2>
            <span className="text-sm text-gray-500">{articles.length} articles</span>
          </div>
          <div className="flex items-center gap-3">
            <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Sort by: Recent</option>
              <option>Sort by: Oldest</option>
              <option>Sort by: Read Time</option>
              <option>Sort by: Category</option>
            </select>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div
              key={article.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group hover:-translate-y-1"
            >
              {/* Image placeholder */}
              <div className="h-48 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
                <span className="text-6xl">📚</span>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md font-medium">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-500">⏱ {article.readTime} min read</span>
                </div>

                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {article.excerpt}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {article.author[0]}
                    </div>
                    <span className="text-xs text-gray-600">{article.author}</span>
                  </div>
                  <span className="text-xs text-gray-500">{article.createdAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <button className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50">
            ←
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium">
            1
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            2
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            3
          </button>
          <span className="px-2">...</span>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            80
          </button>
          <button className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            →
          </button>
        </div>

        {/* Add Article Button */}
        <button className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all hover:scale-110 flex items-center justify-center text-3xl font-light hover:rotate-90 duration-300 group">
          <span className="group-hover:rotate-[-90deg] transition-transform duration-300">+</span>
        </button>
      </div>
    </div>
  );
}
