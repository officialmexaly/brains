'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { CheckSquare, Square } from 'lucide-react';

interface TaskNodeData {
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'in-progress' | 'completed';
    taskId: string;
}

function TaskNode({ data, selected }: NodeProps<TaskNodeData>) {
    const [isCompleted, setIsCompleted] = useState(data.status === 'completed');

    const priorityColors = {
        low: 'bg-green-100 text-green-700',
        medium: 'bg-yellow-100 text-yellow-700',
        high: 'bg-red-100 text-red-700',
    };

    const statusColors = {
        todo: 'border-gray-300',
        'in-progress': 'border-blue-500',
        completed: 'border-green-500',
    };

    const handleToggle = () => {
        setIsCompleted(!isCompleted);
        // In a real implementation, you'd update the task status here
    };

    return (
        <div className={`bg-white rounded-xl border-2 ${statusColors[data.status]} shadow-lg hover:shadow-xl transition-all min-w-[250px] max-w-[300px]`}>
            <NodeResizer
                color="#a855f7"
                isVisible={selected}
                minWidth={200}
                minHeight={150}
            />
            {/* Connection Handles - All 4 sides */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 !bg-purple-500 !border-2 !border-white"
                id="top"
            />
            <Handle
                type="target"
                position={Position.Right}
                className="w-3 h-3 !bg-purple-500 !border-2 !border-white"
                id="right"
            />
            <Handle
                type="target"
                position={Position.Bottom}
                className="w-3 h-3 !bg-purple-500 !border-2 !border-white"
                id="bottom"
            />
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 !bg-purple-500 !border-2 !border-white"
                id="left"
            />

            {/* Source handles */}
            <Handle
                type="source"
                position={Position.Top}
                className="w-3 h-3 !bg-purple-500 !border-2 !border-white"
                id="top-source"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 !bg-purple-500 !border-2 !border-white"
                id="right-source"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 !bg-purple-500 !border-2 !border-white"
                id="bottom-source"
            />
            <Handle
                type="source"
                position={Position.Left}
                className="w-3 h-3 !bg-purple-500 !border-2 !border-white"
                id="left-source"
            />

            <div className="p-4">
                <div className="flex items-start gap-3 mb-2">
                    <button
                        onClick={handleToggle}
                        className="flex-shrink-0 mt-0.5 transition-colors"
                    >
                        {isCompleted ? (
                            <CheckSquare className="w-5 h-5 text-green-600" />
                        ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                        )}
                    </button>
                    <h3 className={`font-bold text-sm line-clamp-2 flex-1 ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {data.title}
                    </h3>
                </div>

                <p className="text-xs text-gray-600 mb-3 line-clamp-2 ml-8">
                    {data.description}
                </p>

                <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs rounded-lg font-semibold ${priorityColors[data.priority]}`}>
                        {data.priority.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">Task</span>
                </div>
            </div>
        </div>
    );
}

export default memo(TaskNode);
