'use client';

import { CalendarEventsMap } from '@/lib/hooks/useCalendarEvents';

interface CalendarProps {
    currentMonth: Date;
    selectedDate: Date | null;
    onDateSelect: (date: Date) => void;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
    eventsMap: CalendarEventsMap;
}

export default function Calendar({
    currentMonth,
    selectedDate,
    onDateSelect,
    onPreviousMonth,
    onNextMonth,
    eventsMap,
}: CalendarProps) {
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

    const days = getDaysInMonth(currentMonth);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={onPreviousMonth}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                    aria-label="Previous month"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h2 className="text-xl font-bold text-gray-900">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                    onClick={onNextMonth}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                    aria-label="Next month"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Week Days */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                    const dateKey = day?.toDateString();
                    const events = dateKey ? eventsMap[dateKey] || [] : [];
                    const isSelected = day && selectedDate && day.toDateString() === selectedDate.toDateString();
                    const isToday = day && day.toDateString() === new Date().toDateString();

                    const taskCount = events.filter(e => e.type === 'task').length;
                    const journalCount = events.filter(e => e.type === 'journal').length;
                    const hasEvents = events.length > 0;

                    return (
                        <button
                            key={index}
                            onClick={() => day && onDateSelect(day)}
                            disabled={!day}
                            className={`aspect-square p-2 rounded-lg transition-all relative min-h-[60px] flex flex-col items-center justify-start ${!day
                                    ? 'invisible'
                                    : isSelected
                                        ? 'bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2'
                                        : isToday
                                            ? 'bg-blue-50 text-blue-600 font-semibold ring-2 ring-blue-200'
                                            : hasEvents
                                                ? 'bg-slate-50 hover:bg-slate-100'
                                                : 'hover:bg-slate-50'
                                }`}
                        >
                            {day && (
                                <>
                                    <div className={`text-sm font-medium mb-1 ${isSelected ? 'text-white' : ''}`}>
                                        {day.getDate()}
                                    </div>
                                    {hasEvents && (
                                        <div className="flex flex-col gap-0.5 items-center w-full">
                                            {taskCount > 0 && (
                                                <div className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {taskCount} task{taskCount > 1 ? 's' : ''}
                                                </div>
                                            )}
                                            {journalCount > 0 && (
                                                <div className={`text-[10px] px-1.5 py-0.5 rounded-full ${isSelected
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {journalCount} entry
                                                </div>
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
    );
}
