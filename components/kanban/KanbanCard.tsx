'use client';

import { Task } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface KanbanCardProps {
    task: Task;
    onDelete: (id: string) => void;
}

export default function KanbanCard({ task, onDelete }: KanbanCardProps) {
    const router = useRouter();
    const [showActions, setShowActions] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const priorityColors = {
        low: 'bg-green-100 text-green-700 border-green-300',
        medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        high: 'bg-red-100 text-red-700 border-red-300',
    };

    const categoryIcons: Record<string, string> = {
        Work: '💼',
        Personal: '🏠',
        Health: '❤️',
        Learning: '📚',
        Finance: '💰',
        Other: '📌',
    };

    const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;
    const hasSubtasks = totalSubtasks > 0;

    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
    const isDueSoon = task.dueDate && new Date(task.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/tasks/${task.id}/edit`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this task?')) {
            onDelete(task.id);
        }
    };

    const handleCardClick = () => {
        router.push(`/tasks/${task.id}`);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group ${isDragging ? 'shadow-xl ring-2 ring-blue-400' : ''
                }`}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
            onClick={handleCardClick}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 flex-1">
                    {task.title}
                </h3>
                {showActions && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handleEdit}
                            className="p-1 hover:bg-slate-100 rounded transition-colors"
                            title="Edit task"
                        >
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-1 hover:bg-red-50 rounded transition-colors"
                            title="Delete task"
                        >
                            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            {/* Description Preview */}
            {task.description && (
                <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {task.description}
                </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium flex items-center gap-1">
                    <span>{categoryIcons[task.category]}</span>
                    <span>{task.category}</span>
                </span>
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {task.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                            {tag}
                        </span>
                    ))}
                    {task.tags.length > 3 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                            +{task.tags.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Subtasks Progress */}
            {hasSubtasks && (
                <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                        <span>Subtasks</span>
                        <span>{completedSubtasks}/{totalSubtasks}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs">
                {/* Due Date */}
                {task.dueDate && (
                    <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : isDueSoon ? 'text-orange-600' : 'text-slate-600'
                        }`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                )}

                {/* Time Estimate */}
                {task.timeEstimate && (
                    <div className="flex items-center gap-1 text-slate-600">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{task.timeEstimate.value}{task.timeEstimate.unit.charAt(0)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
