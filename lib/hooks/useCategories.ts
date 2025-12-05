'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface CreateCategoryData {
    name: string;
    icon: string;
    color: string;
    description?: string;
}

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const formatCategory = (data: any): Category => ({
        id: data.id,
        name: data.name,
        icon: data.icon,
        color: data.color,
        description: data.description,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
    });

    const fetchCategories = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            setCategories(data?.map(formatCategory) || []);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching categories:', err);
            setError(err.message);
            toast.error('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    const createCategory = async (categoryData: CreateCategoryData) => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .insert([{
                    name: categoryData.name,
                    icon: categoryData.icon,
                    color: categoryData.color,
                    description: categoryData.description,
                }])
                .select()
                .single();

            if (error) {
                if (error.code === '23505') { // Unique violation
                    throw new Error('A category with this name already exists');
                }
                throw error;
            }

            const newCategory = formatCategory(data);
            setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
            toast.success('Category created successfully');
            return newCategory;
        } catch (err: any) {
            console.error('Error creating category:', err);
            toast.error(err.message || 'Failed to create category');
            throw err;
        }
    };

    const updateCategory = async (id: string, categoryData: Partial<CreateCategoryData>) => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .update({
                    name: categoryData.name,
                    icon: categoryData.icon,
                    color: categoryData.color,
                    description: categoryData.description,
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    throw new Error('A category with this name already exists');
                }
                throw error;
            }

            const updatedCategory = formatCategory(data);
            setCategories(prev =>
                prev.map(cat => cat.id === id ? updatedCategory : cat)
                    .sort((a, b) => a.name.localeCompare(b.name))
            );
            toast.success('Category updated successfully');
            return updatedCategory;
        } catch (err: any) {
            console.error('Error updating category:', err);
            toast.error(err.message || 'Failed to update category');
            throw err;
        }
    };

    const deleteCategory = async (id: string) => {
        try {
            // Check if category has articles
            const { count } = await supabase
                .from('knowledge_articles')
                .select('*', { count: 'exact', head: true })
                .eq('category', categories.find(c => c.id === id)?.name);

            if (count && count > 0) {
                throw new Error(`Cannot delete category with ${count} article${count > 1 ? 's' : ''}. Please reassign or delete the articles first.`);
            }

            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setCategories(prev => prev.filter(cat => cat.id !== id));
            toast.success('Category deleted successfully');
        } catch (err: any) {
            console.error('Error deleting category:', err);
            toast.error(err.message || 'Failed to delete category');
            throw err;
        }
    };

    useEffect(() => {
        fetchCategories();

        // Set up real-time subscription
        const channel = supabase
            .channel('categories-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'categories',
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setCategories(prev => [...prev, formatCategory(payload.new)].sort((a, b) => a.name.localeCompare(b.name)));
                    } else if (payload.eventType === 'UPDATE') {
                        setCategories(prev =>
                            prev.map(cat => cat.id === payload.new.id ? formatCategory(payload.new) : cat)
                                .sort((a, b) => a.name.localeCompare(b.name))
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setCategories(prev => prev.filter(cat => cat.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return {
        categories,
        isLoading,
        error,
        createCategory,
        updateCategory,
        deleteCategory,
        refetch: fetchCategories,
    };
}
