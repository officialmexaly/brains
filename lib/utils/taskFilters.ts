import { Task } from '@/types';

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
    const today = new Date();
    return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
    );
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate > today;
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
}

/**
 * Filter tasks for today's view
 * Includes: tasks due today OR tasks without due date that are not completed
 */
export function getTodayTasks(tasks: Task[]): Task[] {
    return tasks.filter((task) => {
        // Exclude completed tasks
        if (task.status === 'completed') return false;

        // Include tasks due today
        if (task.dueDate && isToday(task.dueDate)) return true;

        // Include tasks without due date (ongoing tasks)
        if (!task.dueDate) return true;

        return false;
    });
}

/**
 * Filter tasks for upcoming view
 * Includes: tasks with future due dates, sorted by due date
 */
export function getUpcomingTasks(tasks: Task[]): Task[] {
    return tasks
        .filter((task) => {
            // Exclude completed tasks
            if (task.status === 'completed') return false;

            // Include tasks with future due dates
            return task.dueDate && isFuture(task.dueDate);
        })
        .sort((a, b) => {
            // Sort by due date (earliest first)
            if (!a.dueDate || !b.dueDate) return 0;
            return a.dueDate.getTime() - b.dueDate.getTime();
        });
}

/**
 * Filter tasks for completed view
 */
export function getCompletedTasks(tasks: Task[]): Task[] {
    return tasks
        .filter((task) => task.status === 'completed')
        .sort((a, b) => {
            // Sort by updated date (most recent first)
            return b.updatedAt.getTime() - a.updatedAt.getTime();
        });
}

/**
 * Filter tasks for overdue view
 */
export function getOverdueTasks(tasks: Task[]): Task[] {
    return tasks.filter((task) => {
        // Exclude completed tasks
        if (task.status === 'completed') return false;

        // Include tasks with past due dates
        return task.dueDate && isPast(task.dueDate);
    });
}

/**
 * Get task counts by status
 */
export function getTaskCounts(tasks: Task[]) {
    return {
        total: tasks.length,
        todo: tasks.filter((t) => t.status === 'todo').length,
        inProgress: tasks.filter((t) => t.status === 'in-progress').length,
        completed: tasks.filter((t) => t.status === 'completed').length,
        today: getTodayTasks(tasks).length,
        upcoming: getUpcomingTasks(tasks).length,
        overdue: getOverdueTasks(tasks).length,
    };
}

/**
 * Filter tasks by priority
 */
export function filterByPriority(tasks: Task[], priority: 'low' | 'medium' | 'high'): Task[] {
    return tasks.filter((task) => task.priority === priority);
}

/**
 * Filter tasks by category
 */
export function filterByCategory(tasks: Task[], category: string): Task[] {
    return tasks.filter((task) => task.category === category);
}

/**
 * Search tasks by query
 */
export function searchTasks(tasks: Task[], query: string): Task[] {
    const lowerQuery = query.toLowerCase();
    return tasks.filter((task) => {
        return (
            task.title.toLowerCase().includes(lowerQuery) ||
            task.description.toLowerCase().includes(lowerQuery) ||
            task.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
        );
    });
}
