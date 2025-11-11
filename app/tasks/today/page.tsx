export default function TodayTasksPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">Today's Tasks</h1>
          <p className="text-slate-600 text-lg">
            Focus on what needs to be done today.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-12 text-center shadow-lg">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No Tasks for Today</h3>
          <p className="text-slate-600 mb-6">
            You're all caught up! Add a new task to get started.
          </p>
          <button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105">
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}
