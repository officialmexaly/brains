'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTasks } from '@/lib/hooks/useTasks';
import { useJournalEntries } from '@/lib/hooks/useJournalEntries';
import { useKnowledgeArticles } from '@/lib/hooks/useKnowledgeArticles';
import { useBrain } from '@/lib/hooks/useBrain';
import TaskCard from '@/components/TaskCard';

type SearchResult = {
  id: string;
  type: 'task' | 'journal' | 'article' | 'note';
  title: string;
  description?: string;
  content?: string;
  date?: Date;
  relevance: number;
};

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'task' | 'journal' | 'article' | 'note'>('all');
  const [results, setResults] = useState<SearchResult[]>([]);

  const { tasks, isLoading: tasksLoading } = useTasks();
  const { entries: journalEntries, loading: journalLoading } = useJournalEntries({});
  const { articles, isLoading: articlesLoading } = useKnowledgeArticles();
  const { notes, isLoading: notesLoading } = useBrain();

  const isLoading = tasksLoading || journalLoading || articlesLoading || notesLoading;

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchQuery = query.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search tasks
    if (filter === 'all' || filter === 'task') {
      tasks.forEach(task => {
        let relevance = 0;
        if (task.title.toLowerCase().includes(searchQuery)) relevance += 10;
        if (task.description.toLowerCase().includes(searchQuery)) relevance += 5;
        if (task.tags?.some(tag => tag.toLowerCase().includes(searchQuery))) relevance += 3;
        if (task.category.toLowerCase().includes(searchQuery)) relevance += 2;

        if (relevance > 0) {
          searchResults.push({
            id: task.id,
            type: 'task',
            title: task.title,
            description: task.description,
            date: task.createdAt,
            relevance,
          });
        }
      });
    }

    // Search journal entries
    if (filter === 'all' || filter === 'journal') {
      journalEntries.forEach(entry => {
        let relevance = 0;
        if (entry.title.toLowerCase().includes(searchQuery)) relevance += 10;
        if (entry.content.toLowerCase().includes(searchQuery)) relevance += 5;
        if (entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery))) relevance += 3;

        if (relevance > 0) {
          searchResults.push({
            id: entry.id,
            type: 'journal',
            title: entry.title,
            content: entry.content.substring(0, 150),
            date: entry.date,
            relevance,
          });
        }
      });
    }

    // Search notes
    if (filter === 'all' || filter === 'note') {
      notes.forEach(note => {
        let relevance = 0;
        const plainContent = note.content.replace(/<[^>]*>/g, '');
        if (note.title.toLowerCase().includes(searchQuery)) relevance += 10;
        if (plainContent.toLowerCase().includes(searchQuery)) relevance += 5;
        if (note.tags?.some(tag => tag.toLowerCase().includes(searchQuery))) relevance += 3;
        if (note.category.toLowerCase().includes(searchQuery)) relevance += 2;

        if (relevance > 0) {
          searchResults.push({
            id: note.id,
            type: 'note',
            title: note.title,
            content: plainContent.substring(0, 150),
            date: note.createdAt,
            relevance,
          });
        }
      });
    }

    // Search knowledge articles
    if (filter === 'all' || filter === 'article') {
      articles.forEach(article => {
        let relevance = 0;
        if (article.title.toLowerCase().includes(searchQuery)) relevance += 10;
        if (article.content.toLowerCase().includes(searchQuery)) relevance += 5;
        if (article.tags?.some(tag => tag.toLowerCase().includes(searchQuery))) relevance += 3;
        if (article.category.toLowerCase().includes(searchQuery)) relevance += 2;

        if (relevance > 0) {
          searchResults.push({
            id: article.id,
            type: 'article',
            title: article.title,
            content: article.content.substring(0, 150),
            date: article.createdAt,
            relevance,
          });
        }
      });
    }

    // Sort by relevance
    searchResults.sort((a, b) => b.relevance - a.relevance);
    setResults(searchResults);
  }, [query, filter, tasks, journalEntries, articles, notes]);

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'task':
        router.push(`/tasks/${result.id}`);
        break;
      case 'journal':
        router.push(`/journal/${result.id}`);
        break;
      case 'article':
        router.push(`/knowledge/${result.id}`);
        break;
      case 'note':
        router.push(`/notes/${result.id}`);
        break;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task': return '✓';
      case 'journal': return '📖';
      case 'article': return '📚';
      case 'note': return '📝';
      default: return '📄';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-blue-100 text-blue-700';
      case 'journal': return 'bg-purple-100 text-purple-700';
      case 'article': return 'bg-green-100 text-green-700';
      case 'note': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
            Search
          </h1>
          <p className="text-slate-600 text-sm sm:text-base">
            Search across all your tasks, journal entries, and knowledge articles
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for anything..."
              className="w-full px-4 py-3 sm:py-4 pl-12 pr-4 text-base sm:text-lg border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
          {(['all', 'task', 'journal', 'article'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && 's'}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading...</p>
          </div>
        ) : !query.trim() ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-5xl sm:text-6xl mb-4">🔍</div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
              Start searching
            </h3>
            <p className="text-sm sm:text-base text-slate-600">
              Type something to search across all your content
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-5xl sm:text-6xl mb-4">😕</div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
              No results found
            </h3>
            <p className="text-sm sm:text-base text-slate-600">
              Try searching with different keywords
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600 mb-4">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            {results.map((result) => (
              <div
                key={`${result.type}-${result.id}`}
                onClick={() => handleResultClick(result)}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-lg sm:text-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                        {result.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getTypeColor(result.type)} flex-shrink-0`}>
                        {result.type}
                      </span>
                    </div>
                    {(result.description || result.content) && (
                      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-2">
                        {result.description || result.content}
                      </p>
                    )}
                    {result.date && (
                      <p className="text-xs text-slate-500">
                        {result.date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
