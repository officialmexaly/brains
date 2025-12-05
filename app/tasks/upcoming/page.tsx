'use client';

import { useTasks } from '@/lib/hooks/useTasks';
import { getUpcomingTasks, getTaskCounts } from '@/lib/utils/taskFilters';
import TaskCard from '@/components/TaskCard';
import TaskViewLayout from '@/components/TaskViewLayout';

export default function UpcomingTasksPage() {
  const { tasks, isLoading } = useTasks();

  const upcomingTasks = getUpcomingTasks(tasks);
  const counts = getTaskCounts(tasks);

  const stats = [
    { label: 'Upcoming Tasks', value: counts.upcoming, icon: '🗓️', color: 'bg-purple-100' },
    {
      label: 'This Week', value: upcomingTasks.filter(t => {
        const dueDate = t.dueDate ? new Date(t.dueDate) : null;
        if (!dueDate) return false;
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return dueDate <= weekFromNow;
      }).length, icon: '📅', color: 'bg-blue-100'
    },
    {
      label: 'Later', value: upcomingTasks.filter(t => {
        const dueDate = t.dueDate ? new Date(t.dueDate) : null;
        if (!dueDate) return false;
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return dueDate > weekFromNow;
      }).length, icon: '⏰', color: 'bg-gray-100'
    },
  ];

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading upcoming tasks...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Group tasks by time period
  const thisWeek = upcomingTasks.filter(t => {
    const dueDate = t.dueDate ? new Date(t.dueDate) : null;
    if (!dueDate) return false;
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return dueDate <= weekFromNow;
  });

  const later = upcomingTasks.filter(t => {
    const dueDate = t.dueDate ? new Date(t.dueDate) : null;
    if (!dueDate) return false;
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    return dueDate > weekFromNow;
  });

  return (
    <TaskViewLayout
      title="Upcoming Tasks"
      description="Plan ahead with tasks scheduled for the future"
      stats={stats}
      showViewSwitcher={true}
      currentView="list"
    >
      {upcomingTasks.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-12 text-center">
          <div className="text-6xl mb-4">🗓️</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No upcoming tasks
          </h3>
          <p className="text-slate-600 mb-6">
            Tasks scheduled for later will appear here. You're all set for now!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* This Week */}
          {thisWeek.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                This Week ({thisWeek.length})
              </h2>
              <div className="space-y-3">
                {thisWeek.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {/* Later */}
          {later.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Later ({later.length})
              </h2>
              <div className="space-y-3">
                {later.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </TaskViewLayout>
  );
}
