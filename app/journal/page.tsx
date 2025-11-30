'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useJournalEntries } from '@/lib/hooks/useJournalEntries';

export default function JournalPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const { entries, loading } = useJournalEntries({});

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'great': return '😄';
      case 'good': return '🙂';
      case 'okay': return '😐';
      case 'bad': return '😞';
      case 'terrible': return '😢';
      default: return '📝';
    }
  };

  const getMoodColor = (mood?: string) => {
    switch (mood) {
      case 'great': return 'bg-green-100 text-green-700 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'okay': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'bad': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'terrible': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleCreateEntry = () => {
    router.push('/journal/new');
  };

  const handleEditEntry = (entryId: string) => {
    router.push(`/journal/${entryId}`);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const entryDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - entryDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return entryDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFullDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Filter entries based on selected filter
  const getFilteredEntries = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    switch (selectedFilter) {
      case 'today':
        return entries.filter(e => {
          const entryDate = new Date(e.date);
          return entryDate >= today;
        });
      case 'week':
        return entries.filter(e => {
          const entryDate = new Date(e.date);
          return entryDate >= weekAgo;
        });
      case 'month':
        return entries.filter(e => {
          const entryDate = new Date(e.date);
          return entryDate >= monthAgo;
        });
      default:
        return entries;
    }
  };

  // Group entries by date
  const groupEntriesByDate = () => {
    const filtered = getFilteredEntries();
    const grouped: { [key: string]: typeof entries } = {};

    filtered.forEach(entry => {
      const dateKey = formatFullDate(entry.date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });

    return grouped;
  };

  const totalEntries = entries.length;
  const thisWeekEntries = entries.filter(e => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(e.date) >= weekAgo;
  }).length;

  const groupedEntries = groupEntriesByDate();
  const dateKeys = Object.keys(groupedEntries).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
            Daily Journal
          </h1>
          <p className="text-slate-600 text-lg">
            Reflect on your day, track your mood, and document your journey.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Entries</p>
                <p className="text-3xl font-bold text-gray-900">{totalEntries}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                📝
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Week</p>
                <p className="text-3xl font-bold text-gray-900">{thisWeekEntries}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                📅
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Mood</p>
                <p className="text-3xl font-bold text-gray-900">
                  {entries.length > 0 ? getMoodEmoji(entries[0].mood) : '😊'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                💭
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
          >
            All Entries
          </button>
          <button
            onClick={() => setSelectedFilter('today')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedFilter === 'today'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedFilter('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedFilter === 'week'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
          >
            This Week
          </button>
          <button
            onClick={() => setSelectedFilter('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedFilter === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
          >
            This Month
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading entries...</p>
          </div>
        )}

        {/* Entries List */}
        {!loading && (
          <div className="space-y-6">
            {dateKeys.length === 0 ? (
              <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No journal entries yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start documenting your journey by creating your first entry
                </p>
                <button
                  onClick={handleCreateEntry}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium"
                >
                  Create First Entry
                </button>
              </div>
            ) : (
              dateKeys.map(dateKey => (
                <div key={dateKey}>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {dateKey} ({groupedEntries[dateKey].length})
                  </h2>
                  <div className="space-y-3">
                    {groupedEntries[dateKey].map((entry) => (
                      <div
                        key={entry.id}
                        onClick={() => handleEditEntry(entry.id)}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer hover:-translate-y-1"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex items-center h-6">
                            <div className="text-2xl">{getMoodEmoji(entry.mood)}</div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900">{entry.title}</h3>
                              {entry.mood && (
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getMoodColor(entry.mood)}`}>
                                  {entry.mood}
                                </span>
                              )}
                            </div>
                            <div
                              className="text-sm text-gray-600 mb-3 line-clamp-2"
                              dangerouslySetInnerHTML={{ __html: entry.content }}
                            />
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-500">🕒 {formatDate(entry.date)}</span>
                              {entry.tags && entry.tags.length > 0 && (
                                <div className="flex items-center gap-2">
                                  {entry.tags.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                  {entry.tags.length > 3 && (
                                    <span className="text-gray-500 text-xs">
                                      +{entry.tags.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Add Entry Button */}
        <button
          onClick={handleCreateEntry}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all hover:scale-110 flex items-center justify-center text-3xl font-light hover:rotate-90 duration-300 group"
        >
          <span className="group-hover:rotate-[-90deg] transition-transform duration-300">+</span>
        </button>
      </div>
    </div>
  );
}
