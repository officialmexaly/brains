'use client';

import { MousePointer2, Square, Circle, Type, StickyNote, Image as ImageIcon, Hand } from 'lucide-react';
import { useState } from 'react';

type Tool = 'select' | 'rectangle' | 'circle' | 'text' | 'note' | 'task' | 'image' | 'pan';

interface CanvasToolbarProps {
    selectedTool: Tool;
    onToolChange: (tool: Tool) => void;
}

export default function CanvasToolbar({ selectedTool, onToolChange }: CanvasToolbarProps) {
    const tools = [
        { id: 'select' as Tool, icon: MousePointer2, label: 'Select' },
        { id: 'pan' as Tool, icon: Hand, label: 'Pan' },
        { id: 'rectangle' as Tool, icon: Square, label: 'Rectangle' },
        { id: 'circle' as Tool, icon: Circle, label: 'Circle' },
        { id: 'text' as Tool, icon: Type, label: 'Text' },
        { id: 'note' as Tool, icon: StickyNote, label: 'Note' },
        { id: 'task' as Tool, icon: Square, label: 'Task' },
        { id: 'image' as Tool, icon: ImageIcon, label: 'Image' },
    ];

    return (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-xl shadow-2xl border-2 border-gray-200 p-2 flex flex-col gap-1">
            {tools.map((tool) => {
                const Icon = tool.icon;
                const isSelected = selectedTool === tool.id;

                return (
                    <button
                        key={tool.id}
                        onClick={() => onToolChange(tool.id)}
                        className={`p-3 rounded-lg transition-all group relative ${isSelected
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        title={tool.label}
                    >
                        <Icon className="w-5 h-5" />

                        {/* Tooltip */}
                        <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {tool.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
