export default function SearchPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search</h1>
          <p className="text-gray-600">
            Search across all your notes, tasks, articles, and journal entries.
          </p>
        </div>

        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search your brain..."
            />
            <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Searching</h3>
          <p className="text-gray-600">
            Enter a keyword to search across all your content.
          </p>
        </div>
      </div>
    </div>
  );
}
