'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface SidebarItem {
  name: string;
  icon: string;
  href: string;
  children?: SidebarItem[];
}

// Icon components
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const NotesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const TasksIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const KnowledgeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const JournalIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const LightningIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const TagIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const SunIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const sidebarItems = [
  { name: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
  { name: 'Calendar', icon: 'calendar', href: '/calendar' },
  {
    name: 'Notes & Ideas',
    icon: 'notes',
    href: '/notes',
    children: [
      { name: 'All Notes', icon: 'document', href: '/notes' },
      { name: 'Quick Capture', icon: 'lightning', href: '/notes/quick' },
      { name: 'Favorites', icon: 'star', href: '/notes/favorites' },
    ],
  },
  {
    name: 'Tasks',
    icon: 'tasks',
    href: '/tasks',
    children: [
      { name: 'All Tasks', icon: 'document', href: '/tasks' },
      { name: 'Today', icon: 'check', href: '/tasks/today' },
      { name: 'Upcoming', icon: 'calendar', href: '/tasks/upcoming' },
      { name: 'Completed', icon: 'check', href: '/tasks/completed' },
    ],
  },
  {
    name: 'Knowledge Base',
    icon: 'knowledge',
    href: '/knowledge',
    children: [
      { name: 'All Articles', icon: 'document', href: '/knowledge' },
      { name: 'Categories', icon: 'tag', href: '/knowledge/categories' },
    ],
  },
  {
    name: 'Journal',
    icon: 'journal',
    href: '/journal',
    children: [
      { name: 'All Entries', icon: 'document', href: '/journal' },
      { name: 'Today', icon: 'sun', href: '/journal/today' },
      { name: 'Calendar View', icon: 'calendar', href: '/journal/calendar' },
    ],
  },
];

const toolsItems = [
  { name: 'Search', icon: 'search', href: '/search' },
  { name: 'Settings', icon: 'settings', href: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Notes & Ideas', 'Tasks', 'Knowledge Base', 'Journal']);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleExpand = (itemName: string) => {
    if (isCollapsed) {
      setIsCollapsed(false);
      setExpandedItems([itemName]);
    } else {
      setExpandedItems((prev) =>
        prev.includes(itemName)
          ? prev.filter((name) => name !== itemName)
          : [...prev, itemName]
      );
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (href: string) => pathname === href;

  const renderIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      dashboard: <DashboardIcon />,
      calendar: <CalendarIcon />,
      notes: <NotesIcon />,
      tasks: <TasksIcon />,
      knowledge: <KnowledgeIcon />,
      journal: <JournalIcon />,
      document: <DocumentIcon />,
      check: <CheckIcon />,
      star: <StarIcon />,
      lightning: <LightningIcon />,
      tag: <TagIcon />,
      sun: <SunIcon />,
      search: <SearchIcon />,
      settings: <SettingsIcon />,
    };
    return icons[iconName] || null;
  };

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 backdrop-blur-xl border-r border-slate-200/60 flex flex-col shadow-sm transition-all duration-300`}>
      {/* Logo */}
      <div className="p-6 border-b border-slate-200/60 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20 group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-all group-hover:scale-105">
            B
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Brain</span>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-slate-200/60 rounded-lg transition-all"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className={`w-4 h-4 text-slate-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div>
          {!isCollapsed && (
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              General
            </p>
          )}
          {sidebarItems.map((item) => (
            <div key={item.name} className="mb-1">
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                      pathname.startsWith(item.href)
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-700 hover:bg-white/60 hover:shadow-sm'
                    }`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <div className="flex items-center gap-3">
                      {renderIcon(item.icon)}
                      {!isCollapsed && <span>{item.name}</span>}
                    </div>
                    {!isCollapsed && (
                      <span className={`text-xs transform transition-transform ${expandedItems.includes(item.name) ? 'rotate-90' : ''}`}>
                        ▶
                      </span>
                    )}
                  </button>
                  {!isCollapsed && expandedItems.includes(item.name) && (
                    <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-slate-200 pl-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all ${
                            isActive(child.href)
                              ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                              : 'text-slate-600 hover:bg-white/60 hover:text-slate-900'
                          }`}
                        >
                          {renderIcon(child.icon)}
                          <span>{child.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-700 hover:bg-white/60 hover:shadow-sm'
                  }`}
                  title={isCollapsed ? item.name : ''}
                >
                  {renderIcon(item.icon)}
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          {!isCollapsed && (
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Tools
            </p>
          )}
          {toolsItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-700 hover:bg-white/60 hover:shadow-sm'
              }`}
              title={isCollapsed ? item.name : ''}
            >
              {renderIcon(item.icon)}
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-200/60">
        <button className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-white/60 rounded-xl transition-all group`}>
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-medium shadow-lg shadow-blue-500/20 group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-all group-hover:scale-105">
            U
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left">
              <p className="font-semibold">Your Brain</p>
              <p className="text-xs text-slate-500">Manage account</p>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
