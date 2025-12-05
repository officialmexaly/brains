'use client';

import { useParams, useRouter } from 'next/navigation';
import { useTasks } from '@/lib/hooks/useTasks';
import { useState } from 'react';
import { toast } from 'sonner';

const PRIORITIES = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-700' },
];

const STATUSES = [
    { value: 'todo', label: 'To Do', icon: '📋', color: 'bg-gray-100 text-gray-700' },
    { value: 'in-progress', label: 'In Progress', icon: '🔄', color: 'bg-blue-100 text-blue-700' },
    { value: 'completed', label: 'Completed', icon: '✅', color: 'bg-green-100 text-green-700' },
];

export default function ViewTaskPage() {
    const params = useParams();
    const router = useRouter();
    const { tasks, deleteTask, isLoading } = useTasks();
    const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');

    const task = tasks.find((t) => t.id === params.id);

    const handleDelete = async () => {
        if (!task) return;
        if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteTask(task.id);
            toast.success('Task deleted successfully');
            router.push('/tasks');
        } catch (err) {
            console.error('Error deleting task:', err);
            toast.error('Failed to delete task');
        }
    };

    const handleEdit = () => {
        if (task) {
            router.push(`/tasks/${task.id}/edit`);
        }
    };

    const getPriorityData = (priority: string) => {
        return PRIORITIES.find((p) => p.value === priority);
    };

    const getStatusData = (status: string) => {
        return STATUSES.find((s) => s.value === status);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading task...</p>
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
                        <p className="text-slate-600 mb-6">
                            The task you're looking for doesn't exist or has been deleted.
                        </p>
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

    const priorityData = getPriorityData(task.priority);
    const statusData = getStatusData(task.status);

    return (
        <div className="min-h-screen bg-white text-black">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Header Navigation */}
                <div className="mb-6 sm:mb-8">
                    <button
                        onClick={() => router.push('/tasks')}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors text-sm font-medium"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Tasks
                    </button>

                    {/* Title and Meta */}
                    <div className="mb-6">
                        <h1 className="text-3xl sm:text-4xl font-bold text-black mb-4 leading-tight">{task.title}</h1>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-800">
                            {statusData && (
                                <span className={`px-2.5 py-1 ${statusData.color} rounded-md font-medium text-xs whitespace-nowrap flex items-center gap-1`}>
                                    <span>{statusData.icon}</span>
                                    {statusData.label}
                                </span>
                            )}
                            {priorityData && (
                                <span className={`px-2.5 py-1 ${priorityData.color} rounded-md font-medium text-xs whitespace-nowrap`}>
                                    {priorityData.label} Priority
                                </span>
                            )}
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-900 rounded-md font-medium text-xs whitespace-nowrap">
                                {task.category}
                            </span>
                            {task.dueDate && (
                                <>
                                    <span className="text-slate-400">•</span>
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        Due {task.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 pb-6 border-b border-slate-200">
                        <button
                            onClick={handleEdit}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all text-sm font-medium flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 mb-6">
                    <div className="flex gap-1">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'details'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Details
                        </button>
                        <button
                            onClick={() => setActiveTab('activity')}
                            className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'activity'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Activity
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'details' && (
                    <div className="pb-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Task Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Task Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Description</label>
                                        <p className="mt-1 text-slate-900 whitespace-pre-wrap">{task.description}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Category</label>
                                        <p className="mt-1 text-slate-900">{task.category}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Priority</label>
                                        <p className="mt-1">
                                            <span className={`px-3 py-1.5 ${priorityData?.color} rounded-lg text-sm font-medium`}>
                                                {priorityData?.label}
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Status</label>
                                        <p className="mt-1">
                                            <span className={`px-3 py-1.5 ${statusData?.color} rounded-lg text-sm font-medium flex items-center gap-1 w-fit`}>
                                                <span>{statusData?.icon}</span>
                                                {statusData?.label}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-4">Metadata</h3>
                                <div className="space-y-4">
                                    {task.dueDate && (
                                        <div>
                                            <label className="text-sm font-medium text-slate-600">Due Date</label>
                                            <p className="mt-1 text-slate-900">
                                                {task.dueDate.toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Created</label>
                                        <p className="mt-1 text-slate-900">
                                            {task.createdAt.toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-slate-600">Last Updated</label>
                                        <p className="mt-1 text-slate-900">
                                            {task.updatedAt.toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="pb-12">
                        <div className="text-center py-12">
                            <div className="text-5xl mb-4">📊</div>
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Activity Timeline</h3>
                            <p className="text-slate-600">Task activity and history will appear here</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
