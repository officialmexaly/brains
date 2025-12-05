'use client';

import { useTasks } from '@/lib/hooks/useTasks';
import { getTodayTasks, getTaskCounts } from '@/lib/utils/taskFilters';
import TaskCard from '@/components/TaskCard';
import TaskViewLayout from '@/components/TaskViewLayout';

export default function TodayTasksPage() {
  const { tasks, isLoading } = useTasks();

  const todayTasks = getTodayTasks(tasks);
  const counts = getTaskCounts(tasks);

  const stats = [
    { label: 'Today\'s Tasks', value: counts.today, icon: '📅', color: 'bg-blue-100' },
    { label: 'In Progress', value: todayTasks.filter(t => t.status === 'in-progress').length, icon: '⏳', color: 'bg-yellow-100' },
    { label: 'To Do', value: todayTasks.filter(t => t.status === 'todo').length, icon: '📋', color: 'bg-gray-100' },
  ];

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading today's tasks...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TaskViewLayout
      title="Today's Tasks"
      description="Focus on what needs to be done today"
      stats={stats}
      showViewSwitcher={true}
      currentView="list"
    >
      {todayTasks.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-12 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            All caught up for today!
          </h3>
          <p className="text-slate-600 mb-6">
            You have no tasks scheduled for today. Great job staying on top of things!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overdue Tasks */}
          {todayTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && new Date(t.dueDate).toDateString() !== new Date().toDateString()).length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Overdue ({todayTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && new Date(t.dueDate).toDateString() !== new Date().toDateString()).length})
              </h2>
              <div className="space-y-3">
                {todayTasks
                  .filter(t => t.dueDate && new Date(t.dueDate) < new Date() && new Date(t.dueDate).toDateString() !== new Date().toDateString())
                  .map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
              </div>
            </div>
          )}

          {/* Due Today */}
          {todayTasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString()).length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Due Today ({todayTasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString()).length})
              </h2>
              <div className="space-y-3">
                {todayTasks
                  .filter(t => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString())
                  .map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
              </div>
            </div>
          )}

          {/* No Due Date (Ongoing) */}
          {todayTasks.filter(t => !t.dueDate).length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Ongoing Tasks ({todayTasks.filter(t => !t.dueDate).length})
              </h2>
              <div className="space-y-3">
                {todayTasks
                  .filter(t => !t.dueDate)
                  .map((task) => (
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
