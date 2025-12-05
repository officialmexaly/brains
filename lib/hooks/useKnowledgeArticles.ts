import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { KnowledgeArticle } from '@/types';

export function useKnowledgeArticles() {
    const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Fetch all articles
    const fetchArticles = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('knowledge_articles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            const formattedArticles: KnowledgeArticle[] = (data || []).map((article) => ({
                id: article.id,
                title: article.title,
                content: article.content,
                excerpt: article.excerpt || '',
                category: article.category,
                tags: article.tags || [],
                imageUrl: article.image_url,
                readTime: article.read_time || 5,
                author: article.author || 'You',
                createdAt: new Date(article.created_at),
                updatedAt: new Date(article.updated_at),
            }));

            setArticles(formattedArticles);
            setError(null);
        } catch (err) {
            console.error('Error fetching articles:', err);
            setError(err as Error);
        } finally {
            setIsLoading(false);
        }
    };

    // Create new article
    const createArticle = async (articleData: Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeArticle> => {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('knowledge_articles')
                .insert([
                    {
                        user_id: user.id,
                        title: articleData.title,
                        content: articleData.content,
                        excerpt: articleData.excerpt,
                        category: articleData.category,
                        tags: articleData.tags || [],
                        image_url: articleData.imageUrl,
                        read_time: articleData.readTime,
                        author: articleData.author || user.email || 'You',
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            const newArticle: KnowledgeArticle = {
                id: data.id,
                title: data.title,
                content: data.content,
                excerpt: data.excerpt || '',
                category: data.category,
                tags: data.tags || [],
                imageUrl: data.image_url,
                readTime: data.read_time || 5,
                author: data.author || 'You',
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
            };

            setArticles((prev) => [newArticle, ...prev]);
            return newArticle;
        } catch (err) {
            console.error('Error creating article:', err);
            throw err;
        }
    };

    // Update existing article
    const updateArticle = async (id: string, articleData: Partial<Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt'>>) => {
        try {
            const updateData: any = {};
            if (articleData.title !== undefined) updateData.title = articleData.title;
            if (articleData.content !== undefined) updateData.content = articleData.content;
            if (articleData.excerpt !== undefined) updateData.excerpt = articleData.excerpt;
            if (articleData.category !== undefined) updateData.category = articleData.category;
            if (articleData.tags !== undefined) updateData.tags = articleData.tags;
            if (articleData.imageUrl !== undefined) updateData.image_url = articleData.imageUrl;
            if (articleData.readTime !== undefined) updateData.read_time = articleData.readTime;
            if (articleData.author !== undefined) updateData.author = articleData.author;

            const { data, error } = await supabase
                .from('knowledge_articles')
                .update(updateData)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            const updatedArticle: KnowledgeArticle = {
                id: data.id,
                title: data.title,
                content: data.content,
                excerpt: data.excerpt || '',
                category: data.category,
                tags: data.tags || [],
                imageUrl: data.image_url,
                readTime: data.read_time || 5,
                author: data.author || 'You',
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
            };

            setArticles((prev) => prev.map((article) => (article.id === id ? updatedArticle : article)));
            return updatedArticle;
        } catch (err) {
            console.error('Error updating article:', err);
            throw err;
        }
    };

    // Delete article
    const deleteArticle = async (id: string) => {
        try {
            const { error } = await supabase.from('knowledge_articles').delete().eq('id', id);

            if (error) throw error;

            setArticles((prev) => prev.filter((article) => article.id !== id));
        } catch (err) {
            console.error('Error deleting article:', err);
            throw err;
        }
    };

    // Set up real-time subscription
    useEffect(() => {
        fetchArticles();

        const subscription = supabase
            .channel('knowledge_articles_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'knowledge_articles' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    const newArticle: KnowledgeArticle = {
                        id: payload.new.id,
                        title: payload.new.title,
                        content: payload.new.content,
                        excerpt: payload.new.excerpt || '',
                        category: payload.new.category,
                        tags: payload.new.tags || [],
                        imageUrl: payload.new.image_url,
                        readTime: payload.new.read_time || 5,
                        author: payload.new.author || 'You',
                        createdAt: new Date(payload.new.created_at),
                        updatedAt: new Date(payload.new.updated_at),
                    };
                    setArticles((prev) => {
                        if (prev.some((a) => a.id === newArticle.id)) return prev;
                        return [newArticle, ...prev];
                    });
                } else if (payload.eventType === 'UPDATE') {
                    const updatedArticle: KnowledgeArticle = {
                        id: payload.new.id,
                        title: payload.new.title,
                        content: payload.new.content,
                        excerpt: payload.new.excerpt || '',
                        category: payload.new.category,
                        tags: payload.new.tags || [],
                        imageUrl: payload.new.image_url,
                        readTime: payload.new.read_time || 5,
                        author: payload.new.author || 'You',
                        createdAt: new Date(payload.new.created_at),
                        updatedAt: new Date(payload.new.updated_at),
                    };
                    setArticles((prev) => prev.map((article) => (article.id === updatedArticle.id ? updatedArticle : article)));
                } else if (payload.eventType === 'DELETE') {
                    setArticles((prev) => prev.filter((article) => article.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return {
        articles,
        isLoading,
        error,
        createArticle,
        updateArticle,
        deleteArticle,
        refetch: fetchArticles,
    };
}
