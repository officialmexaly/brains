export default function JournalCalendarPage() {
  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">Journal Calendar</h1>
          <p className="text-slate-600 text-lg">
            View your journal entries in a calendar format.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-12 text-center shadow-lg">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Calendar View Coming Soon</h3>
          <p className="text-slate-600">
            We're working on an interactive calendar view for your journal entries.
          </p>
        </div>
      </div>
    </div>
  );
}
