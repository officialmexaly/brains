import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Debug logging
    console.log('Middleware - Path:', request.nextUrl.pathname);
    console.log('Middleware - Has session:', !!session);
    console.log('Middleware - User:', session?.user?.email);

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password'];
    const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));

    // If not authenticated and trying to access protected route
    if (!session && !isPublicRoute) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // If authenticated and trying to access auth pages, redirect to dashboard
    if (session && isPublicRoute && request.nextUrl.pathname !== '/') {
        const dashboardUrl = new URL('/dashboard', request.url);
        return NextResponse.redirect(dashboardUrl);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
