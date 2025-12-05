'use client';

import { useBrain } from '@/lib/hooks/useBrain';
import { useTasks } from '@/lib/hooks/useTasks';
import { FileText, CheckSquare, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface CanvasSidebarProps {
    onDragStart: (event: React.DragEvent, nodeType: string, data: any) => void;
}

export default function CanvasSidebar({ onDragStart }: CanvasSidebarProps) {
    const { notes } = useBrain();
    const { tasks } = useTasks();
    const [searchQuery, setSearchQuery] = useState('');
    const [notesExpanded, setNotesExpanded] = useState(true);
    const [tasksExpanded, setTasksExpanded] = useState(true);

    const filteredNotes = notes.filter((note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredTasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Canvas Items</h2>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
                {/* Notes Section */}
                <div className="border-b border-gray-200">
                    <button
                        onClick={() => setNotesExpanded(!notesExpanded)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-gray-900">Notes</span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {filteredNotes.length}
                            </span>
                        </div>
                        {notesExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                    </button>

                    {notesExpanded && (
                        <div className="px-2 pb-2">
                            {filteredNotes.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-4">No notes found</p>
                            ) : (
                                filteredNotes.map((note) => (
                                    <div
                                        key={note.id}
                                        draggable
                                        onDragStart={(e) =>
                                            onDragStart(e, 'noteNode', {
                                                title: note.title,
                                                content: note.content,
                                                category: note.category,
                                                noteId: note.id,
                                            })
                                        }
                                        className="p-3 mb-2 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-move transition-colors border border-blue-100"
                                    >
                                        <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-1">
                                            {note.title}
                                        </h4>
                                        <span className="text-xs text-blue-700 font-semibold">
                                            {note.category}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Tasks Section */}
                <div className="border-b border-gray-200">
                    <button
                        onClick={() => setTasksExpanded(!tasksExpanded)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-purple-600" />
                            <span className="font-semibold text-gray-900">Tasks</span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                {filteredTasks.length}
                            </span>
                        </div>
                        {tasksExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        )}
                    </button>

                    {tasksExpanded && (
                        <div className="px-2 pb-2">
                            {filteredTasks.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-4">No tasks found</p>
                            ) : (
                                filteredTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) =>
                                            onDragStart(e, 'taskNode', {
                                                title: task.title,
                                                description: task.description,
                                                priority: task.priority,
                                                status: task.status,
                                                taskId: task.id,
                                            })
                                        }
                                        className="p-3 mb-2 bg-purple-50 hover:bg-purple-100 rounded-lg cursor-move transition-colors border border-purple-100"
                                    >
                                        <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-1">
                                            {task.title}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-purple-700 font-semibold">
                                                {task.priority.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gray-500">•</span>
                                            <span className="text-xs text-gray-600">
                                                {task.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="p-4">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                        <h3 className="font-semibold text-sm text-gray-900 mb-2">
                            💡 How to use
                        </h3>
                        <ul className="text-xs text-gray-600 space-y-1">
                            <li>• Drag items onto the canvas</li>
                            <li>• Connect nodes by dragging handles</li>
                            <li>• Double-click text to edit</li>
                            <li>• Changes auto-save</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
