'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import UserMenu from './UserMenu';

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

const CanvasIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
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

const ChevronIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const sidebarItems = [
  { name: 'Dashboard', icon: 'dashboard', href: '/dashboard' },
  { name: 'Calendar', icon: 'calendar', href: '/calendar' },
  { name: 'Canvas', icon: 'canvas', href: '/canvas' },
  {
    name: 'Notes & Ideas',
    icon: 'notes',
    href: '/notes',
    children: [
      { name: 'All Notes', icon: 'notes', href: '/notes' },
      { name: 'Quick Capture', icon: 'notes', href: '/notes/quick' },
      { name: 'Favorites', icon: 'notes', href: '/notes/favorites' },
    ],
  },
  {
    name: 'Tasks',
    icon: 'tasks',
    href: '/tasks',
    children: [
      { name: 'All Tasks', icon: 'tasks', href: '/tasks' },
      { name: 'Today', icon: 'tasks', href: '/tasks/today' },
      { name: 'Upcoming', icon: 'tasks', href: '/tasks/upcoming' },
      { name: 'Completed', icon: 'tasks', href: '/tasks/completed' },
    ],
  },
  {
    name: 'Knowledge Base',
    icon: 'knowledge',
    href: '/knowledge',
    children: [
      { name: 'All Articles', icon: 'knowledge', href: '/knowledge' },
      { name: 'Categories', icon: 'knowledge', href: '/knowledge/categories' },
    ],
  },
  {
    name: 'Journal',
    icon: 'journal',
    href: '/journal',
    children: [
      { name: 'All Entries', icon: 'journal', href: '/journal' },
      { name: 'Today', icon: 'journal', href: '/journal/today' },
      { name: 'Calendar View', icon: 'journal', href: '/journal/calendar' },
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
      canvas: <CanvasIcon />,
      notes: <NotesIcon />,
      tasks: <TasksIcon />,
      knowledge: <KnowledgeIcon />,
      journal: <JournalIcon />,
      search: <SearchIcon />,
      settings: <SettingsIcon />,
    };
    return icons[iconName] || null;
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-200`}>
      {/* Logo */}
      <div className="h-14 px-4 border-b border-gray-200 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            B
          </div>
          {!isCollapsed && (
            <span className="text-base font-semibold text-slate-900">Brain</span>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg className={`w-4 h-4 text-gray-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <div key={item.name}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpand(item.name)}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname.startsWith(item.href)
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <div className="flex items-center gap-3">
                      {renderIcon(item.icon)}
                      {!isCollapsed && <span>{item.name}</span>}
                    </div>
                    {!isCollapsed && (
                      <ChevronIcon />
                    )}
                  </button>
                  {!isCollapsed && expandedItems.includes(item.name) && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${isActive(child.href)
                              ? 'text-blue-600 bg-blue-50 font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive(item.href)
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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

        <div className="mt-6 pt-6 border-t border-gray-200 space-y-1">
          {toolsItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive(item.href)
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
      <div className="p-3 border-t border-gray-200">
        <UserMenu />
      </div>
    </div>
  );
}
