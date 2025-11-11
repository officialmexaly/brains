'use client';

import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'completed';
  dueDate?: string;
  createdAt: string;
}

export default function TasksPage() {
  const [tasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete project proposal',
      description: 'Write and submit the Q1 project proposal to the team',
      category: 'Work',
      priority: 'high',
      status: 'in-progress',
      dueDate: 'Today',
      createdAt: '2 hours ago',
    },
    {
      id: '2',
      title: 'Review code changes',
      description: 'Review pull requests from the development team',
      category: 'Work',
      priority: 'medium',
      status: 'todo',
      dueDate: 'Tomorrow',
      createdAt: '5 hours ago',
    },
    {
      id: '3',
      title: 'Weekly workout',
      description: 'Complete 3 workout sessions this week',
      category: 'Health',
      priority: 'medium',
      status: 'in-progress',
      dueDate: 'This week',
      createdAt: '1 day ago',
    },
    {
      id: '4',
      title: 'Learn TypeScript',
      description: 'Complete the TypeScript course and build a project',
      category: 'Learning',
      priority: 'low',
      status: 'todo',
      dueDate: 'Next week',
      createdAt: '2 days ago',
    },
    {
      id: '5',
      title: 'Plan vacation',
      description: 'Research and book summer vacation destinations',
      category: 'Personal',
      priority: 'low',
      status: 'todo',
      dueDate: 'Next month',
      createdAt: '3 days ago',
    },
    {
      id: '6',
      title: 'Update portfolio',
      description: 'Add recent projects to portfolio website',
      category: 'Work',
      priority: 'high',
      status: 'completed',
      createdAt: '1 week ago',
    },
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'todo':
        return 'bg-gray-300';
      default:
        return 'bg-gray-300';
    }
  };

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">Tasks & Todos</h1>
          <p className="text-slate-600 text-lg">
            Manage your tasks and stay on top of your commitments.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">To Do</p>
                <p className="text-3xl font-bold text-gray-900">{todoTasks.length}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                📋
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-3xl font-bold text-gray-900">{inProgressTasks.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                ⏳
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{completedTasks.length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                ✅
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            All Tasks
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
            Today
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
            This Week
          </button>
          <button className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-colors">
            Upcoming
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-6">
          {/* To Do */}
          {todoTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">To Do ({todoTasks.length})</h2>
              <div className="space-y-3">
                {todoTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-5 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex items-center h-6">
                        <div className={`w-5 h-5 rounded-full border-2 border-gray-300`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{task.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">📁 {task.category}</span>
                          {task.dueDate && (
                            <span className="text-gray-500">📅 {task.dueDate}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* In Progress */}
          {inProgressTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">In Progress ({inProgressTasks.length})</h2>
              <div className="space-y-3">
                {inProgressTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-xl border border-blue-200 p-5 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex items-center h-6">
                        <div className={`w-5 h-5 rounded-full ${getStatusColor(task.status)}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{task.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">📁 {task.category}</span>
                          {task.dueDate && (
                            <span className="text-gray-500">📅 {task.dueDate}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Completed ({completedTasks.length})</h2>
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 opacity-75 hover:opacity-100 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex items-center h-6">
                        <div className={`w-5 h-5 rounded-full ${getStatusColor(task.status)} flex items-center justify-center text-white text-xs`}>
                          ✓
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 line-through">{task.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-through">{task.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-500">📁 {task.category}</span>
                          <span className="text-green-600">✓ Completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Task Button */}
        <button className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all hover:scale-110 flex items-center justify-center text-3xl font-light hover:rotate-90 duration-300 group">
          <span className="group-hover:rotate-[-90deg] transition-transform duration-300">+</span>
        </button>
      </div>
    </div>
  );
}
