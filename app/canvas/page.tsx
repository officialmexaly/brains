'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    addEdge,
    useNodesState,
    useEdgesState,
    Connection,
    Edge,
    Node,
    ReactFlowProvider,
    SelectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Save, Plus, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

import NoteNode from '@/components/canvas/NoteNode';
import TaskNode from '@/components/canvas/TaskNode';
import ImageNode from '@/components/canvas/ImageNode';
import TextNode from '@/components/canvas/TextNode';
import CanvasToolbar from '@/components/canvas/CanvasToolbar';
import { useCanvases } from '@/lib/hooks/useCanvases';

const nodeTypes = {
    noteNode: NoteNode,
    taskNode: TaskNode,
    imageNode: ImageNode,
    textNode: TextNode,
};

type Tool = 'select' | 'rectangle' | 'circle' | 'text' | 'note' | 'task' | 'image' | 'pan';

function CanvasFlow() {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedTool, setSelectedTool] = useState<Tool>('select');

    const {
        canvases,
        currentCanvas,
        isLoading,
        createCanvas,
        updateCanvas,
        loadCanvas,
        setCurrentCanvas,
    } = useCanvases();

    // Load the first canvas or create a default one
    useEffect(() => {
        if (!isLoading && canvases.length > 0 && !currentCanvas) {
            loadCanvas(canvases[0].id);
        } else if (!isLoading && canvases.length === 0) {
            createCanvas('My First Canvas').then((canvas) => {
                setCurrentCanvas(canvas);
            });
        }
    }, [isLoading, canvases, currentCanvas]);

    // Load canvas data when currentCanvas changes
    useEffect(() => {
        if (currentCanvas) {
            setNodes(currentCanvas.data.nodes || []);
            setEdges(currentCanvas.data.edges || []);
        }
    }, [currentCanvas]);

    const onConnect = useCallback(
        (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    // Handle canvas click to add nodes based on selected tool
    const onPaneClick = useCallback(
        (event: React.MouseEvent) => {
            if (!reactFlowInstance || selectedTool === 'select' || selectedTool === 'pan') return;

            const bounds = reactFlowWrapper.current?.getBoundingClientRect();
            if (!bounds) return;

            const position = reactFlowInstance.project({
                x: event.clientX - bounds.left,
                y: event.clientY - bounds.top,
            });

            let newNode: Node | null = null;

            switch (selectedTool) {
                case 'rectangle':
                    newNode = {
                        id: `rectangle-${Date.now()}`,
                        type: 'default',
                        position,
                        data: { label: 'Rectangle' },
                        style: {
                            width: 150,
                            height: 100,
                            background: '#3b82f6',
                            color: 'white',
                            border: '2px solid #2563eb',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                        },
                    };
                    break;
                case 'circle':
                    newNode = {
                        id: `circle-${Date.now()}`,
                        type: 'default',
                        position,
                        data: { label: 'Circle' },
                        style: {
                            width: 120,
                            height: 120,
                            background: '#8b5cf6',
                            color: 'white',
                            border: '2px solid #7c3aed',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                        },
                    };
                    break;
                case 'text':
                    newNode = {
                        id: `textNode-${Date.now()}`,
                        type: 'textNode',
                        position,
                        data: { text: 'Double-click to edit' },
                    };
                    break;
                case 'note':
                    newNode = {
                        id: `noteNode-${Date.now()}`,
                        type: 'noteNode',
                        position,
                        data: {
                            title: 'New Note',
                            content: 'Click to add content',
                            category: 'General',
                            noteId: '',
                        },
                    };
                    break;
                case 'task':
                    newNode = {
                        id: `taskNode-${Date.now()}`,
                        type: 'taskNode',
                        position,
                        data: {
                            title: 'New Task',
                            description: 'Add description',
                            priority: 'medium',
                            status: 'todo',
                            taskId: '',
                        },
                    };
                    break;
            }

            if (newNode) {
                setNodes((nds) => [...nds, newNode!]);
                setSelectedTool('select'); // Return to select tool after adding
            }
        },
        [reactFlowInstance, selectedTool, setNodes]
    );

    const handleSave = async () => {
        if (!currentCanvas) {
            toast.error('No canvas selected');
            return;
        }

        try {
            setIsSaving(true);
            await updateCanvas(currentCanvas.id, { nodes, edges });
            toast.success('Canvas saved successfully!');
        } catch (error) {
            toast.error('Failed to save canvas');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateCanvas = async () => {
        try {
            const name = prompt('Enter canvas name:');
            if (!name) return;

            const newCanvas = await createCanvas(name);
            setCurrentCanvas(newCanvas);
            toast.success('Canvas created!');
        } catch (error) {
            toast.error('Failed to create canvas');
        }
    };

    // Auto-save every 30 seconds
    useEffect(() => {
        if (!currentCanvas || nodes.length === 0) return;

        const interval = setInterval(() => {
            updateCanvas(currentCanvas.id, { nodes, edges }).catch(console.error);
        }, 30000);

        return () => clearInterval(interval);
    }, [currentCanvas, nodes, edges]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading canvas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full flex flex-col">
            {/* Top Toolbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">Canvas</h1>

                    <div className="flex items-center gap-2">
                        <select
                            value={currentCanvas?.id || ''}
                            onChange={(e) => loadCanvas(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            {canvases.map((canvas) => (
                                <option key={canvas.id} value={canvas.id}>
                                    {canvas.name}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={handleCreateCanvas}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="New Canvas"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div ref={reactFlowWrapper} className="flex-1 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onPaneClick={onPaneClick}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-gray-50"
                    panOnDrag={selectedTool === 'pan'}
                    selectionOnDrag={selectedTool === 'select'}
                    selectionMode={SelectionMode.Partial}
                    selectNodesOnDrag={selectedTool === 'select'}
                    defaultEdgeOptions={{
                        type: 'step',
                        style: { strokeWidth: 2, stroke: '#64748b' },
                        animated: false,
                    }}
                >
                    <Background color="#e5e7eb" gap={16} />
                    <Controls className="bg-white border border-gray-200 rounded-lg" />
                    <MiniMap
                        nodeColor={(node) => {
                            switch (node.type) {
                                case 'noteNode':
                                    return '#3b82f6';
                                case 'taskNode':
                                    return '#a855f7';
                                case 'imageNode':
                                    return '#ec4899';
                                case 'textNode':
                                    return '#eab308';
                                default:
                                    return '#6b7280';
                            }
                        }}
                        className="bg-white border border-gray-200 rounded-lg"
                    />
                </ReactFlow>

                {/* Left Toolbar */}
                <CanvasToolbar selectedTool={selectedTool} onToolChange={setSelectedTool} />
            </div>
        </div>
    );
}

export default function CanvasPage() {
    return (
        <ReactFlowProvider>
            <CanvasFlow />
        </ReactFlowProvider>
    );
}
