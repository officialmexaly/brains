export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string
          title: string
          content: string
          category: string
          tags: string[]
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category: string
          tags?: string[]
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string
          tags?: string[]
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          priority: 'low' | 'medium' | 'high'
          status: 'todo' | 'in-progress' | 'completed'
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          priority: 'low' | 'medium' | 'high'
          status?: 'todo' | 'in-progress' | 'completed'
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'todo' | 'in-progress' | 'completed'
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      knowledge_articles: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string
          category: string
          tags: string[]
          image_url: string | null
          read_time: number
          author: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt: string
          category: string
          tags?: string[]
          image_url?: string | null
          read_time: number
          author: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string
          category?: string
          tags?: string[]
          image_url?: string | null
          read_time?: number
          author?: string
          created_at?: string
          updated_at?: string
        }
      }
      journal_entries: {
        Row: {
          id: string
          title: string
          content: string
          mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible' | null
          tags: string[]
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible' | null
          tags?: string[]
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible' | null
          tags?: string[]
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
