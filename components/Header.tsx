'use client';

import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();
  return (
    <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-8 shadow-sm">
      <div className="flex-1">
        {/* Quick Search */}
        <div className="max-w-md">
          <div className="relative group">
            <input
              type="text"
              placeholder="Search your brain..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-slate-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all placeholder:text-slate-400"
            />
            <svg
              className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2 group-focus-within:text-blue-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Add */}
        <button
          onClick={() => router.push('/notes/new')}
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
        >
          + New
        </button>

        {/* Notifications */}
        <button className="p-2 hover:bg-slate-100 rounded-xl transition-all relative group">
          <svg
            className="w-5 h-5 text-slate-600 group-hover:text-slate-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 hover:bg-slate-100 rounded-xl p-1 pr-3 transition-all group">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-medium text-sm shadow-lg shadow-blue-500/20 group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-all group-hover:scale-105">
            U
          </div>
        </button>
      </div>
    </header>
  );
}
