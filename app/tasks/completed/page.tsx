'use client';

import { useTasks } from '@/lib/hooks/useTasks';
import { getCompletedTasks, getTaskCounts } from '@/lib/utils/taskFilters';
import TaskCard from '@/components/TaskCard';
import TaskViewLayout from '@/components/TaskViewLayout';

export default function CompletedTasksPage() {
  const { tasks, isLoading } = useTasks();

  const completedTasks = getCompletedTasks(tasks);
  const counts = getTaskCounts(tasks);

  // Group by completion time
  const today = completedTasks.filter(t => {
    const updated = new Date(t.updatedAt);
    const now = new Date();
    return updated.toDateString() === now.toDateString();
  });

  const thisWeek = completedTasks.filter(t => {
    const updated = new Date(t.updatedAt);
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return updated >= weekAgo && updated.toDateString() !== now.toDateString();
  });

  const earlier = completedTasks.filter(t => {
    const updated = new Date(t.updatedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return updated < weekAgo;
  });

  const stats = [
    { label: 'Total Completed', value: counts.completed, icon: '✅', color: 'bg-green-100' },
    { label: 'This Week', value: today.length + thisWeek.length, icon: '📅', color: 'bg-blue-100' },
    { label: 'All Time', value: counts.completed, icon: '🏆', color: 'bg-purple-100' },
  ];

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading completed tasks...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TaskViewLayout
      title="Completed Tasks"
      description="Review your accomplishments and completed tasks"
      stats={stats}
      showViewSwitcher={true}
      currentView="list"
    >
      {completedTasks.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No completed tasks yet
          </h3>
          <p className="text-slate-600 mb-6">
            Completed tasks will be archived here. Start completing tasks to see them appear!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Today */}
          {today.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Completed Today ({today.length})
              </h2>
              <div className="space-y-3">
                {today.map((task) => (
                  <TaskCard key={task.id} task={task} showStatus={false} />
                ))}
              </div>
            </div>
          )}

          {/* This Week */}
          {thisWeek.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                This Week ({thisWeek.length})
              </h2>
              <div className="space-y-3">
                {thisWeek.map((task) => (
                  <TaskCard key={task.id} task={task} showStatus={false} />
                ))}
              </div>
            </div>
          )}

          {/* Earlier */}
          {earlier.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Earlier ({earlier.length})
              </h2>
              <div className="space-y-3">
                {earlier.map((task) => (
                  <TaskCard key={task.id} task={task} showStatus={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </TaskViewLayout>
  );
}
