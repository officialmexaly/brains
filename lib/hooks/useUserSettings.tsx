'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface UserProfile {
    display_name: string;
    bio: string;
    avatar_url: string;
}

export interface UserSettings {
    // Appearance
    theme: 'light' | 'dark' | 'system';
    accent_color: 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'red';
    font_size: 'small' | 'medium' | 'large' | 'extra-large';
    compact_mode: boolean;

    // Notifications
    email_notifications: boolean;
    push_notifications: boolean;
    task_reminders: boolean;
    weekly_digest: boolean;

    // Privacy
    profile_visibility: 'public' | 'private' | 'friends';
    show_activity: boolean;
    allow_sharing: boolean;

    // Editor
    default_view: 'rich' | 'markdown' | 'plain';
    auto_save: boolean;
    spell_check: boolean;
    markdown_preview: boolean;
}

const defaultSettings: UserSettings = {
    theme: 'system',
    accent_color: 'blue',
    font_size: 'medium',
    compact_mode: false,
    email_notifications: true,
    push_notifications: false,
    task_reminders: true,
    weekly_digest: true,
    profile_visibility: 'private',
    show_activity: false,
    allow_sharing: true,
    default_view: 'rich',
    auto_save: true,
    spell_check: true,
    markdown_preview: true,
};

export function useUserSettings() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile>({
        display_name: '',
        bio: '',
        avatar_url: '',
    });
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Load user profile and settings
    useEffect(() => {
        if (user) {
            loadUserData();
        }
    }, [user]);

    const loadUserData = async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);

            // Load profile
            const { data: profileData, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            // Handle case where table doesn't exist or no data
            if (profileError) {
                if (profileError.code === 'PGRST116') {
                    // No rows returned - create default profile
                    console.log('No profile found, using defaults');
                } else if (profileError.message?.includes('relation') || profileError.code === '42P01') {
                    // Table doesn't exist
                    console.error('Database tables not found. Please run the migration: create_user_settings.sql');
                    toast.error('Settings tables not found. Please contact administrator.');
                    setIsLoading(false);
                    return;
                } else {
                    console.error('Profile error:', profileError);
                }
            }

            if (profileData) {
                // Avatar URL is now stored directly as data URL in the profile
                // No need for additional conversion
                setProfile({
                    display_name: profileData.display_name || '',
                    bio: profileData.bio || '',
                    avatar_url: profileData.avatar_url || '',
                });
            }

            // Load settings
            const { data: settingsData, error: settingsError } = await supabase
                .from('user_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (settingsError) {
                if (settingsError.code === 'PGRST116') {
                    // No rows returned - use defaults
                    console.log('No settings found, using defaults');
                } else if (settingsError.message?.includes('relation') || settingsError.code === '42P01') {
                    // Table doesn't exist
                    console.error('Database tables not found. Please run the migration: create_user_settings.sql');
                    toast.error('Settings tables not found. Please contact administrator.');
                    setIsLoading(false);
                    return;
                } else {
                    console.error('Settings error:', settingsError);
                }
            }

            if (settingsData) {
                setSettings({
                    theme: settingsData.theme,
                    accent_color: settingsData.accent_color,
                    font_size: settingsData.font_size,
                    compact_mode: settingsData.compact_mode,
                    email_notifications: settingsData.email_notifications,
                    push_notifications: settingsData.push_notifications,
                    task_reminders: settingsData.task_reminders,
                    weekly_digest: settingsData.weekly_digest,
                    profile_visibility: settingsData.profile_visibility,
                    show_activity: settingsData.show_activity,
                    allow_sharing: settingsData.allow_sharing,
                    default_view: settingsData.default_view,
                    auto_save: settingsData.auto_save,
                    spell_check: settingsData.spell_check,
                    markdown_preview: settingsData.markdown_preview,
                });
            }
        } catch (error: any) {
            console.error('Error loading user data:', error);
            if (error?.message?.includes('relation') || error?.code === '42P01') {
                toast.error('Database not set up. Please run the migration file.');
            } else {
                toast.error('Failed to load settings');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (updates: Partial<UserProfile>) => {
        try {
            setIsSaving(true);

            const { error } = await supabase
                .from('user_profiles')
                .upsert({
                    user_id: user!.id,
                    ...profile,
                    ...updates,
                }, {
                    onConflict: 'user_id'
                });

            if (error) throw error;

            setProfile({ ...profile, ...updates });
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    const updateSettings = async (updates: Partial<UserSettings>) => {
        try {
            setIsSaving(true);

            const { error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: user!.id,
                    ...settings,
                    ...updates,
                }, {
                    onConflict: 'user_id'
                });

            if (error) throw error;

            setSettings({ ...settings, ...updates });
            toast.success('Settings saved successfully!');
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error('Failed to save settings');
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    const uploadAvatar = async (file: File) => {
        try {
            setIsSaving(true);

            // Convert file to base64 data URL
            const reader = new FileReader();

            const uploadPromise = new Promise<string>((resolve, reject) => {
                reader.onload = async () => {
                    try {
                        // Get the complete data URL (e.g., "data:image/png;base64,...")
                        const dataUrl = reader.result?.toString();
                        if (!dataUrl) throw new Error('Failed to read file');

                        // Store avatar directly in user profile
                        await updateProfile({ avatar_url: dataUrl });

                        resolve(dataUrl);
                    } catch (error) {
                        reject(error);
                    }
                };

                reader.onerror = () => reject(new Error('Failed to read file'));
                reader.readAsDataURL(file);
            });

            const url = await uploadPromise;
            toast.success('Avatar uploaded successfully!');
            return url;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error('Failed to upload avatar');
            throw error;
        } finally {
            setIsSaving(false);
        }
    };

    const exportData = async () => {
        try {
            toast.info('Preparing your data export...');

            // Fetch all user data
            const [notesRes, tasksRes, articlesRes, entriesRes] = await Promise.all([
                supabase.from('notes').select('*').eq('user_id', user!.id),
                supabase.from('tasks').select('*').eq('user_id', user!.id),
                supabase.from('knowledge_articles').select('*').eq('user_id', user!.id),
                supabase.from('journal_entries').select('*').eq('user_id', user!.id),
            ]);

            const exportData = {
                exported_at: new Date().toISOString(),
                user: {
                    email: user!.email,
                    profile,
                },
                data: {
                    notes: notesRes.data || [],
                    tasks: tasksRes.data || [],
                    articles: articlesRes.data || [],
                    entries: entriesRes.data || [],
                },
            };

            // Create and download JSON file
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `brain-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Data exported successfully!');
        } catch (error) {
            console.error('Error exporting data:', error);
            toast.error('Failed to export data');
            throw error;
        }
    };

    const clearAllData = async () => {
        try {
            // Delete all user data
            await Promise.all([
                supabase.from('notes').delete().eq('user_id', user!.id),
                supabase.from('tasks').delete().eq('user_id', user!.id),
                supabase.from('knowledge_articles').delete().eq('user_id', user!.id),
                supabase.from('journal_entries').delete().eq('user_id', user!.id),
            ]);

            toast.success('All data cleared successfully!');
        } catch (error) {
            console.error('Error clearing data:', error);
            toast.error('Failed to clear data');
            throw error;
        }
    };

    const getStorageStats = async () => {
        try {
            const [notesRes, tasksRes, articlesRes, entriesRes] = await Promise.all([
                supabase.from('notes').select('id', { count: 'exact' }).eq('user_id', user!.id),
                supabase.from('tasks').select('id', { count: 'exact' }).eq('user_id', user!.id),
                supabase.from('knowledge_articles').select('id', { count: 'exact' }).eq('user_id', user!.id),
                supabase.from('journal_entries').select('id', { count: 'exact' }).eq('user_id', user!.id),
            ]);

            return {
                notes: notesRes.count || 0,
                tasks: tasksRes.count || 0,
                articles: articlesRes.count || 0,
                entries: entriesRes.count || 0,
            };
        } catch (error) {
            console.error('Error getting storage stats:', error);
            return { notes: 0, tasks: 0, articles: 0, entries: 0 };
        }
    };

    return {
        profile,
        settings,
        isLoading,
        isSaving,
        updateProfile,
        updateSettings,
        uploadAvatar,
        exportData,
        clearAllData,
        getStorageStats,
    };
}
