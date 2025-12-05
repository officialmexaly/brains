import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Task } from '@/types';

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Fetch all tasks
    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedTasks: Task[] = (data || []).map((task) => ({
                id: task.id,
                title: task.title,
                description: task.description,
                category: task.category,
                priority: task.priority as 'low' | 'medium' | 'high',
                status: task.status as 'todo' | 'in-progress' | 'completed',
                dueDate: task.due_date ? new Date(task.due_date) : undefined,
                tags: task.tags || [],
                subtasks: task.subtasks || [],
                startDate: task.start_date ? new Date(task.start_date) : undefined,
                timeEstimate: task.time_estimate_value && task.time_estimate_unit
                    ? { value: task.time_estimate_value, unit: task.time_estimate_unit }
                    : undefined,
                reminder: task.reminder || undefined,
                notes: task.notes || undefined,
                position: task.position || 0,
                createdAt: new Date(task.created_at),
                updatedAt: new Date(task.updated_at),
            }));

            setTasks(formattedTasks);
            setError(null);
        } catch (err) {
            console.error('Error fetching tasks:', err);
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    };

    // Create new task
    const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('tasks')
                .insert([
                    {
                        user_id: user.id,
                        title: taskData.title,
                        description: taskData.description,
                        category: taskData.category,
                        priority: taskData.priority,
                        status: taskData.status,
                        due_date: taskData.dueDate?.toISOString(),
                        tags: taskData.tags || [],
                        subtasks: taskData.subtasks || [],
                        start_date: taskData.startDate?.toISOString(),
                        time_estimate_value: taskData.timeEstimate?.value, // Kept existing structure for consistency
                        time_estimate_unit: taskData.timeEstimate?.unit, // Kept existing structure for consistency
                        reminder: taskData.reminder,
                        notes: taskData.notes,
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            const newTask: Task = {
                id: data.id,
                title: data.title,
                description: data.description,
                category: data.category,
                priority: data.priority as 'low' | 'medium' | 'high',
                status: data.status as 'todo' | 'in-progress' | 'completed',
                dueDate: data.due_date ? new Date(data.due_date) : undefined,
                tags: data.tags || [],
                subtasks: data.subtasks || [],
                startDate: data.start_date ? new Date(data.start_date) : undefined,
                timeEstimate: data.time_estimate_value && data.time_estimate_unit
                    ? { value: data.time_estimate_value, unit: data.time_estimate_unit }
                    : undefined,
                reminder: data.reminder || undefined,
                notes: data.notes || undefined,
                position: data.position || 0,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
            };

            setTasks((prev) => [newTask, ...prev]);
            return newTask;
        } catch (err) {
            console.error('Error creating task:', err);
            throw err;
        }
    };

    // Update existing task
    const updateTask = async (id: string, taskData: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => {
        try {
            const updateData: any = {};
            if (taskData.title !== undefined) updateData.title = taskData.title;
            if (taskData.description !== undefined) updateData.description = taskData.description;
            if (taskData.category !== undefined) updateData.category = taskData.category;
            if (taskData.priority !== undefined) updateData.priority = taskData.priority;
            if (taskData.status !== undefined) updateData.status = taskData.status;
            if (taskData.dueDate !== undefined) updateData.due_date = taskData.dueDate?.toISOString();
            if (taskData.tags !== undefined) updateData.tags = taskData.tags;
            if (taskData.subtasks !== undefined) updateData.subtasks = taskData.subtasks;
            if (taskData.startDate !== undefined) updateData.start_date = taskData.startDate?.toISOString();
            if (taskData.timeEstimate !== undefined) {
                updateData.time_estimate_value = taskData.timeEstimate?.value;
                updateData.time_estimate_unit = taskData.timeEstimate?.unit;
            }
            if (taskData.reminder !== undefined) updateData.reminder = taskData.reminder;
            if (taskData.notes !== undefined) updateData.notes = taskData.notes;
            if (taskData.position !== undefined) updateData.position = taskData.position;

            const { data, error } = await supabase
                .from('tasks')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            const updatedTask: Task = {
                id: data.id,
                title: data.title,
                description: data.description,
                category: data.category,
                priority: data.priority as 'low' | 'medium' | 'high',
                status: data.status as 'todo' | 'in-progress' | 'completed',
                dueDate: data.due_date ? new Date(data.due_date) : undefined,
                tags: data.tags || [],
                subtasks: data.subtasks || [],
                startDate: data.start_date ? new Date(data.start_date) : undefined,
                timeEstimate: data.time_estimate_value && data.time_estimate_unit
                    ? { value: data.time_estimate_value, unit: data.time_estimate_unit }
                    : undefined,
                reminder: data.reminder || undefined,
                notes: data.notes || undefined,
                position: data.position || 0,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
            };

            setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)));
            return updatedTask;
        } catch (err) {
            console.error('Error updating task:', err);
            throw err;
        }
    };

    // Delete task
    const deleteTask = async (id: string) => {
        try {
            const { error } = await supabase.from('tasks').delete().eq('id', id);

            if (error) throw error;

            setTasks((prev) => prev.filter((task) => task.id !== id));
        } catch (err) {
            console.error('Error deleting task:', err);
            throw err;
        }
    };

    // Set up real-time subscription
    useEffect(() => {
        fetchTasks();

        const subscription = supabase
            .channel('tasks_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    const newTask: Task = {
                        id: payload.new.id,
                        title: payload.new.title,
                        description: payload.new.description,
                        category: payload.new.category,
                        priority: payload.new.priority as 'low' | 'medium' | 'high',
                        status: payload.new.status as 'todo' | 'in-progress' | 'completed',
                        dueDate: payload.new.due_date ? new Date(payload.new.due_date) : undefined,
                        tags: payload.new.tags || [],
                        subtasks: payload.new.subtasks || [],
                        startDate: payload.new.start_date ? new Date(payload.new.start_date) : undefined,
                        timeEstimate: payload.new.time_estimate_value && payload.new.time_estimate_unit
                            ? { value: payload.new.time_estimate_value, unit: payload.new.time_estimate_unit }
                            : undefined,
                        reminder: payload.new.reminder || undefined,
                        notes: payload.new.notes || undefined,
                        position: payload.new.position || 0,
                        createdAt: new Date(payload.new.created_at),
                        updatedAt: new Date(payload.new.updated_at),
                    };
                    setTasks((prev) => {
                        if (prev.some((t) => t.id === newTask.id)) return prev;
                        return [newTask, ...prev];
                    });
                } else if (payload.eventType === 'UPDATE') {
                    const updatedTask: Task = {
                        id: payload.new.id,
                        title: payload.new.title,
                        description: payload.new.description,
                        category: payload.new.category,
                        priority: payload.new.priority as 'low' | 'medium' | 'high',
                        status: payload.new.status as 'todo' | 'in-progress' | 'completed',
                        dueDate: payload.new.due_date ? new Date(payload.new.due_date) : undefined,
                        tags: payload.new.tags || [],
                        subtasks: payload.new.subtasks || [],
                        startDate: payload.new.start_date ? new Date(payload.new.start_date) : undefined,
                        timeEstimate: payload.new.time_estimate_value && payload.new.time_estimate_unit
                            ? { value: payload.new.time_estimate_value, unit: payload.new.time_estimate_unit }
                            : undefined,
                        reminder: payload.new.reminder || undefined,
                        notes: payload.new.notes || undefined,
                        createdAt: new Date(payload.new.created_at),
                        updatedAt: new Date(payload.new.updated_at),
                    };
                    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
                } else if (payload.eventType === 'DELETE') {
                    setTasks((prev) => prev.filter((task) => task.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return {
        tasks,
        isLoading,
        error,
        createTask,
        updateTask,
        deleteTask,
        refetch: fetchTasks,
    };
}
