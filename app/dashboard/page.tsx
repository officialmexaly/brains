export default function DashboardPage() {
  const stats = [
    { name: 'Total Notes', value: 24, icon: '📝', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { name: 'Active Tasks', value: 12, icon: '✓', color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { name: 'Knowledge Articles', value: 45, icon: '📚', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
    { name: 'Journal Entries', value: 18, icon: '📖', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
  ];

  const recentActivity = [
    { type: 'note', title: 'Project Ideas for Q1', time: '2 hours ago' },
    { type: 'task', title: 'Complete project proposal', time: '3 hours ago' },
    { type: 'journal', title: 'Daily Reflection', time: '1 day ago' },
    { type: 'article', title: 'React Best Practices', time: '2 days ago' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">Dashboard</h1>
          <p className="text-slate-600 text-lg">
            Welcome back! Here's what's happening in your brain today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-2xl shadow-lg ${stat.bgColor}/50 group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
              </div>
              <p className={`text-4xl font-bold ${stat.textColor} mb-2`}>{stat.value}</p>
              <p className="text-sm text-slate-600 font-medium">{stat.name}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all">
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                  {activity.type === 'note' && '📝'}
                  {activity.type === 'task' && '✓'}
                  {activity.type === 'journal' && '📖'}
                  {activity.type === 'article' && '📚'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{activity.title}</p>
                  <p className="text-sm text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="group p-6 bg-white/60 backdrop-blur-sm border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left hover:-translate-y-1 hover:shadow-xl">
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📝</div>
            <p className="font-bold text-slate-900 mb-1">New Note</p>
            <p className="text-sm text-slate-600">Capture a quick idea</p>
          </button>
          <button className="group p-6 bg-white/60 backdrop-blur-sm border-2 border-dashed border-slate-300 rounded-2xl hover:border-green-500 hover:bg-green-50/50 transition-all text-left hover:-translate-y-1 hover:shadow-xl">
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">✓</div>
            <p className="font-bold text-slate-900 mb-1">New Task</p>
            <p className="text-sm text-slate-600">Add something to do</p>
          </button>
          <button className="group p-6 bg-white/60 backdrop-blur-sm border-2 border-dashed border-slate-300 rounded-2xl hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left hover:-translate-y-1 hover:shadow-xl">
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📚</div>
            <p className="font-bold text-slate-900 mb-1">New Article</p>
            <p className="text-sm text-slate-600">Document knowledge</p>
          </button>
          <button className="group p-6 bg-white/60 backdrop-blur-sm border-2 border-dashed border-slate-300 rounded-2xl hover:border-orange-500 hover:bg-orange-50/50 transition-all text-left hover:-translate-y-1 hover:shadow-xl">
            <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">📖</div>
            <p className="font-bold text-slate-900 mb-1">New Entry</p>
            <p className="text-sm text-slate-600">Write in your journal</p>
          </button>
        </div>
      </div>
    </div>
  );
}
