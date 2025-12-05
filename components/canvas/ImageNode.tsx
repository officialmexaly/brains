'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from 'reactflow';
import { Image as ImageIcon } from 'lucide-react';

interface ImageNodeData {
    imageUrl: string;
    caption?: string;
}

function ImageNode({ data, selected }: NodeProps<ImageNodeData>) {
    return (
        <div className="bg-white rounded-xl border-2 border-slate-200 shadow-lg hover:shadow-xl transition-shadow">
            <NodeResizer
                color="#ec4899"
                isVisible={selected}
                minWidth={150}
                minHeight={150}
            />
            {/* 4-sided handles */}
            <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-pink-500 !border-2 !border-white" id="top" />
            <Handle type="target" position={Position.Right} className="w-3 h-3 !bg-pink-500 !border-2 !border-white" id="right" />
            <Handle type="target" position={Position.Bottom} className="w-3 h-3 !bg-pink-500 !border-2 !border-white" id="bottom" />
            <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-pink-500 !border-2 !border-white" id="left" />
            <Handle type="source" position={Position.Top} className="w-3 h-3 !bg-pink-500 !border-2 !border-white" id="top-source" />
            <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-pink-500 !border-2 !border-white" id="right-source" />
            <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-pink-500 !border-2 !border-white" id="bottom-source" />
            <Handle type="source" position={Position.Left} className="w-3 h-3 !bg-pink-500 !border-2 !border-white" id="left-source" />

            <div className="p-2">
                {data.imageUrl ? (
                    <img
                        src={data.imageUrl}
                        alt={data.caption || 'Canvas image'}
                        className="w-full h-auto rounded-lg max-w-[300px] max-h-[300px] object-cover"
                    />
                ) : (
                    <div className="w-[200px] h-[150px] bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                )}

                {data.caption && (
                    <p className="text-xs text-gray-600 mt-2 text-center">
                        {data.caption}
                    </p>
                )}
            </div>

        </div>
    );
}

export default memo(ImageNode);
