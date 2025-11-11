'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Note, Task, KnowledgeArticle, JournalEntry } from '@/types';
import { supabase } from '@/lib/supabase';

interface BrainContextType {
  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateNote: (id: string, note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Knowledge
  articles: KnowledgeArticle[];
  addArticle: (article: Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateArticle: (id: string, article: Partial<KnowledgeArticle>) => Promise<void>;
  deleteArticle: (id: string) => Promise<void>;

  // Journal
  entries: JournalEntry[];
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEntry: (id: string, entry: Partial<JournalEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;

  // Loading states
  isLoading: boolean;
}

const BrainContext = createContext<BrainContextType | undefined>(undefined);

export function BrainProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Fetch notes with attachments
        const { data: notesData, error: notesError } = await supabase
          .from('notes')
          .select(`
            *,
            attachments (
              id,
              name,
              url,
              size,
              type,
              created_at
            )
          `)
          .order('created_at', { ascending: false });

        if (notesError) {
          console.error('Error loading notes:', notesError);
          throw notesError;
        }

        console.log('Loaded notes from Supabase:', notesData?.length || 0);

        if (notesData) {
          setNotes(notesData.map((n: any) => ({
            id: n.id,
            title: n.title,
            content: n.content,
            category: n.category,
            tags: n.tags || [],
            isPinned: n.is_pinned || false,
            createdAt: new Date(n.created_at),
            updatedAt: new Date(n.updated_at),
            attachments: n.attachments?.map((a: any) => ({
              id: a.id,
              name: a.name,
              url: a.url,
              size: a.size,
              type: a.type,
              uploadedAt: new Date(a.created_at),
            })) || [],
          })));
        }

        // Fetch tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (tasksError) throw tasksError;
        if (tasksData) {
          setTasks(tasksData.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            category: t.category,
            priority: t.priority,
            status: t.status,
            dueDate: t.due_date ? new Date(t.due_date) : undefined,
            createdAt: new Date(t.created_at),
            updatedAt: new Date(t.updated_at),
          })));
        }

        // Fetch articles
        const { data: articlesData, error: articlesError } = await supabase
          .from('knowledge_articles')
          .select('*')
          .order('created_at', { ascending: false });

        if (articlesError) throw articlesError;
        if (articlesData) {
          setArticles(articlesData.map(a => ({
            id: a.id,
            title: a.title,
            content: a.content,
            excerpt: a.excerpt,
            category: a.category,
            tags: a.tags,
            imageUrl: a.image_url || undefined,
            readTime: a.read_time,
            author: a.author,
            createdAt: new Date(a.created_at),
            updatedAt: new Date(a.updated_at),
          })));
        }

        // Fetch entries
        const { data: entriesData, error: entriesError } = await supabase
          .from('journal_entries')
          .select('*')
          .order('date', { ascending: false });

        if (entriesError) throw entriesError;
        if (entriesData) {
          setEntries(entriesData.map(e => ({
            id: e.id,
            title: e.title,
            content: e.content,
            mood: e.mood || undefined,
            tags: e.tags,
            date: new Date(e.date),
            createdAt: new Date(e.created_at),
            updatedAt: new Date(e.updated_at),
          })));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Notes CRUD
  const addNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          title: note.title,
          content: note.content,
          category: note.category,
          tags: note.tags,
          is_pinned: note.isPinned || false,
        })
        .select()
        .single();

      if (error) throw error;

      // Save attachments if any
      if (data && note.attachments && note.attachments.length > 0) {
        const attachmentsData = note.attachments.map((attachment) => ({
          note_id: data.id,
          name: attachment.name,
          url: attachment.url,
          size: attachment.size,
          type: attachment.type,
        }));

        const { error: attachError } = await supabase
          .from('attachments')
          .insert(attachmentsData);

        if (attachError) {
          console.error('Error adding attachments:', attachError);
        }
      }

      if (data) {
        const newNote: Note = {
          id: data.id,
          title: data.title,
          content: data.content,
          category: data.category,
          tags: data.tags,
          isPinned: data.is_pinned,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          attachments: note.attachments || [],
        };
        setNotes((prev) => [newNote, ...prev]);
      }
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  };

  const updateNote = async (id: string, updatedNote: Partial<Note>) => {
    try {
      const updateData: any = {};
      if (updatedNote.title !== undefined) updateData.title = updatedNote.title;
      if (updatedNote.content !== undefined) updateData.content = updatedNote.content;
      if (updatedNote.category !== undefined) updateData.category = updatedNote.category;
      if (updatedNote.tags !== undefined) updateData.tags = updatedNote.tags;
      if (updatedNote.isPinned !== undefined) updateData.is_pinned = updatedNote.isPinned;

      const { data, error } = await supabase
        .from('notes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setNotes((prev) =>
          prev.map((note) =>
            note.id === id
              ? {
                  ...note,
                  ...updatedNote,
                  updatedAt: new Date(data.updated_at),
                }
              : note
          )
        );
      }
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };

  // Tasks CRUD
  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          description: task.description,
          category: task.category,
          priority: task.priority,
          status: task.status,
          due_date: task.dueDate?.toISOString() || null,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        const newTask: Task = {
          id: data.id,
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority,
          status: data.status,
          dueDate: data.due_date ? new Date(data.due_date) : undefined,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
        setTasks((prev) => [newTask, ...prev]);
      }
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const updateTask = async (id: string, updatedTask: Partial<Task>) => {
    try {
      const updateData: any = {};
      if (updatedTask.title !== undefined) updateData.title = updatedTask.title;
      if (updatedTask.description !== undefined) updateData.description = updatedTask.description;
      if (updatedTask.category !== undefined) updateData.category = updatedTask.category;
      if (updatedTask.priority !== undefined) updateData.priority = updatedTask.priority;
      if (updatedTask.status !== undefined) updateData.status = updatedTask.status;
      if (updatedTask.dueDate !== undefined) updateData.due_date = updatedTask.dueDate?.toISOString() || null;

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...updatedTask,
                  updatedAt: new Date(data.updated_at),
                }
              : task
          )
        );
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  // Articles CRUD
  const addArticle = async (article: Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .insert({
          title: article.title,
          content: article.content,
          excerpt: article.excerpt,
          category: article.category,
          tags: article.tags,
          image_url: article.imageUrl || null,
          read_time: article.readTime,
          author: article.author,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        const newArticle: KnowledgeArticle = {
          id: data.id,
          title: data.title,
          content: data.content,
          excerpt: data.excerpt,
          category: data.category,
          tags: data.tags,
          imageUrl: data.image_url || undefined,
          readTime: data.read_time,
          author: data.author,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
        setArticles((prev) => [newArticle, ...prev]);
      }
    } catch (error) {
      console.error('Error adding article:', error);
      throw error;
    }
  };

  const updateArticle = async (id: string, updatedArticle: Partial<KnowledgeArticle>) => {
    try {
      const updateData: any = {};
      if (updatedArticle.title !== undefined) updateData.title = updatedArticle.title;
      if (updatedArticle.content !== undefined) updateData.content = updatedArticle.content;
      if (updatedArticle.excerpt !== undefined) updateData.excerpt = updatedArticle.excerpt;
      if (updatedArticle.category !== undefined) updateData.category = updatedArticle.category;
      if (updatedArticle.tags !== undefined) updateData.tags = updatedArticle.tags;
      if (updatedArticle.imageUrl !== undefined) updateData.image_url = updatedArticle.imageUrl || null;
      if (updatedArticle.readTime !== undefined) updateData.read_time = updatedArticle.readTime;
      if (updatedArticle.author !== undefined) updateData.author = updatedArticle.author;

      const { data, error } = await supabase
        .from('knowledge_articles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setArticles((prev) =>
          prev.map((article) =>
            article.id === id
              ? {
                  ...article,
                  ...updatedArticle,
                  updatedAt: new Date(data.updated_at),
                }
              : article
          )
        );
      }
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      const { error } = await supabase.from('knowledge_articles').delete().eq('id', id);
      if (error) throw error;
      setArticles((prev) => prev.filter((article) => article.id !== id));
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  };

  // Entries CRUD
  const addEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert({
          title: entry.title,
          content: entry.content,
          mood: entry.mood || null,
          tags: entry.tags,
          date: entry.date.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        const newEntry: JournalEntry = {
          id: data.id,
          title: data.title,
          content: data.content,
          mood: data.mood || undefined,
          tags: data.tags,
          date: new Date(data.date),
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };
        setEntries((prev) => [newEntry, ...prev]);
      }
    } catch (error) {
      console.error('Error adding entry:', error);
      throw error;
    }
  };

  const updateEntry = async (id: string, updatedEntry: Partial<JournalEntry>) => {
    try {
      const updateData: any = {};
      if (updatedEntry.title !== undefined) updateData.title = updatedEntry.title;
      if (updatedEntry.content !== undefined) updateData.content = updatedEntry.content;
      if (updatedEntry.mood !== undefined) updateData.mood = updatedEntry.mood || null;
      if (updatedEntry.tags !== undefined) updateData.tags = updatedEntry.tags;
      if (updatedEntry.date !== undefined) updateData.date = updatedEntry.date.toISOString();

      const { data, error } = await supabase
        .from('journal_entries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setEntries((prev) =>
          prev.map((entry) =>
            entry.id === id
              ? {
                  ...entry,
                  ...updatedEntry,
                  updatedAt: new Date(data.updated_at),
                }
              : entry
          )
        );
      }
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase.from('journal_entries').delete().eq('id', id);
      if (error) throw error;
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  };

  return (
    <BrainContext.Provider
      value={{
        notes,
        addNote,
        updateNote,
        deleteNote,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        articles,
        addArticle,
        updateArticle,
        deleteArticle,
        entries,
        addEntry,
        updateEntry,
        deleteEntry,
        isLoading,
      }}
    >
      {children}
    </BrainContext.Provider>
  );
}

export function useBrain() {
  const context = useContext(BrainContext);
  if (context === undefined) {
    throw new Error('useBrain must be used within a BrainProvider');
  }
  return context;
}
