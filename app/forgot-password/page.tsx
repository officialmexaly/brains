'use client';

import { useState, FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        try {
            setIsLoading(true);
            await resetPassword(email);
            setEmailSent(true);
        } catch (error) {
            // Error handled in AuthContext
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Brain
                    </h1>
                    <p className="text-gray-600">Reset your password</p>
                </div>

                {/* Reset Password Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 p-8">
                    {!emailSent ? (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot password?</h2>
                            <p className="text-gray-600 mb-6">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Sending...' : 'Send reset link'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                            <p className="text-gray-600 mb-6">
                                We've sent a password reset link to <strong>{email}</strong>
                            </p>
                            <p className="text-sm text-gray-500">
                                Didn't receive the email? Check your spam folder or{' '}
                                <button
                                    onClick={() => setEmailSent(false)}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    try again
                                </button>
                            </p>
                        </div>
                    )}

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                            ← Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
