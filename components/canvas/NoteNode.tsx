'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { FileText } from 'lucide-react';

interface NoteNodeData {
    title: string;
    content: string;
    category: string;
    noteId: string;
}

function NoteNode({ data, selected }: NodeProps<NoteNodeData>) {
    // Strip HTML tags for preview
    const getTextPreview = (html: string): string => {
        const text = html.replace(/<[^>]*>/g, '');
        const textarea = typeof document !== 'undefined' ? document.createElement('textarea') : null;
        if (textarea) {
            textarea.innerHTML = text;
            return textarea.value;
        }
        return text;
    };

    const preview = getTextPreview(data.content).slice(0, 100);

    return (
        <div className="bg-white rounded-xl border-2 border-slate-200 shadow-lg hover:shadow-xl transition-shadow min-w-[250px] max-w-[300px]">
            <NodeResizer
                color="#3b82f6"
                isVisible={selected}
                minWidth={200}
                minHeight={150}
            />
            {/* Connection Handles - All 4 sides */}
            <Handle
                type="target"
                position={Position.Top}
                className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
                id="top"
            />
            <Handle
                type="target"
                position={Position.Right}
                className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
                id="right"
            />
            <Handle
                type="target"
                position={Position.Bottom}
                className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
                id="bottom"
            />
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
                id="left"
            />

            {/* Source handles for outgoing connections */}
            <Handle
                type="source"
                position={Position.Top}
                className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
                id="top-source"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
                id="right-source"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
                id="bottom-source"
            />
            <Handle
                type="source"
                position={Position.Left}
                className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
                id="left-source"
            />

            <div className="p-4">
                <div className="flex items-start gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 flex-1">
                        {data.title}
                    </h3>
                </div>

                <p className="text-xs text-gray-600 mb-3 line-clamp-3">
                    {preview}...
                </p>

                <div className="flex items-center justify-between">
                    <span className="px-2 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs rounded-lg font-semibold">
                        {data.category}
                    </span>
                    <span className="text-xs text-gray-400">Note</span>
                </div>
            </div>
        </div>
    );
}

export default memo(NoteNode);
