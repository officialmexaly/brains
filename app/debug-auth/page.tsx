'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthDebugPage() {
    const [status, setStatus] = useState<any>({
        loading: true,
        session: null,
        user: null,
        error: null,
        supabaseUrl: '',
        hasAnonKey: false,
    });

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check environment variables
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

                // Check session
                const { data: { session }, error } = await supabase.auth.getSession();

                setStatus({
                    loading: false,
                    session: session,
                    user: session?.user || null,
                    error: error?.message || null,
                    supabaseUrl: supabaseUrl || 'NOT SET',
                    hasAnonKey,
                });
            } catch (err: any) {
                setStatus({
                    loading: false,
                    session: null,
                    user: null,
                    error: err.message,
                    supabaseUrl: 'ERROR',
                    hasAnonKey: false,
                });
            }
        };

        checkAuth();
    }, []);

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Auth Debug Page</h1>

                <div className="bg-white rounded-lg shadow p-6 space-y-4">
                    <div>
                        <h2 className="text-xl font-semibold mb-2">Environment Check</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Supabase URL:</span>
                                <span className={status.supabaseUrl === 'NOT SET' ? 'text-red-600' : 'text-green-600'}>
                                    {status.supabaseUrl}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Anon Key:</span>
                                <span className={!status.hasAnonKey ? 'text-red-600' : 'text-green-600'}>
                                    {status.hasAnonKey ? '✓ Set' : '✗ Not Set'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <hr />

                    <div>
                        <h2 className="text-xl font-semibold mb-2">Session Status</h2>
                        {status.loading ? (
                            <p>Loading...</p>
                        ) : (
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Session:</span>
                                    <span className={!status.session ? 'text-red-600' : 'text-green-600'}>
                                        {status.session ? '✓ Active' : '✗ No Session'}
                                    </span>
                                </div>
                                {status.user && (
                                    <div>
                                        <span className="font-medium">User Email:</span>
                                        <span className="ml-2">{status.user.email}</span>
                                    </div>
                                )}
                                {status.error && (
                                    <div className="text-red-600">
                                        <span className="font-medium">Error:</span>
                                        <span className="ml-2">{status.error}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <hr />

                    <div>
                        <h2 className="text-xl font-semibold mb-2">Test Login</h2>
                        <button
                            onClick={async () => {
                                try {
                                    const { data, error } = await supabase.auth.signInWithPassword({
                                        email: 'ejise45@gmail.com',
                                        password: 'test123456',
                                    });

                                    if (error) {
                                        alert('Login failed: ' + error.message);
                                    } else {
                                        alert('Login successful! Refreshing...');
                                        window.location.reload();
                                    }
                                } catch (err: any) {
                                    alert('Error: ' + err.message);
                                }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Test Login (ejise45@gmail.com)
                        </button>
                    </div>

                    <hr />

                    <div>
                        <h2 className="text-xl font-semibold mb-2">Raw Data</h2>
                        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                            {JSON.stringify(status, null, 2)}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
