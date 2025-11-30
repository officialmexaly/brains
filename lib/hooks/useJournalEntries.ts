import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { JournalEntry } from '@/types';
import { toast } from 'sonner';

interface UseJournalEntriesOptions {
    mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
    dateFrom?: Date;
    dateTo?: Date;
    searchQuery?: string;
}

export function useJournalEntries(options: UseJournalEntriesOptions = {}) {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch entries
    const fetchEntries = async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('journal_entries')
                .select('*')
                .order('date', { ascending: false });

            // Apply filters
            if (options.mood) {
                query = query.eq('mood', options.mood);
            }

            if (options.dateFrom) {
                query = query.gte('date', options.dateFrom.toISOString());
            }

            if (options.dateTo) {
                query = query.lte('date', options.dateTo.toISOString());
            }

            const { data, error: fetchError } = await query;

            if (fetchError) throw fetchError;

            let filteredData = data || [];

            // Apply search filter (client-side for tags and content)
            if (options.searchQuery) {
                const searchLower = options.searchQuery.toLowerCase();
                filteredData = filteredData.filter((entry) => {
                    const titleMatch = entry.title.toLowerCase().includes(searchLower);
                    const contentMatch = entry.content.toLowerCase().includes(searchLower);
                    const tagsMatch = entry.tags?.some((tag: string) =>
                        tag.toLowerCase().includes(searchLower)
                    );
                    return titleMatch || contentMatch || tagsMatch;
                });
            }

            setEntries(filteredData.map(entry => ({
                ...entry,
                date: new Date(entry.date),
                createdAt: new Date(entry.created_at),
                updatedAt: new Date(entry.updated_at),
            })));
        } catch (err) {
            console.error('Error fetching journal entries:', err);
            setError('Failed to load journal entries');
            toast.error('Failed to load journal entries');
        } finally {
            setLoading(false);
        }
    };

    // Create entry
    const createEntry = async (data: {
        title: string;
        content: string;
        mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
        tags: string[];
        date: Date;
    }) => {
        try {
            const { data: newEntry, error: createError } = await supabase
                .from('journal_entries')
                .insert([
                    {
                        title: data.title,
                        content: data.content,
                        mood: data.mood,
                        tags: data.tags,
                        date: data.date.toISOString(),
                    },
                ])
                .select()
                .single();

            if (createError) throw createError;

            toast.success('Journal entry created successfully');
            await fetchEntries();
            return newEntry;
        } catch (err) {
            console.error('Error creating journal entry:', err);
            toast.error('Failed to create journal entry');
            throw err;
        }
    };

    // Update entry
    const updateEntry = async (
        id: string,
        data: {
            title: string;
            content: string;
            mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
            tags: string[];
            date: Date;
        }
    ) => {
        try {
            const { error: updateError } = await supabase
                .from('journal_entries')
                .update({
                    title: data.title,
                    content: data.content,
                    mood: data.mood,
                    tags: data.tags,
                    date: data.date.toISOString(),
                })
                .eq('id', id);

            if (updateError) throw updateError;

            toast.success('Journal entry updated successfully');
            await fetchEntries();
        } catch (err) {
            console.error('Error updating journal entry:', err);
            toast.error('Failed to update journal entry');
            throw err;
        }
    };

    // Delete entry
    const deleteEntry = async (id: string) => {
        try {
            const { error: deleteError } = await supabase
                .from('journal_entries')
                .delete()
                .eq('id', id);

            if (deleteError) throw deleteError;

            toast.success('Journal entry deleted successfully');
            await fetchEntries();
        } catch (err) {
            console.error('Error deleting journal entry:', err);
            toast.error('Failed to delete journal entry');
            throw err;
        }
    };

    // Initial fetch and real-time subscription
    useEffect(() => {
        fetchEntries();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('journal_entries_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'journal_entries',
                },
                () => {
                    fetchEntries();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [options.mood, options.dateFrom, options.dateTo, options.searchQuery]);

    return {
        entries,
        loading,
        error,
        createEntry,
        updateEntry,
        deleteEntry,
        refetch: fetchEntries,
    };
}
