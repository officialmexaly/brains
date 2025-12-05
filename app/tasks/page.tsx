'use client';

import { useTasks } from '@/lib/hooks/useTasks';
import { getTaskCounts } from '@/lib/utils/taskFilters';
import TaskCard from '@/components/TaskCard';
import TaskViewLayout from '@/components/TaskViewLayout';

export default function TasksPage() {
  const { tasks, isLoading } = useTasks();
  const counts = getTaskCounts(tasks);

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const stats = [
    { label: 'To Do', value: counts.todo, icon: '📋', color: 'bg-gray-100' },
    { label: 'In Progress', value: counts.inProgress, icon: '⏳', color: 'bg-blue-100' },
    { label: 'Completed', value: counts.completed, icon: '✅', color: 'bg-green-100' },
  ];

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading your tasks...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TaskViewLayout
      title="Tasks & Todos"
      description="Manage your tasks and stay on top of your commitments"
      stats={stats}
      showViewSwitcher={true}
      currentView="list"
    >
      {tasks.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No tasks yet
          </h3>
          <p className="text-slate-600 mb-6">
            Get started by creating your first task to stay organized and productive!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* To Do */}
          {todoTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                To Do ({todoTasks.length})
              </h2>
              <div className="space-y-3">
                {todoTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* In Progress */}
          {inProgressTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                In Progress ({inProgressTasks.length})
              </h2>
              <div className="space-y-3">
                {inProgressTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Completed */}
          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Completed ({completedTasks.length})
              </h2>
              <div className="space-y-3">
                {completedTasks.slice(0, 5).map((task) => (
                  <TaskCard key={task.id} task={task} showStatus={false} />
                ))}
              </div>
              {completedTasks.length > 5 && (
                <div className="text-center mt-4">
                  <a
                    href="/tasks/completed"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    View all {completedTasks.length} completed tasks →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </TaskViewLayout>
  );
}

