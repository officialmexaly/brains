import { useTasks } from './useTasks';
import { useJournalEntries } from './useJournalEntries';
import { useKnowledgeArticles } from './useKnowledgeArticles';
import { useBrain } from './useBrain';
import { Task, JournalEntry, KnowledgeArticle, Note } from '@/types';

export interface DashboardStats {
    totalNotes: number;
    activeTasks: number;
    knowledgeArticles: number;
    journalEntries: number;
}

export interface RecentActivity {
    id: string;
    type: 'task' | 'journal' | 'article' | 'note';
    title: string;
    time: Date;
    data: Task | JournalEntry | KnowledgeArticle | Note;
}

export function useDashboardData() {
    const { tasks, isLoading: tasksLoading } = useTasks();
    const { entries: journalEntries, loading: journalLoading } = useJournalEntries({});
    const { articles, isLoading: articlesLoading } = useKnowledgeArticles();
    const { notes, isLoading: notesLoading } = useBrain();

    // Calculate stats
    const stats: DashboardStats = {
        totalNotes: notes.length,
        activeTasks: tasks.filter(t => t.status !== 'completed').length,
        knowledgeArticles: articles.length,
        journalEntries: journalEntries.length,
    };

    // Combine recent activity
    const recentActivity: RecentActivity[] = [];

    // Add recent tasks
    tasks.slice(0, 5).forEach(task => {
        recentActivity.push({
            id: task.id,
            type: 'task',
            title: task.title,
            time: task.createdAt,
            data: task,
        });
    });

    // Add recent journal entries
    journalEntries.slice(0, 5).forEach(entry => {
        recentActivity.push({
            id: entry.id,
            type: 'journal',
            title: entry.title,
            time: entry.createdAt,
            data: entry,
        });
    });

    // Add recent articles
    articles.slice(0, 5).forEach(article => {
        recentActivity.push({
            id: article.id,
            type: 'article',
            title: article.title,
            time: article.createdAt,
            data: article,
        });
    });

    // Add recent notes
    notes.slice(0, 5).forEach(note => {
        recentActivity.push({
            id: note.id,
            type: 'note',
            title: note.title,
            time: note.createdAt,
            data: note,
        });
    });

    // Sort by time (most recent first) and take top 10
    const sortedActivity = recentActivity
        .sort((a, b) => b.time.getTime() - a.time.getTime())
        .slice(0, 10);

    // Get upcoming tasks (next 5 tasks with due dates)
    const upcomingTasks = tasks
        .filter(t => t.dueDate && t.status !== 'completed')
        .sort((a, b) => {
            if (!a.dueDate || !b.dueDate) return 0;
            return a.dueDate.getTime() - b.dueDate.getTime();
        })
        .slice(0, 5);

    // Get today's tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysTasks = tasks.filter(t => {
        if (!t.dueDate || t.status === 'completed') return false;
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
    });

    // Get latest journal mood
    const latestJournalMood = journalEntries.length > 0 ? journalEntries[0].mood : undefined;

    return {
        stats,
        recentActivity: sortedActivity,
        upcomingTasks,
        todaysTasks,
        latestJournalMood,
        isLoading: tasksLoading || journalLoading || articlesLoading || notesLoading,
    };
}
