import { useState, useEffect } from 'react';
import { useTasks } from './useTasks';
import { useJournalEntries } from './useJournalEntries';
import { Task, JournalEntry } from '@/types';

export interface CalendarEvent {
    id: string;
    type: 'task' | 'journal';
    date: Date;
    title: string;
    data: Task | JournalEntry;
}

export interface CalendarEventsMap {
    [dateKey: string]: CalendarEvent[];
}

export function useCalendarEvents() {
    const { tasks, isLoading: tasksLoading } = useTasks();
    const { entries: journalEntries, loading: journalLoading } = useJournalEntries({});
    const [eventsMap, setEventsMap] = useState<CalendarEventsMap>({});
    const [showTasks, setShowTasks] = useState(true);
    const [showJournal, setShowJournal] = useState(true);

    useEffect(() => {
        const map: CalendarEventsMap = {};

        // Add tasks with due dates
        if (showTasks) {
            tasks.forEach((task) => {
                if (task.dueDate) {
                    const dateKey = task.dueDate.toDateString();
                    if (!map[dateKey]) {
                        map[dateKey] = [];
                    }
                    map[dateKey].push({
                        id: `task-${task.id}`,
                        type: 'task',
                        date: task.dueDate,
                        title: task.title,
                        data: task,
                    });
                }
            });
        }

        // Add journal entries
        if (showJournal) {
            journalEntries.forEach((entry) => {
                const dateKey = entry.date.toDateString();
                if (!map[dateKey]) {
                    map[dateKey] = [];
                }
                map[dateKey].push({
                    id: `journal-${entry.id}`,
                    type: 'journal',
                    date: entry.date,
                    title: entry.title,
                    data: entry,
                });
            });
        }

        setEventsMap(map);
    }, [tasks, journalEntries, showTasks, showJournal]);

    const getEventsForDate = (date: Date): CalendarEvent[] => {
        const dateKey = date.toDateString();
        return eventsMap[dateKey] || [];
    };

    const getTasksForDate = (date: Date): Task[] => {
        return getEventsForDate(date)
            .filter((event) => event.type === 'task')
            .map((event) => event.data as Task);
    };

    const getJournalEntriesForDate = (date: Date): JournalEntry[] => {
        return getEventsForDate(date)
            .filter((event) => event.type === 'journal')
            .map((event) => event.data as JournalEntry);
    };

    return {
        eventsMap,
        getEventsForDate,
        getTasksForDate,
        getJournalEntriesForDate,
        isLoading: tasksLoading || journalLoading,
        showTasks,
        setShowTasks,
        showJournal,
        setShowJournal,
    };
}
