import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="text-6xl mb-6">🔍</div>
                <h1 className="text-6xl font-bold text-slate-900 mb-3">404</h1>
                <h2 className="text-2xl font-semibold text-slate-700 mb-3">
                    Page not found
                </h2>
                <p className="text-slate-600 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/dashboard"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        href="/search"
                        className="px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium inline-block"
                    >
                        Search
                    </Link>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-200">
                    <p className="text-sm text-slate-600 mb-4">Quick links:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Link href="/tasks" className="text-sm text-blue-600 hover:underline">
                            Tasks
                        </Link>
                        <span className="text-slate-300">•</span>
                        <Link href="/journal" className="text-sm text-blue-600 hover:underline">
                            Journal
                        </Link>
                        <span className="text-slate-300">•</span>
                        <Link href="/knowledge" className="text-sm text-blue-600 hover:underline">
                            Knowledge
                        </Link>
                        <span className="text-slate-300">•</span>
                        <Link href="/calendar" className="text-sm text-blue-600 hover:underline">
                            Calendar
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
