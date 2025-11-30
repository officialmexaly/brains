'use client';

import { useState } from 'react';
import { useJournalEntries } from '@/lib/hooks/useJournalEntries';
import Modal from '@/components/Modal';
import JournalForm from '@/components/JournalForm';
import { JournalEntry } from '@/types';

export default function CalendarJournalPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | undefined>();

  const { entries, loading, createEntry, updateEntry, deleteEntry } = useJournalEntries({});

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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEntriesForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toDateString();
    return entries.filter(entry => new Date(entry.date).toDateString() === dateStr);
  };

  const getSelectedDateEntries = () => {
    return getEntriesForDate(selectedDate);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
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

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Journal Calendar
            </h1>
            <button
              onClick={() => window.location.href = '/journal'}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to List View
            </button>
          </div>
          <p className="text-slate-600 text-lg">
            View your journal entries by date
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={previousMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-xl font-bold text-gray-900">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  const dayEntries = getEntriesForDate(day);
                  const isSelected = day && selectedDate && day.toDateString() === selectedDate.toDateString();
                  const isToday = day && day.toDateString() === new Date().toDateString();
                  const hasMood = dayEntries.length > 0 && dayEntries[0].mood;

                  return (
                    <button
                      key={index}
                      onClick={() => day && setSelectedDate(day)}
                      disabled={!day}
                      className={`aspect-square p-2 rounded-lg transition-all relative ${!day
                          ? 'invisible'
                          : isSelected
                            ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                            : isToday
                              ? 'bg-blue-50 text-blue-600 font-semibold'
                              : dayEntries.length > 0
                                ? 'bg-slate-50 hover:bg-slate-100'
                                : 'hover:bg-slate-50'
                        }`}
                    >
                      {day && (
                        <>
                          <div className="text-sm">{day.getDate()}</div>
                          {dayEntries.length > 0 && (
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                              {hasMood ? (
                                <div className="text-xs">{getMoodEmoji(dayEntries[0].mood)}</div>
                              ) : (
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected Date Entries */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedDate.toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h3>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : getSelectedDateEntries().length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-sm text-gray-600 mb-4">No entries for this date</p>
                  <button
                    onClick={handleCreateEntry}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Add Entry
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {getSelectedDateEntries().map(entry => (
                    <div
                      key={entry.id}
                      onClick={() => handleEditEntry(entry)}
                      className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-2xl">{getMoodEmoji(entry.mood)}</div>
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                          {entry.title}
                        </h4>
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
              )}
            </div>
          </div>
        </div>

        {/* Add Entry Button */}
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
