'use client';

import { useState } from 'react';
import { useJournalEntries } from '@/lib/hooks/useJournalEntries';
import Modal from '@/components/Modal';
import JournalForm from '@/components/JournalForm';
import { JournalEntry } from '@/types';

export default function TodayJournalPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | undefined>();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { entries, loading, createEntry, updateEntry, deleteEntry } = useJournalEntries({
    dateFrom: today,
    dateTo: tomorrow,
  });

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
    setEditingEntry(undefined);
    setIsModalOpen(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: {
    title: string;
    content: string;
    mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
    tags: string[];
    date: Date;
  }) => {
    if (editingEntry) {
      await updateEntry(editingEntry.id, data);
    } else {
      await createEntry(data);
    }
    setIsModalOpen(false);
    setEditingEntry(undefined);
  };

  const handleDelete = async (entryId: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      await deleteEntry(entryId);
      setIsModalOpen(false);
      setEditingEntry(undefined);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Today's Journal
            </h1>
            <button
              onClick={() => window.location.href = '/journal'}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to All Entries
            </button>
          </div>
          <p className="text-slate-600 text-lg">
            {today.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <p className="text-sm text-blue-600 font-medium mb-1">Entries Today</p>
            <p className="text-4xl font-bold text-blue-900">{entries.length}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
            <p className="text-sm text-purple-600 font-medium mb-1">Current Mood</p>
            <p className="text-4xl">
              {entries.length > 0 ? getMoodEmoji(entries[0].mood) : '😊'}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading today's entries...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && entries.length === 0 && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No entries yet today
            </h3>
            <p className="text-gray-600 mb-6">
              Start your day by documenting your thoughts and feelings
            </p>
            <button
              onClick={handleCreateEntry}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium"
            >
              Create Today's Entry
            </button>
          </div>
        )}

        {/* Today's Entries */}
        {!loading && entries.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Today's Entries ({entries.length})
            </h2>
            {entries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => handleEditEntry(entry)}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getMoodEmoji(entry.mood)}</div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {entry.title}
                      </h3>
                      <p className="text-sm text-gray-500">{formatTime(entry.createdAt)}</p>
                    </div>
                  </div>
                  {entry.mood && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getMoodColor(entry.mood)}`}>
                      {entry.mood}
                    </span>
                  )}
                </div>

                <div
                  className="text-gray-700 mb-4 leading-relaxed line-clamp-3"
                  dangerouslySetInnerHTML={{ __html: entry.content }}
                />

                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick Add Button */}
        <button
          onClick={handleCreateEntry}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all hover:scale-110 flex items-center justify-center text-3xl font-light hover:rotate-90 duration-300 group"
        >
          <span className="group-hover:rotate-[-90deg] transition-transform duration-300">+</span>
        </button>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingEntry(undefined);
          }}
          title={editingEntry ? 'Edit Entry' : 'New Entry'}
        >
          <JournalForm
            entry={editingEntry}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingEntry(undefined);
            }}
          />
          {editingEntry && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={() => handleDelete(editingEntry.id)}
                className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-medium"
              >
                Delete Entry
              </button>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
