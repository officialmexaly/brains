'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="text-6xl mb-6">⚠️</div>
                <h1 className="text-3xl font-bold text-slate-900 mb-3">
                    Something went wrong
                </h1>
                <p className="text-slate-600 mb-6">
                    We encountered an unexpected error. Don't worry, your data is safe.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                    <p className="text-sm text-red-800 font-mono break-all">
                        {error.message || 'An unknown error occurred'}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
