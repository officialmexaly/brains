'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

            // Redirect unauthenticated users to login
            if (!user && !isPublicRoute) {
                router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
            }

            // Redirect authenticated users away from auth pages
            if (user && isPublicRoute) {
                router.push('/dashboard');
            }
        }
    }, [user, loading, pathname, router]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render protected content if not authenticated (except on public routes)
    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
    if (!user && !isPublicRoute) {
        return null;
    }

    return <>{children}</>;
}
