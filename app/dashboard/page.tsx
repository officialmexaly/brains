'use client';

import { useRouter } from 'next/navigation';
import { useDashboardData } from '@/lib/hooks/useDashboardData';
import TaskCard from '@/components/TaskCard';

export default function DashboardPage() {
  const router = useRouter();
  const {
    stats,
    recentActivity,
    upcomingTasks,
    todaysTasks,
    latestJournalMood,
    isLoading,
  } = useDashboardData();

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case 'great': return '😄';
      case 'good': return '🙂';
      case 'okay': return '😐';
      case 'bad': return '😞';
      case 'terrible': return '😢';
      default: return '😊';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task': return '✓';
      case 'journal': return '📖';
      case 'article': return '📚';
      case 'note': return '📝';
      default: return '📄';
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleActivityClick = (activity: typeof recentActivity[0]) => {
    switch (activity.type) {
      case 'task':
        router.push(`/tasks/${activity.id}`);
        break;
      case 'journal':
        router.push(`/journal/${activity.id}`);
        break;
      case 'article':
        router.push(`/knowledge/${activity.id}`);
        break;
      case 'note':
        router.push(`/notes/${activity.id}`);
        break;
    }
  };

  const statsConfig = [
    {
      name: 'Active Tasks',
      value: stats.activeTasks,
      icon: '✓',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      onClick: () => router.push('/tasks')
    },
    {
      name: 'Journal Entries',
      value: stats.journalEntries,
      icon: '📖',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      onClick: () => router.push('/journal')
    },
    {
      name: 'Knowledge Articles',
      value: stats.knowledgeArticles,
      icon: '📚',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      onClick: () => router.push('/knowledge')
    },
    {
      name: 'Total Notes',
      value: stats.totalNotes,
      icon: '📝',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      onClick: () => router.push('/notes')
    },
  ];

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2 sm:mb-3">
            Dashboard
          </h1>
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg">
            Welcome back! Here's what's happening in your brain today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {statsConfig.map((stat) => (
            <div
              key={stat.name}
              onClick={stat.onClick}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-slate-200/60 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-lg ${stat.bgColor}/50 group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
              </div>
              <p className={`text-3xl sm:text-4xl font-bold ${stat.textColor} mb-1 sm:mb-2`}>{stat.value}</p>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">{stat.name}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Recent Activity & Quick Actions */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Recent Activity</h2>
                <button
                  onClick={() => router.push('/search')}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all"
                >
                  View all →
                </button>
              </div>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📭</div>
                  <p className="text-sm sm:text-base text-gray-600">No recent activity yet</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-2">Start creating tasks, journal entries, or articles!</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      onClick={() => handleActivityClick(activity)}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-slate-50 rounded-xl transition-all cursor-pointer group"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-lg sm:text-xl group-hover:scale-110 transition-transform flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-sm sm:text-base truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-500">{getRelativeTime(activity.time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <button
                onClick={() => router.push('/notes/new')}
                className="group p-4 sm:p-6 bg-white/60 backdrop-blur-sm border-2 border-dashed border-slate-300 rounded-2xl hover:border-orange-500 hover:bg-orange-50/50 transition-all text-left hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform">📝</div>
                <p className="font-bold text-slate-900 mb-1 text-sm sm:text-base">New Note</p>
                <p className="text-xs sm:text-sm text-slate-600">Quick idea</p>
              </button>
              <button
                onClick={() => router.push('/tasks/new')}
                className="group p-4 sm:p-6 bg-white/60 backdrop-blur-sm border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform">✓</div>
                <p className="font-bold text-slate-900 mb-1 text-sm sm:text-base">New Task</p>
                <p className="text-xs sm:text-sm text-slate-600">Add to-do</p>
              </button>
              <button
                onClick={() => router.push('/knowledge/new')}
                className="group p-4 sm:p-6 bg-white/60 backdrop-blur-sm border-2 border-dashed border-slate-300 rounded-2xl hover:border-green-500 hover:bg-green-50/50 transition-all text-left hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform">📚</div>
                <p className="font-bold text-slate-900 mb-1 text-sm sm:text-base">New Article</p>
                <p className="text-xs sm:text-sm text-slate-600">Document</p>
              </button>
              <button
                onClick={() => router.push('/journal/new')}
                className="group p-4 sm:p-6 bg-white/60 backdrop-blur-sm border-2 border-dashed border-slate-300 rounded-2xl hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform">📖</div>
                <p className="font-bold text-slate-900 mb-1 text-sm sm:text-base">New Entry</p>
                <p className="text-xs sm:text-sm text-slate-600">Journal</p>
              </button>
            </div>
          </div>

          {/* Right Column - Widgets */}
          <div className="space-y-6 sm:space-y-8">
            {/* Today's Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 sm:p-6 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Today's Summary</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-slate-600">Tasks due today</span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600">{todaysTasks.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-slate-600">Current mood</span>
                  <span className="text-2xl sm:text-3xl">{getMoodEmoji(latestJournalMood)}</span>
                </div>
                <button
                  onClick={() => router.push('/tasks/today')}
                  className="w-full mt-3 sm:mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  View Today's Tasks
                </button>
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-4 sm:p-6 shadow-lg">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Upcoming</h3>
                <button
                  onClick={() => router.push('/tasks/upcoming')}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                >
                  View all →
                </button>
              </div>
              {upcomingTasks.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">🎉</div>
                  <p className="text-xs sm:text-sm text-gray-600">All caught up!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="scale-95 origin-left">
                      <TaskCard task={task} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

