'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserSettings } from '@/lib/hooks/useUserSettings';
import { toast } from 'sonner';
import AvatarEditor from '@/components/AvatarEditor';
import ChangePasswordModal from '@/components/ChangePasswordModal';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const {
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
  } = useUserSettings();

  const [activeTab, setActiveTab] = useState('profile');
  const [storageStats, setStorageStats] = useState({ notes: 0, tasks: 0, articles: 0, entries: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for form inputs
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  // Avatar editor state
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  useEffect(() => {
    loadStorageStats();
  }, []);

  const loadStorageStats = async () => {
    const stats = await getStorageStats();
    setStorageStats(stats);
  };

  const handleSaveProfile = async () => {
    await updateProfile({ display_name: displayName, bio });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }

      // Read file and show editor
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setShowAvatarEditor(true);
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveAvatar = async (croppedImageBlob: Blob) => {
    // Convert blob to file
    const file = new File([croppedImageBlob], 'avatar.jpg', { type: 'image/jpeg' });
    await uploadAvatar(file);
    setShowAvatarEditor(false);
    setSelectedImage(null);
  };

  const handleCancelEditor = () => {
    setShowAvatarEditor(false);
    setSelectedImage(null);
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Are you sure you want to remove your avatar?')) {
      return;
    }
    await updateProfile({ avatar_url: '' });
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') {
      toast.error('Account deletion cancelled');
      return;
    }
    try {
      await clearAllData();
      toast.success('Account deleted');
      await signOut();
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  const handleClearData = async () => {
    if (!confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      return;
    }
    await clearAllData();
    await loadStorageStats();
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'editor', label: 'Editor', icon: '✏️' },
    { id: 'data', label: 'Data & Storage', icon: '💾' },
    { id: 'account', label: 'Account', icon: '⚙️' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-slate-600">
            Manage your preferences and customize your Brain experience.
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-xl p-2 sticky top-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <span className="text-xl">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-xl p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Profile Information</h2>
                    <p className="text-slate-600">Update your personal information and profile picture.</p>
                  </div>

                  <div className="flex items-start gap-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl border border-slate-200/60">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden shadow-lg ring-4 ring-white">
                        {profile.avatar_url ? (
                          <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'
                        )}
                      </div>
                      <button
                        onClick={handleAvatarClick}
                        className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-white text-3xl">📷</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-2">Profile Picture</h3>
                      <p className="text-sm text-slate-600 mb-4">
                        Upload a photo to personalize your profile. JPG, PNG or GIF. Max 2MB.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleAvatarClick}
                          disabled={isSaving}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium disabled:opacity-50 flex items-center gap-2"
                        >
                          <span>📤</span>
                          Upload Photo
                        </button>
                        {profile.avatar_url && (
                          <button
                            onClick={handleRemoveAvatar}
                            disabled={isSaving}
                            className="px-5 py-2.5 bg-white text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-all font-medium disabled:opacity-50 flex items-center gap-2"
                          >
                            <span>🗑️</span>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                    <p className="text-sm text-slate-500 mt-1">{bio.length}/500 characters</p>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Appearance</h2>
                    <p className="text-slate-600">Customize how Brain looks and feels.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {(['light', 'dark', 'system'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => updateSettings({ theme: t })}
                          className={`p-4 rounded-xl border-2 transition-all ${settings.theme === t
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                            }`}
                        >
                          <div className="text-2xl mb-2">
                            {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'}
                          </div>
                          <div className="font-medium capitalize">{t}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      Accent Color
                    </label>
                    <div className="grid grid-cols-6 gap-3">
                      {(['blue', 'purple', 'pink', 'green', 'orange', 'red'] as const).map((color) => (
                        <button
                          key={color}
                          onClick={() => updateSettings({ accent_color: color })}
                          className={`w-12 h-12 rounded-xl transition-all ${settings.accent_color === color ? 'ring-4 ring-offset-2 ring-slate-300' : ''
                            }`}
                          style={{
                            background: {
                              blue: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                              purple: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                              pink: 'linear-gradient(135deg, #ec4899, #db2777)',
                              green: 'linear-gradient(135deg, #10b981, #059669)',
                              orange: 'linear-gradient(135deg, #f97316, #ea580c)',
                              red: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            }[color],
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      Font Size
                    </label>
                    <select
                      value={settings.font_size}
                      onChange={(e) => updateSettings({ font_size: e.target.value as any })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="extra-large">Extra Large</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <div className="font-semibold text-slate-900">Compact Mode</div>
                      <div className="text-sm text-slate-600">Reduce spacing for more content</div>
                    </div>
                    <button
                      onClick={() => updateSettings({ compact_mode: !settings.compact_mode })}
                      className={`relative w-14 h-8 rounded-full transition-colors ${settings.compact_mode ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${settings.compact_mode ? 'translate-x-6' : ''
                          }`}
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Notifications</h2>
                    <p className="text-slate-600">Manage how you receive notifications.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'email_notifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                      { key: 'push_notifications', label: 'Push Notifications', desc: 'Browser push notifications' },
                      { key: 'task_reminders', label: 'Task Reminders', desc: 'Get reminded about upcoming tasks' },
                      { key: 'weekly_digest', label: 'Weekly Digest', desc: 'Summary of your weekly activity' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <div className="font-semibold text-slate-900">{item.label}</div>
                          <div className="text-sm text-slate-600">{item.desc}</div>
                        </div>
                        <button
                          onClick={() => updateSettings({ [item.key]: !settings[item.key as keyof typeof settings] })}
                          className={`relative w-14 h-8 rounded-full transition-colors ${settings[item.key as keyof typeof settings] ? 'bg-blue-600' : 'bg-slate-300'
                            }`}
                        >
                          <div
                            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${settings[item.key as keyof typeof settings] ? 'translate-x-6' : ''
                              }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Privacy & Security</h2>
                    <p className="text-slate-600">Control your privacy and security settings.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      Profile Visibility
                    </label>
                    <select
                      value={settings.profile_visibility}
                      onChange={(e) => updateSettings({ profile_visibility: e.target.value as any })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="public">Public - Anyone can see</option>
                      <option value="private">Private - Only you</option>
                      <option value="friends">Friends - People you share with</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'show_activity', label: 'Show Activity Status', desc: "Let others see when you're active" },
                      { key: 'allow_sharing', label: 'Allow Resource Sharing', desc: 'Enable sharing notes and tasks' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <div className="font-semibold text-slate-900">{item.label}</div>
                          <div className="text-sm text-slate-600">{item.desc}</div>
                        </div>
                        <button
                          onClick={() => updateSettings({ [item.key]: !settings[item.key as keyof typeof settings] })}
                          className={`relative w-14 h-8 rounded-full transition-colors ${settings[item.key as keyof typeof settings] ? 'bg-blue-600' : 'bg-slate-300'
                            }`}
                        >
                          <div
                            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${settings[item.key as keyof typeof settings] ? 'translate-x-6' : ''
                              }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">🔐</span>
                      <div>
                        <h3 className="font-semibold text-amber-900 mb-1">Two-Factor Authentication</h3>
                        <p className="text-sm text-amber-700 mb-3">Add an extra layer of security to your account</p>
                        <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium">
                          Enable 2FA
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Editor Tab */}
              {activeTab === 'editor' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Editor Preferences</h2>
                    <p className="text-slate-600">Customize your writing experience.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                      Default Editor View
                    </label>
                    <select
                      value={settings.default_view}
                      onChange={(e) => updateSettings({ default_view: e.target.value as any })}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="rich">Rich Text Editor</option>
                      <option value="markdown">Markdown Editor</option>
                      <option value="plain">Plain Text</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    {[
                      { key: 'auto_save', label: 'Auto-Save', desc: 'Automatically save changes' },
                      { key: 'spell_check', label: 'Spell Check', desc: 'Check spelling as you type' },
                      { key: 'markdown_preview', label: 'Markdown Preview', desc: 'Show live preview in markdown mode' },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <div className="font-semibold text-slate-900">{item.label}</div>
                          <div className="text-sm text-slate-600">{item.desc}</div>
                        </div>
                        <button
                          onClick={() => updateSettings({ [item.key]: !settings[item.key as keyof typeof settings] })}
                          className={`relative w-14 h-8 rounded-full transition-colors ${settings[item.key as keyof typeof settings] ? 'bg-blue-600' : 'bg-slate-300'
                            }`}
                        >
                          <div
                            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${settings[item.key as keyof typeof settings] ? 'translate-x-6' : ''
                              }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Data & Storage Tab */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Data & Storage</h2>
                    <p className="text-slate-600">Manage your data and storage usage.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="text-2xl mb-2">📝</div>
                      <div className="text-2xl font-bold text-slate-900">{storageStats.notes}</div>
                      <div className="text-sm text-slate-600">Notes</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="text-2xl mb-2">✅</div>
                      <div className="text-2xl font-bold text-slate-900">{storageStats.tasks}</div>
                      <div className="text-sm text-slate-600">Tasks</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="text-2xl mb-2">📚</div>
                      <div className="text-2xl font-bold text-slate-900">{storageStats.articles}</div>
                      <div className="text-sm text-slate-600">Articles</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="text-2xl mb-2">📔</div>
                      <div className="text-2xl font-bold text-slate-900">{storageStats.entries}</div>
                      <div className="text-sm text-slate-600">Journal Entries</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={exportData}
                      disabled={isSaving}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <span>📥</span>
                      {isSaving ? 'Exporting...' : 'Export All Data'}
                    </button>
                    <button
                      onClick={handleClearData}
                      disabled={isSaving}
                      className="w-full px-6 py-3 bg-white text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <span>🗑️</span>
                      Clear All Data
                    </button>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Account Settings</h2>
                    <p className="text-slate-600">Manage your account and security.</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">Change Password</div>
                        <div className="text-sm text-slate-600">Update your password regularly</div>
                      </div>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Change
                      </button>
                    </div>
                  </div>

                  <div className="border-t-2 border-red-200 pt-6 mt-6">
                    <div className="p-6 bg-red-50 border-2 border-red-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">⚠️</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-red-900 text-lg mb-2">Danger Zone</h3>
                          <p className="text-sm text-red-700 mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                          </p>
                          <button
                            onClick={handleDeleteAccount}
                            disabled={isSaving}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Editor Modal */}
      {showAvatarEditor && selectedImage && (
        <AvatarEditor
          imageSrc={selectedImage}
          onSave={handleSaveAvatar}
          onCancel={handleCancelEditor}
        />
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
}
