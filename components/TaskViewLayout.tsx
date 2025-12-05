'use client';

import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface TaskViewLayoutProps {
    title: string;
    description: string;
    stats?: {
        label: string;
        value: number;
        icon: string;
        color: string;
    }[];
    showViewSwitcher?: boolean;
    currentView?: 'list' | 'kanban';
    children: ReactNode;
}

export default function TaskViewLayout({
    title,
    description,
    stats,
    showViewSwitcher = true,
    currentView = 'list',
    children,
}: TaskViewLayoutProps) {
    const router = useRouter();

    const handleCreateTask = () => {
        router.push('/tasks/new');
    };

    const handleViewSwitch = (view: 'list' | 'kanban') => {
        if (view === 'kanban') {
            router.push('/tasks/kanban');
        } else {
            router.push('/tasks');
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                                {title}
                            </h1>
                            <p className="text-slate-600 text-sm sm:text-base lg:text-lg">
                                {description}
                            </p>
                        </div>
                        {showViewSwitcher && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleViewSwitch('list')}
                                    className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${currentView === 'list'
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                    List
                                </button>
                                <button
                                    onClick={() => handleViewSwitch('kanban')}
                                    className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all ${currentView === 'kanban'
                                            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                    </svg>
                                    Kanban
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                {stats && stats.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.label}</p>
                                        <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
                                    </div>
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.color} rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Content */}
                {children}

                {/* Floating Add Button */}
                <button
                    onClick={handleCreateTask}
                    className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 transition-all hover:scale-110 flex items-center justify-center text-3xl font-light hover:rotate-90 duration-300 group z-50"
                >
                    <span className="group-hover:rotate-[-90deg] transition-transform duration-300">+</span>
                </button>
            </div>
        </div>
    );
}
