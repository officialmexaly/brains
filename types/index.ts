export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  readTime: number; // in minutes
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible';
  tags: string[];
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SidebarItem {
  id: string;
  name: string;
  icon: string;
  href: string;
  children?: SidebarItem[];
}
