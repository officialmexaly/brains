'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { Type } from 'lucide-react';

interface TextNodeData {
    text: string;
}

function TextNode({ data, id, selected }: NodeProps<TextNodeData>) {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(data.text);

    const handleDoubleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        // In a real implementation, you'd update the node data here
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg border-2 border-yellow-200 shadow-md hover:shadow-lg transition-shadow p-3 min-w-[150px] max-w-[250px]">
            <NodeResizer
                color="#eab308"
                isVisible={selected}
                minWidth={100}
                minHeight={60}
            />
            {/* 4-sided handles */}
            <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-yellow-500 !border-2 !border-white" id="top" />
            <Handle type="target" position={Position.Right} className="w-3 h-3 !bg-yellow-500 !border-2 !border-white" id="right" />
            <Handle type="target" position={Position.Bottom} className="w-3 h-3 !bg-yellow-500 !border-2 !border-white" id="bottom" />
            <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-yellow-500 !border-2 !border-white" id="left" />
            <Handle type="source" position={Position.Top} className="w-3 h-3 !bg-yellow-500 !border-2 !border-white" id="top-source" />
            <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-yellow-500 !border-2 !border-white" id="right-source" />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-yellow-500 !border-2 !border-white" id="bottom-source" />
            <Handle type="source" position={Position.Left} className="w-3 h-3 !bg-yellow-500 !border-2 !border-white" id="left-source" />

            <div className="flex items-start gap-2">
                <Type className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-1" />
                {isEditing ? (
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        className="flex-1 text-sm text-gray-900 bg-transparent border-none outline-none resize-none font-medium min-h-[60px]"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <p
                        onDoubleClick={handleDoubleClick}
                        className="flex-1 text-sm text-gray-900 cursor-text font-medium whitespace-pre-wrap"
                    >
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
}

export default memo(TextNode);
