'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from '@/components/Calendar';
import { useCalendarEvents } from '@/lib/hooks/useCalendarEvents';
import { Task, JournalEntry } from '@/types';
import TaskCard from '@/components/TaskCard';

export default function CalendarPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const {
    eventsMap,
    getTasksForDate,
    getJournalEntriesForDate,
    isLoading,
    showTasks,
    setShowTasks,
    showJournal,
    setShowJournal,
  } = useCalendarEvents();

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const selectedTasks = getTasksForDate(selectedDate);
  const selectedJournalEntries = getJournalEntriesForDate(selectedDate);

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

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading calendar...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
            Calendar
          </h1>
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg">
            View your tasks, journal entries, and important dates in one place.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => setShowTasks(!showTasks)}
            className={`px-4 py-2 rounded-xl font-medium transition-all text-sm ${showTasks
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Tasks
            </span>
          </button>
          <button
            onClick={() => setShowJournal(!showJournal)}
            className={`px-4 py-2 rounded-xl font-medium transition-all text-sm ${showJournal
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Journal
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Calendar
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              onPreviousMonth={previousMonth}
              onNextMonth={nextMonth}
              eventsMap={eventsMap}
            />
          </div>

          {/* Selected Date Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </h3>

              {selectedTasks.length === 0 && selectedJournalEntries.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📅</div>
                  <p className="text-sm text-gray-600 mb-4">No events for this date</p>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => router.push('/tasks/new')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                    >
                      Add Task
                    </button>
                    <button
                      onClick={() => router.push('/journal/new')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                    >
                      Add Journal Entry
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {/* Tasks */}
                  {selectedTasks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Tasks ({selectedTasks.length})
                      </h4>
                      <div className="space-y-2">
                        {selectedTasks.map((task) => (
                          <div key={task.id} className="scale-95 origin-left">
                            <TaskCard task={task} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Journal Entries */}
                  {selectedJournalEntries.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Journal Entries ({selectedJournalEntries.length})
                      </h4>
                      <div className="space-y-3">
                        {selectedJournalEntries.map((entry) => (
                          <div
                            key={entry.id}
                            onClick={() => router.push(`/journal/${entry.id}`)}
                            className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="text-2xl">{getMoodEmoji(entry.mood)}</div>
                              <h5 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors text-sm">
                                {entry.title}
                              </h5>
                            </div>
                            <div
                              className="text-xs text-gray-600 line-clamp-2"
                              dangerouslySetInnerHTML={{ __html: entry.content }}
                            />
                            {entry.mood && (
                              <span className={`inline-block mt-2 px-2 py-1 rounded-md text-xs font-medium border capitalize ${getMoodColor(entry.mood)}`}>
                                {entry.mood}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

