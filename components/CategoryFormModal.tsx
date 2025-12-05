'use client';

import { useState, FormEvent } from 'react';
import Modal from './Modal';

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryFormData) => Promise<void>;
    initialData?: CategoryFormData;
    mode: 'create' | 'edit';
}

export interface CategoryFormData {
    name: string;
    icon: string;
    color: string;
    description?: string;
}

const COLOR_OPTIONS = [
    { value: 'from-blue-500 to-blue-600', label: 'Blue', preview: 'bg-gradient-to-r from-blue-500 to-blue-600' },
    { value: 'from-green-500 to-green-600', label: 'Green', preview: 'bg-gradient-to-r from-green-500 to-green-600' },
    { value: 'from-purple-500 to-purple-600', label: 'Purple', preview: 'bg-gradient-to-r from-purple-500 to-purple-600' },
    { value: 'from-red-500 to-red-600', label: 'Red', preview: 'bg-gradient-to-r from-red-500 to-red-600' },
    { value: 'from-yellow-500 to-yellow-600', label: 'Yellow', preview: 'bg-gradient-to-r from-yellow-500 to-yellow-600' },
    { value: 'from-pink-500 to-pink-600', label: 'Pink', preview: 'bg-gradient-to-r from-pink-500 to-pink-600' },
    { value: 'from-indigo-500 to-indigo-600', label: 'Indigo', preview: 'bg-gradient-to-r from-indigo-500 to-indigo-600' },
    { value: 'from-cyan-500 to-cyan-600', label: 'Cyan', preview: 'bg-gradient-to-r from-cyan-500 to-cyan-600' },
    { value: 'from-orange-500 to-orange-600', label: 'Orange', preview: 'bg-gradient-to-r from-orange-500 to-orange-600' },
    { value: 'from-teal-500 to-teal-600', label: 'Teal', preview: 'bg-gradient-to-r from-teal-500 to-teal-600' },
];

export default function CategoryFormModal({ isOpen, onClose, onSubmit, initialData, mode }: CategoryFormModalProps) {
    const [formData, setFormData] = useState<CategoryFormData>(
        initialData || {
            name: '',
            icon: '📚',
            color: 'from-blue-500 to-blue-600',
            description: '',
        }
    );
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSaving) return;

        try {
            setIsSaving(true);
            await onSubmit(formData);
            onClose();
            // Reset form
            setFormData({
                name: '',
                icon: '📚',
                color: 'from-blue-500 to-blue-600',
                description: '',
            });
        } catch (err) {
            // Error is handled in the hook
        } finally {
            setIsSaving(false);
        }
    };

    const handleClose = () => {
        if (!isSaving) {
            onClose();
            // Reset form after close animation
            setTimeout(() => {
                setFormData(initialData || {
                    name: '',
                    icon: '📚',
                    color: 'from-blue-500 to-blue-600',
                    description: '',
                });
            }, 300);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={mode === 'create' ? 'Create Category' : 'Edit Category'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category Name *
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Development"
                        required
                    />
                </div>

                {/* Icon */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon (Emoji) *
                    </label>
                    <input
                        type="text"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl"
                        placeholder="📚"
                        maxLength={10}
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter an emoji or icon</p>
                </div>

                {/* Color */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color *
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                        {COLOR_OPTIONS.map((color) => (
                            <button
                                key={color.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, color: color.value })}
                                className={`h-10 rounded-lg ${color.preview} transition-all ${formData.color === color.value
                                        ? 'ring-2 ring-offset-2 ring-blue-500 scale-105'
                                        : 'hover:scale-105'
                                    }`}
                                title={color.label}
                            />
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                        placeholder="Brief description of this category..."
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSaving}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : mode === 'create' ? 'Create Category' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
