'use client';

import { useState } from 'react';

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  tags: string[];
  date: string;
  createdAt: string;
}

export default function JournalPage() {
  const [entries] = useState<JournalEntry[]>([
    {
      id: '1',
      title: 'A Productive Day',
      content: 'Today was incredibly productive. I completed all my tasks and even had time to work on my personal project. Feeling grateful for the progress...',
      mood: 'great',
      tags: ['productivity', 'gratitude'],
      date: 'April 12, 2025',
      createdAt: 'Today',
    },
    {
      id: '2',
      title: 'Learning New Things',
      content: 'Spent the day learning about React Server Components. The concepts are fascinating and I can see how they will improve my development workflow...',
      mood: 'good',
      tags: ['learning', 'development'],
      date: 'April 11, 2025',
      createdAt: 'Yesterday',
    },
    {
      id: '3',
      title: 'Reflections on Work-Life Balance',
      content: 'Been thinking a lot about work-life balance. It is important to make time for personal interests and relationships, not just work...',
      mood: 'okay',
      tags: ['reflection', 'balance'],
      date: 'April 10, 2025',
      createdAt: '2 days ago',
    },
    {
      id: '4',
      title: 'Weekend Plans',
      content: 'Planning a weekend getaway with friends. Looking forward to some time away from screens and work. Nature and good company are what I need...',
      mood: 'great',
      tags: ['plans', 'wellness'],
      date: 'April 8, 2025',
      createdAt: '4 days ago',
    },
    {
      id: '5',
      title: 'Challenges at Work',
      content: 'Facing some challenges with the current project. The timeline is tight and requirements keep changing. Need to stay focused and communicate better...',
      mood: 'okay',
      tags: ['work', 'challenges'],
      date: 'April 6, 2025',
      createdAt: '6 days ago',
    },
    {
      id: '6',
      title: 'Monthly Review',
      content: 'Looking back at the past month, I have accomplished a lot. Completed 3 major projects, learned new skills, and maintained good health habits...',
      mood: 'good',
      tags: ['review', 'achievements'],
      date: 'April 1, 2025',
      createdAt: '11 days ago',
    },
  ]);

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'great':
        return '😄';
      case 'good':
        return '🙂';
      case 'okay':
        return '😐';
      case 'bad':
        return '😞';
      case 'terrible':
        return '😢';
      default:
        return '📝';
    }
  };

  const getMoodColor = (mood?: string) => {
    switch (mood) {
      case 'great':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'okay':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'bad':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'terrible':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">Daily Journal</h1>
          <p className="text-slate-600 text-lg">
            Reflect on your day, track your mood, and document your journey.
          </p>
        </div>

        {/* Mood Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {['great', 'good', 'okay', 'bad', 'terrible'].map((mood) => {
            const count = entries.filter((e) => e.mood === mood).length;
            return (
              <div
                key={mood}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl p-4 border-2 ${getMoodColor(mood)} text-center hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer`}
              >
                <div className="text-3xl mb-2">{getMoodEmoji(mood)}</div>
                <p className="text-sm font-medium capitalize mb-1">{mood}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Calendar View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">All Entries</h2>
            <span className="text-sm text-gray-500">{entries.length} entries</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              List View
            </button>
            <button className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
              Calendar View
            </button>
          </div>
        </div>

        {/* Entries Timeline */}
        <div className="space-y-6">
          {entries.map((entry, index) => (
            <div key={entry.id}>
              {/* Date Divider */}
              {index === 0 || entries[index - 1].date !== entry.date ? (
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-sm font-semibold text-gray-900">{entry.date}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              ) : null}

              {/* Entry Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group hover:-translate-y-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getMoodEmoji(entry.mood)}</div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {entry.title}
                      </h3>
                      <p className="text-sm text-gray-500">{entry.createdAt}</p>
                    </div>
                  </div>
                  {entry.mood && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getMoodColor(entry.mood)}`}>
                      {entry.mood}
                    </span>
                  )}
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">
                  {entry.content}
                </p>

                <div className="flex items-center gap-2">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Inspirational Quote */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-100 shadow-lg">
          <p className="text-lg text-gray-700 italic mb-2">
            "The palest ink is better than the best memory."
          </p>
          <p className="text-sm text-gray-500">— Chinese Proverb</p>
        </div>

        {/* Add Entry Button */}
        <button className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all hover:scale-110 flex items-center justify-center text-3xl font-light hover:rotate-90 duration-300 group">
          <span className="group-hover:rotate-[-90deg] transition-transform duration-300">+</span>
        </button>
      </div>
    </div>
  );
}
