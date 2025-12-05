'use client';

import { useTasks } from '@/lib/hooks/useTasks';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function KanbanPage() {
    const router = useRouter();
    const { tasks, isLoading, updateTask, deleteTask } = useTasks();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
        const matchesCategory = filterCategory === 'all' || task.category === filterCategory;

        return matchesSearch && matchesPriority && matchesCategory;
    });

    const categories = Array.from(new Set(tasks.map(t => t.category)));
    const hasActiveFilters = searchQuery || filterPriority !== 'all' || filterCategory !== 'all';

    const clearFilters = () => {
        setSearchQuery('');
        setFilterPriority('all');
        setFilterCategory('all');
    };

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-screen-2xl mx-auto">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-slate-600">Loading your tasks...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-screen-2xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Kanban Board</h1>
                            <p className="text-slate-600 mt-1">Drag and drop tasks to update their status</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => router.push('/tasks')}
                                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                                List View
                            </button>
                            <button
                                onClick={() => router.push('/tasks/new')}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                New Task
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Search */}
                            <div className="sm:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search tasks..."
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            {/* Priority Filter */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                                <select
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {hasActiveFilters && (
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-sm text-slate-600">Active filters:</span>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Kanban Board */}
                {filteredTasks.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No tasks found</h3>
                        <p className="text-slate-600 mb-6">
                            {hasActiveFilters
                                ? 'Try adjusting your filters or search query'
                                : 'Get started by creating your first task'}
                        </p>
                        {!hasActiveFilters && (
                            <button
                                onClick={() => router.push('/tasks/new')}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium"
                            >
                                Create Your First Task
                            </button>
                        )}
                    </div>
                ) : (
                    <KanbanBoard
                        tasks={filteredTasks}
                        onUpdateTask={async (id, updates) => { await updateTask(id, updates); }}
                        onDeleteTask={deleteTask}
                    />
                )}
            </div>
        </div>
    );
}
