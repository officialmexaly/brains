'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ChangePasswordModalProps {
    onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/[a-z]/.test(password)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/[0-9]/.test(password)) {
            return 'Password must contain at least one number';
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (currentPassword === newPassword) {
            toast.error('New password must be different from current password');
            return;
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            toast.error(passwordError);
            return;
        }

        setIsLoading(true);

        try {
            // Update password using Supabase
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) {
                // Check if it's a session error
                if (error.message.includes('session')) {
                    toast.error('Please sign in again to change your password');
                } else {
                    toast.error(error.message || 'Failed to change password');
                }
                return;
            }

            toast.success('Password changed successfully!');
            onClose();
        } catch (error: any) {
            console.error('Error changing password:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const getPasswordStrength = (password: string): { strength: number; label: string; color: string } => {
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        if (strength <= 2) return { strength: 33, label: 'Weak', color: 'bg-red-500' };
        if (strength <= 4) return { strength: 66, label: 'Medium', color: 'bg-yellow-500' };
        return { strength: 100, label: 'Strong', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(newPassword);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-purple-50">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Change Password
                    </h2>
                    <p className="text-sm text-slate-600 mt-1">
                        Update your password to keep your account secure
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder="Enter current password"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder="Enter new password"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showNewPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {newPassword && (
                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-slate-600">Password Strength</span>
                                    <span className={`text-xs font-semibold ${passwordStrength.label === 'Weak' ? 'text-red-600' :
                                            passwordStrength.label === 'Medium' ? 'text-yellow-600' :
                                                'text-green-600'
                                        }`}>
                                        {passwordStrength.label}
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                        style={{ width: `${passwordStrength.strength}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder="Confirm new password"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                        )}
                    </div>

                    {/* Password Requirements */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <p className="text-xs font-semibold text-blue-900 mb-2">Password Requirements:</p>
                        <ul className="text-xs text-blue-700 space-y-1">
                            <li className="flex items-center gap-2">
                                <span>{newPassword.length >= 8 ? '✅' : '⭕'}</span>
                                At least 8 characters
                            </li>
                            <li className="flex items-center gap-2">
                                <span>{/[A-Z]/.test(newPassword) ? '✅' : '⭕'}</span>
                                One uppercase letter
                            </li>
                            <li className="flex items-center gap-2">
                                <span>{/[a-z]/.test(newPassword) ? '✅' : '⭕'}</span>
                                One lowercase letter
                            </li>
                            <li className="flex items-center gap-2">
                                <span>{/[0-9]/.test(newPassword) ? '✅' : '⭕'}</span>
                                One number
                            </li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-6 py-3 bg-white text-slate-700 border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-medium disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Changing...' : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
