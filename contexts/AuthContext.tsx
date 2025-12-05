'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithGithub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // Update the user state immediately
            if (data.session) {
                setUser(data.session.user);
            }

            toast.success('Welcome back!');

            // Check for redirectTo parameter in URL
            const urlParams = new URLSearchParams(window.location.search);
            const redirectTo = urlParams.get('redirectTo') || '/dashboard';

            // Small delay to ensure cookies are set
            await new Promise(resolve => setTimeout(resolve, 100));

            // Use router.push with refresh to ensure middleware runs with updated session
            router.push(redirectTo);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Failed to sign in');
            throw error;
        }
    };

    const signUp = async (email: string, password: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            // Update the user state immediately
            if (data.session) {
                setUser(data.session.user);
            }

            toast.success('Account created successfully!');

            // Small delay to ensure cookies are set
            await new Promise(resolve => setTimeout(resolve, 100));

            // Use router.push with refresh to ensure middleware runs with updated session
            router.push('/dashboard');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Failed to sign up');
            throw error;
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            toast.success('Signed out successfully');
            router.push('/login');
        } catch (error: any) {
            toast.error(error.message || 'Failed to sign out');
            throw error;
        }
    };

    const resetPassword = async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            toast.success('Password reset email sent!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to send reset email');
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                },
            });

            if (error) throw error;
        } catch (error: any) {
            toast.error(error.message || 'Failed to sign in with Google');
            throw error;
        }
    };

    const signInWithGithub = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                },
            });

            if (error) throw error;
        } catch (error: any) {
            toast.error(error.message || 'Failed to sign in with GitHub');
            throw error;
        }
    };

    const value = {
        user,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        signInWithGoogle,
        signInWithGithub,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
