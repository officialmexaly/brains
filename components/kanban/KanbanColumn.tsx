'use client';

import { Task } from '@/types';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
    id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'completed';
    tasks: Task[];
    color: string;
    icon: string;
    onDeleteTask: (id: string) => void;
}

export default function KanbanColumn({
    id,
    title,
    status,
    tasks,
    color,
    icon,
    onDeleteTask,
}: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id });

    const taskIds = tasks.map(task => task.id);

    return (
        <div className="flex flex-col h-full min-w-[350px] max-w-[350px]">
            {/* Column Header */}
            <div className={`flex items-center justify-between p-4 rounded-t-xl border-b-2 ${color}`}>
                <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <h2 className="font-semibold text-slate-900">{title}</h2>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs font-medium">
                        {tasks.length}
                    </span>
                </div>
            </div>

            {/* Column Body */}
            <div
                ref={setNodeRef}
                className={`flex-1 p-4 bg-slate-50 rounded-b-xl border border-t-0 border-slate-200 overflow-y-auto transition-colors ${isOver ? 'bg-blue-50 border-blue-300' : ''
                    }`}
                style={{ minHeight: '500px', maxHeight: 'calc(100vh - 300px)' }}
            >
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {tasks.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="text-4xl mb-3 opacity-50">{icon}</div>
                                <p className="text-sm text-slate-500">No tasks yet</p>
                                <p className="text-xs text-slate-400 mt-1">Drag tasks here or create a new one</p>
                            </div>
                        ) : (
                            tasks.map(task => (
                                <KanbanCard
                                    key={task.id}
                                    task={task}
                                    onDelete={onDeleteTask}
                                />
                            ))
                        )}
                    </div>
                </SortableContext>
            </div>
        </div>
    );
}
