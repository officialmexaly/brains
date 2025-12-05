'use client';

import { Task, KanbanColumn as KanbanColumnType } from '@/types';
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';
import KanbanColumn from './KanbanColumn';
import KanbanCard from './KanbanCard';

interface KanbanBoardProps {
    tasks: Task[];
    onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    onDeleteTask: (id: string) => Promise<void>;
}

const COLUMNS: Omit<KanbanColumnType, 'tasks'>[] = [
    {
        id: 'todo',
        title: 'To Do',
        status: 'todo',
        color: 'border-blue-500',
        icon: '📋',
    },
    {
        id: 'in-progress',
        title: 'In Progress',
        status: 'in-progress',
        color: 'border-purple-500',
        icon: '🔄',
    },
    {
        id: 'completed',
        title: 'Completed',
        status: 'completed',
        color: 'border-green-500',
        icon: '✅',
    },
];

export default function KanbanBoard({ tasks, onUpdateTask, onDeleteTask }: KanbanBoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Update local tasks when props change
    useState(() => {
        setLocalTasks(tasks);
    });

    const getTasksByStatus = (status: 'todo' | 'in-progress' | 'completed') => {
        return localTasks
            .filter(task => task.status === status)
            .sort((a, b) => (a.position || 0) - (b.position || 0));
    };

    const handleDragStart = (event: DragStartEvent) => {
        const task = localTasks.find(t => t.id === event.active.id);
        setActiveTask(task || null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Find the active task
        const activeTask = localTasks.find(t => t.id === activeId);
        if (!activeTask) return;

        // Determine the target status
        let targetStatus: 'todo' | 'in-progress' | 'completed' | null = null;

        // Check if over is a column
        const column = COLUMNS.find(col => col.id === overId);
        if (column) {
            targetStatus = column.status;
        } else {
            // Over is a task, get its status
            const overTask = localTasks.find(t => t.id === overId);
            if (overTask) {
                targetStatus = overTask.status;
            }
        }

        if (!targetStatus || activeTask.status === targetStatus) return;

        // Update local state optimistically
        setLocalTasks(prev => {
            return prev.map(task => {
                if (task.id === activeId) {
                    return { ...task, status: targetStatus! };
                }
                return task;
            });
        });
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTask = localTasks.find(t => t.id === activeId);
        if (!activeTask) return;

        // Determine target status
        let targetStatus: 'todo' | 'in-progress' | 'completed' = activeTask.status;
        const column = COLUMNS.find(col => col.id === overId);
        if (column) {
            targetStatus = column.status;
        } else {
            const overTask = localTasks.find(t => t.id === overId);
            if (overTask) {
                targetStatus = overTask.status;
            }
        }

        // Get tasks in the target column
        const targetTasks = localTasks.filter(t => t.status === targetStatus);
        const oldIndex = targetTasks.findIndex(t => t.id === activeId);
        const newIndex = targetTasks.findIndex(t => t.id === overId);

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            // Reorder within the same column
            const reorderedTasks = arrayMove(targetTasks, oldIndex, newIndex);

            // Update positions
            const updatedTasks = localTasks.map(task => {
                const newPosition = reorderedTasks.findIndex(t => t.id === task.id);
                if (newPosition !== -1) {
                    return { ...task, position: newPosition };
                }
                return task;
            });

            setLocalTasks(updatedTasks);

            // Update in database
            await onUpdateTask(activeId, {
                status: targetStatus,
                position: newIndex,
            });
        } else if (activeTask.status !== targetStatus) {
            // Moving to a different column
            const newPosition = targetTasks.length;

            setLocalTasks(prev => prev.map(task => {
                if (task.id === activeId) {
                    return { ...task, status: targetStatus, position: newPosition };
                }
                return task;
            }));

            await onUpdateTask(activeId, {
                status: targetStatus,
                position: newPosition,
            });
        }
    };

    const handleDeleteTask = async (id: string) => {
        await onDeleteTask(id);
        setLocalTasks(prev => prev.filter(t => t.id !== id));
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-6 overflow-x-auto pb-4">
                {COLUMNS.map(column => (
                    <KanbanColumn
                        key={column.id}
                        id={column.id}
                        title={column.title}
                        status={column.status}
                        tasks={getTasksByStatus(column.status)}
                        color={column.color}
                        icon={column.icon}
                        onDeleteTask={handleDeleteTask}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeTask ? (
                    <div className="rotate-3 scale-105">
                        <KanbanCard task={activeTask} onDelete={() => { }} />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
