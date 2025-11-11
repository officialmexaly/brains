export default function QuickCapturePage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">Quick Capture</h1>
          <p className="text-slate-600 text-lg">
            Quickly jot down your thoughts and ideas without any distractions.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 p-6 shadow-lg">
          <input
            type="text"
            placeholder="Give your note a title..."
            className="w-full text-2xl font-bold mb-4 bg-transparent border-none focus:outline-none placeholder:text-slate-300"
          />
          <textarea
            placeholder="Start writing your thoughts..."
            rows={15}
            className="w-full bg-transparent border-none focus:outline-none placeholder:text-slate-400 resize-none text-slate-700"
          />
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                Add tag
              </button>
              <button className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                Category
              </button>
            </div>
            <button className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105">
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
