'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import Header from './Header';

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password'];
const FULL_SCREEN_ROUTES: string[] = []; // Canvas now uses standard layout

export default function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthRoute = AUTH_ROUTES.includes(pathname);
    const isFullScreenRoute = FULL_SCREEN_ROUTES.includes(pathname);

    if (isAuthRoute || isFullScreenRoute) {
        // Auth pages and full-screen pages don't need sidebar/header
        return <>{children}</>;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Sidebar - Hidden on mobile, visible on desktop */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileNav />
        </div>
    );
}
