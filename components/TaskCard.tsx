'use client';

import { Task } from '@/types';
import { useRouter } from 'next/navigation';

interface TaskCardProps {
    task: Task;
    showStatus?: boolean;
    onClick?: (taskId: string) => void;
}

export default function TaskCard({ task, showStatus = true, onClick }: TaskCardProps) {
    const router = useRouter();

    const handleClick = () => {
        if (onClick) {
            onClick(task.id);
        } else {
            router.push(`/tasks/${task.id}`);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-700 border-green-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500';
            case 'in-progress':
                return 'bg-blue-500';
            case 'todo':
                return 'bg-gray-300';
            default:
                return 'bg-gray-300';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'in-progress':
                return 'In Progress';
            case 'todo':
                return 'To Do';
            default:
                return status;
        }
    };

    const formatDueDate = (date?: Date) => {
        if (!date) return null;

        const now = new Date();
        const dueDate = new Date(date);
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-600' };
        } else if (diffDays === 0) {
            return { text: 'Due today', color: 'text-orange-600' };
        } else if (diffDays === 1) {
            return { text: 'Due tomorrow', color: 'text-yellow-600' };
        } else if (diffDays <= 7) {
            return { text: `Due in ${diffDays} days`, color: 'text-blue-600' };
        } else {
            return {
                text: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                color: 'text-gray-500',
            };
        }
    };

    const dueDateInfo = formatDueDate(task.dueDate);
    const isCompleted = task.status === 'completed';

    return (
        <div
            onClick={handleClick}
            className={`bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer hover:-translate-y-1 ${isCompleted ? 'opacity-75' : ''
                }`}
        >
            <div className="flex items-start gap-4">
                {/* Status Indicator */}
                <div className="flex items-center h-6 flex-shrink-0">
                    {isCompleted ? (
                        <div className={`w-5 h-5 rounded-full ${getStatusColor(task.status)} flex items-center justify-center text-white text-xs`}>
                            ✓
                        </div>
                    ) : (
                        <div className={`w-5 h-5 rounded-full border-2 ${task.status === 'in-progress' ? getStatusColor(task.status) : 'border-gray-300'}`} />
                    )}
                </div>

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className={`font-semibold text-gray-900 break-words ${isCompleted ? 'line-through' : ''}`}>
                            {task.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                        </span>
                    </div>

                    <p className={`text-sm text-gray-600 mb-3 line-clamp-2 break-words ${isCompleted ? 'line-through' : ''}`}>
                        {task.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="text-gray-500 flex items-center gap-1">
                            📁 {task.category}
                        </span>

                        {dueDateInfo && (
                            <span className={`flex items-center gap-1 ${dueDateInfo.color}`}>
                                📅 {dueDateInfo.text}
                            </span>
                        )}

                        {showStatus && !isCompleted && task.status === 'in-progress' && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                {getStatusLabel(task.status)}
                            </span>
                        )}

                        {isCompleted && (
                            <span className="text-green-600 flex items-center gap-1">
                                ✓ Completed
                            </span>
                        )}

                        {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1">
                                {task.tags.slice(0, 2).map((tag) => (
                                    <span key={tag} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                                        #{tag}
                                    </span>
                                ))}
                                {task.tags.length > 2 && (
                                    <span className="text-gray-500 text-xs">+{task.tags.length - 2}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
