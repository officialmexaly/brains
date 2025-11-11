export default function CategoriesPage() {
  const categories = [
    { name: 'Development', count: 28, icon: '💻', color: 'from-blue-500 to-blue-600' },
    { name: 'Productivity', count: 15, icon: '⚡', color: 'from-green-500 to-green-600' },
    { name: 'Learning', count: 22, icon: '🎓', color: 'from-purple-500 to-purple-600' },
    { name: 'Health', count: 12, icon: '❤️', color: 'from-red-500 to-red-600' },
    { name: 'Finance', count: 9, icon: '💰', color: 'from-yellow-500 to-yellow-600' },
    { name: 'Design', count: 18, icon: '🎨', color: 'from-pink-500 to-pink-600' },
    { name: 'Business', count: 14, icon: '💼', color: 'from-indigo-500 to-indigo-600' },
    { name: 'Technology', count: 31, icon: '🔧', color: 'from-cyan-500 to-cyan-600' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">Categories</h1>
          <p className="text-slate-600 text-lg">
            Browse your knowledge base by category.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category.name}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/60 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer hover:-translate-y-1"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                {category.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{category.name}</h3>
              <p className="text-slate-600">{category.count} articles</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
