import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Canvas {
    id: string;
    userId: string;
    name: string;
    data: {
        nodes: any[];
        edges: any[];
    };
    createdAt: string;
    updatedAt: string;
}

export function useCanvases() {
    const [canvases, setCanvases] = useState<Canvas[]>([]);
    const [currentCanvas, setCurrentCanvas] = useState<Canvas | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch all canvases for the current user
    const fetchCanvases = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('canvases')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) throw error;

            const formattedCanvases: Canvas[] = (data || []).map((canvas) => ({
                id: canvas.id,
                userId: canvas.user_id,
                name: canvas.name,
                data: canvas.data,
                createdAt: canvas.created_at,
                updatedAt: canvas.updated_at,
            }));

            setCanvases(formattedCanvases);
        } catch (error) {
            console.error('Error fetching canvases:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Create a new canvas
    const createCanvas = async (name: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('canvases')
                .insert([
                    {
                        user_id: user.id,
                        name,
                        data: { nodes: [], edges: [] },
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            const newCanvas: Canvas = {
                id: data.id,
                userId: data.user_id,
                name: data.name,
                data: data.data,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            };

            setCanvases((prev) => [newCanvas, ...prev]);
            return newCanvas;
        } catch (error) {
            console.error('Error creating canvas:', error);
            throw error;
        }
    };

    // Update canvas data (nodes and edges)
    const updateCanvas = async (id: string, data: { nodes: any[]; edges: any[] }) => {
        try {
            const { error } = await supabase
                .from('canvases')
                .update({ data })
                .eq('id', id);

            if (error) throw error;

            setCanvases((prev) =>
                prev.map((canvas) =>
                    canvas.id === id
                        ? { ...canvas, data, updatedAt: new Date().toISOString() }
                        : canvas
                )
            );

            if (currentCanvas && currentCanvas.id === id) {
                setCurrentCanvas({ ...currentCanvas, data });
            }
        } catch (error) {
            console.error('Error updating canvas:', error);
            throw error;
        }
    };

    // Delete a canvas
    const deleteCanvas = async (id: string) => {
        try {
            const { error } = await supabase
                .from('canvases')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setCanvases((prev) => prev.filter((canvas) => canvas.id !== id));
            if (currentCanvas?.id === id) {
                setCurrentCanvas(null);
            }
        } catch (error) {
            console.error('Error deleting canvas:', error);
            throw error;
        }
    };

    // Load a specific canvas
    const loadCanvas = async (id: string) => {
        try {
            const { data, error } = await supabase
                .from('canvases')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            const canvas: Canvas = {
                id: data.id,
                userId: data.user_id,
                name: data.name,
                data: data.data,
                createdAt: data.created_at,
                updatedAt: data.updated_at,
            };

            setCurrentCanvas(canvas);
            return canvas;
        } catch (error) {
            console.error('Error loading canvas:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchCanvases();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('canvases-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'canvases',
                },
                () => {
                    fetchCanvases();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return {
        canvases,
        currentCanvas,
        isLoading,
        createCanvas,
        updateCanvas,
        deleteCanvas,
        loadCanvas,
        setCurrentCanvas,
    };
}
