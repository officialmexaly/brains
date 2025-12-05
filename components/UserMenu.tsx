'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function UserMenu() {
    const { user, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load user avatar
    useEffect(() => {
        async function loadAvatar() {
            if (!user) return;

            const { data: profileData } = await supabase
                .from('user_profiles')
                .select('avatar_url')
                .eq('user_id', user.id)
                .single();

            if (profileData?.avatar_url) {
                setAvatarUrl(profileData.avatar_url);
            }
        }

        loadAvatar();
    }, [user]);

    if (!user) return null;

    const getInitials = (email: string) => {
        return email.substring(0, 2).toUpperCase();
    };

    return (
        <div className="relative" ref={menuRef}>
            {/* User Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt="User avatar"
                        className="w-8 h-8 rounded-lg object-cover"
                    />
                ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials(user.email || 'U')}
                    </div>
                )}
                <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email}
                    </p>
                </div>
                <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                        href="/settings"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            signOut();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                    </button>
                </div>
            )}
        </div>
    );
}
