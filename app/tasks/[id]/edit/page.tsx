'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTasks } from '@/lib/hooks/useTasks';
import { toast } from 'sonner';

const CATEGORIES = [
    { value: 'Work', label: 'Work', icon: '💼' },
    { value: 'Personal', label: 'Personal', icon: '🏠' },
    { value: 'Health', label: 'Health', icon: '❤️' },
    { value: 'Learning', label: 'Learning', icon: '📚' },
    { value: 'Finance', label: 'Finance', icon: '💰' },
    { value: 'Other', label: 'Other', icon: '📌' },
];

const PRIORITIES = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700 border-green-300' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-700 border-red-300' },
];

const STATUSES = [
    { value: 'todo', label: 'To Do', icon: '📋' },
    { value: 'in-progress', label: 'In Progress', icon: '🔄' },
    { value: 'completed', label: 'Completed', icon: '✅' },
];

export default function EditTaskPage() {
    const router = useRouter();
    const params = useParams();
    const { tasks, updateTask, deleteTask } = useTasks();
    const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Work');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [status, setStatus] = useState<'todo' | 'in-progress' | 'completed'>('todo');
    const [dueDate, setDueDate] = useState('');

    const task = tasks.find((t) => t.id === params.id);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description);
            setCategory(task.category);
            setPriority(task.priority);
            setStatus(task.status);
            setDueDate(task.dueDate ? task.dueDate.toISOString().split('T')[0] : '');
            setLoading(false);
        } else if (tasks.length > 0) {
            setLoading(false);
        }
    }, [task, tasks]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSaving || !task) return;

        if (!title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        if (!description.trim()) {
            toast.error('Please enter a description');
            return;
        }

        try {
            setIsSaving(true);

            await updateTask(task.id, {
                title: title.trim(),
                description: description.trim(),
                category,
                priority,
                status,
                dueDate: dueDate ? new Date(dueDate) : undefined,
            });

            toast.success('Task updated successfully');
            router.push(`/tasks/${task.id}`);
        } catch (err) {
            console.error('Error updating task:', err);
            toast.error('Failed to update task');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!task) return;
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            await deleteTask(task.id);
            toast.success('Task deleted successfully');
            router.push('/tasks');
        } catch (err) {
            console.error('Error deleting task:', err);
            toast.error('Failed to delete task');
        }
    };

    const handleCancel = () => {
        if (task) {
            router.push(`/tasks/${task.id}`);
        } else {
            router.push('/tasks');
        }
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-screen-xl mx-auto">
                    <div className="text-center py-12 sm:py-20">
                        <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600 text-sm sm:text-base">Loading task...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-12 text-center shadow-lg">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">Task Not Found</h3>
                        <p className="text-slate-600 mb-6">The task you're trying to edit doesn't exist.</p>
                        <button
                            onClick={() => router.push('/tasks')}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
                        >
                            Back to Tasks
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-screen-xl mx-auto">
                {/* Header */}
                <div className="mb-4 sm:mb-6">
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="text-sm sm:text-base">Back to Tasks</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Task Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
                        {/* Task Header */}
                        <div className="p-4 sm:p-6 border-b border-slate-200/60">
                            <div className="mb-4">
                                <div className="flex-1 mb-4">
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="text-2xl sm:text-3xl font-bold text-slate-900 bg-transparent border-none focus:outline-none w-full placeholder:text-slate-400"
                                        placeholder="Task title..."
                                        required
                                    />
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                                        <span className={`px-2.5 py-1 rounded-md font-medium text-xs whitespace-nowrap ${PRIORITIES.find(p => p.value === priority)?.color}`}>
                                            {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                                        </span>
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-900 rounded-md font-medium text-xs whitespace-nowrap flex items-center gap-1">
                                            <span>{CATEGORIES.find(c => c.value === category)?.icon}</span>
                                            {category}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium text-sm sm:text-base order-2 sm:order-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-2"
                                    >
                                        {isSaving ? 'Updating...' : 'Update Task'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-slate-200/60">
                            <div className="flex px-4 sm:px-6">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('overview')}
                                    className={`px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'overview'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Overview
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('details')}
                                    className={`px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'details'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Details
                                </button>
                            </div>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'overview' && (
                            <div className="p-4 sm:p-8">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 min-h-[200px]"
                                        placeholder="Describe your task..."
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'details' && (
                            <div className="p-4 sm:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                        >
                                            {CATEGORIES.map((cat) => (
                                                <option key={cat.value} value={cat.value}>
                                                    {cat.icon} {cat.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Priority
                                        </label>
                                        <select
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value as any)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                        >
                                            {PRIORITIES.map((p) => (
                                                <option key={p.value} value={p.value}>
                                                    {p.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value as any)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                        >
                                            {STATUSES.map((s) => (
                                                <option key={s.value} value={s.value}>
                                                    {s.icon} {s.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Due Date (Optional)
                                        </label>
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                        />
                                    </div>

                                    {/* Delete Button */}
                                    <div className="pt-4 border-t border-slate-200">
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all font-medium"
                                        >
                                            Delete Task
                                        </button>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Tip</h4>
                                        <p className="text-sm text-blue-700">
                                            Set a priority and due date to help you stay organized and focused on what matters most.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
