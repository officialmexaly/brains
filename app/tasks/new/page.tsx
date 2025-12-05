'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTasks } from '@/lib/hooks/useTasks';
import { toast } from 'sonner';

const CATEGORIES = [
    { value: 'Work', label: 'Work', icon: '💼' },
    { value: 'Personal', label: 'Personal', icon: '🏠' },
    { value: 'Health', label: 'Health', icon: '❤️' },
    { value: 'Learning', label: 'Learning', icon: '📚' },
    { value: 'Finance', label: 'Finance', icon: '💰' },
    { value: 'Other', label: 'Other', icon: '📌' },
];

const PRIORITIES = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700 border-green-300' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-700 border-red-300' },
];

const STATUSES = [
    { value: 'todo', label: 'To Do', icon: '📋' },
    { value: 'in-progress', label: 'In Progress', icon: '🔄' },
    { value: 'completed', label: 'Completed', icon: '✅' },
];

const AVAILABLE_TAGS = [
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
    { value: 'important', label: 'Important', color: 'bg-orange-100 text-orange-700' },
    { value: 'meeting', label: 'Meeting', color: 'bg-purple-100 text-purple-700' },
    { value: 'research', label: 'Research', color: 'bg-blue-100 text-blue-700' },
    { value: 'review', label: 'Review', color: 'bg-teal-100 text-teal-700' },
    { value: 'planning', label: 'Planning', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'bug', label: 'Bug', color: 'bg-pink-100 text-pink-700' },
    { value: 'feature', label: 'Feature', color: 'bg-green-100 text-green-700' },
];

const REMINDER_OPTIONS = [
    { value: '', label: 'No Reminder' },
    { value: '15min', label: '15 minutes before' },
    { value: '30min', label: '30 minutes before' },
    { value: '1hour', label: '1 hour before' },
    { value: '1day', label: '1 day before' },
    { value: '1week', label: '1 week before' },
];

interface Subtask {
    id: string;
    text: string;
    completed: boolean;
}

export default function NewTaskPage() {
    const router = useRouter();
    const { createTask } = useTasks();
    const [activeTab, setActiveTab] = useState<'basic' | 'properties'>('basic');
    const [isSaving, setIsSaving] = useState(false);

    // Basic Info
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);
    const [newSubtask, setNewSubtask] = useState('');

    // Properties
    const [category, setCategory] = useState('Work');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [status, setStatus] = useState<'todo' | 'in-progress' | 'completed'>('todo');
    const [startDate, setStartDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [timeEstimate, setTimeEstimate] = useState('');
    const [timeUnit, setTimeUnit] = useState<'minutes' | 'hours' | 'days'>('hours');
    const [reminder, setReminder] = useState('');
    const [notes, setNotes] = useState('');

    const handleToggleTag = (tagValue: string) => {
        setTags(prev =>
            prev.includes(tagValue)
                ? prev.filter(t => t !== tagValue)
                : [...prev, tagValue]
        );
    };

    const handleAddSubtask = () => {
        if (newSubtask.trim()) {
            setSubtasks(prev => [
                ...prev,
                { id: Date.now().toString(), text: newSubtask.trim(), completed: false }
            ]);
            setNewSubtask('');
        }
    };

    const handleToggleSubtask = (id: string) => {
        setSubtasks(prev =>
            prev.map(st => st.id === id ? { ...st, completed: !st.completed } : st)
        );
    };

    const handleDeleteSubtask = (id: string) => {
        setSubtasks(prev => prev.filter(st => st.id !== id));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (isSaving) return;

        if (!title.trim()) {
            toast.error('Please enter a title');
            return;
        }

        if (!description.trim()) {
            toast.error('Please enter a description');
            return;
        }

        try {
            setIsSaving(true);

            await createTask({
                title: title.trim(),
                description: description.trim(),
                category,
                priority,
                status,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                tags,
                subtasks,
                startDate: startDate ? new Date(startDate) : undefined,
                timeEstimate: timeEstimate ? { value: parseInt(timeEstimate), unit: timeUnit } : undefined,
                reminder,
                notes,
            });

            toast.success('Task created successfully');
            router.push('/tasks');
        } catch (err) {
            console.error('Error creating task:', err);
            toast.error('Failed to create task');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.push('/tasks');
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-screen-xl mx-auto">
                {/* Header */}
                <div className="mb-4 sm:mb-6">
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="text-sm sm:text-base">Back to Tasks</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Task Card */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-slate-200/60 shadow-xl overflow-hidden">
                        {/* Task Header */}
                        <div className="p-4 sm:p-6 border-b border-slate-200/60">
                            <div className="mb-4">
                                <div className="flex-1 mb-4">
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="text-2xl sm:text-3xl font-bold text-slate-900 bg-transparent border-none focus:outline-none w-full placeholder:text-slate-400"
                                        placeholder="Task title..."
                                        required
                                    />
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-3">
                                        <span className={`px-2.5 py-1 rounded-md font-medium text-xs whitespace-nowrap ${PRIORITIES.find(p => p.value === priority)?.color}`}>
                                            {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                                        </span>
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-900 rounded-md font-medium text-xs whitespace-nowrap flex items-center gap-1">
                                            <span>{CATEGORIES.find(c => c.value === category)?.icon}</span>
                                            {category}
                                        </span>
                                        {tags.map(tag => {
                                            const tagInfo = AVAILABLE_TAGS.find(t => t.value === tag);
                                            return (
                                                <span key={tag} className={`px-2.5 py-1 rounded-md font-medium text-xs whitespace-nowrap ${tagInfo?.color}`}>
                                                    {tagInfo?.label}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-medium text-sm sm:text-base order-2 sm:order-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-2"
                                    >
                                        {isSaving ? 'Creating...' : 'Create Task'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-slate-200/60">
                            <div className="flex px-4 sm:px-6">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('basic')}
                                    className={`px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'basic'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Basic Info
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('properties')}
                                    className={`px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-all ${activeTab === 'properties'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-slate-600 hover:text-slate-900'
                                        }`}
                                >
                                    Properties
                                </button>
                            </div>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'basic' && (
                            <div className="p-4 sm:p-8 space-y-6">
                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 min-h-[150px]"
                                        placeholder="Describe your task in detail..."
                                        required
                                    />
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Tags
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {AVAILABLE_TAGS.map(tag => (
                                            <button
                                                key={tag.value}
                                                type="button"
                                                onClick={() => handleToggleTag(tag.value)}
                                                className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-all border-2 ${tags.includes(tag.value)
                                                    ? `${tag.color} border-current`
                                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                {tags.includes(tag.value) && '✓ '}
                                                {tag.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Subtasks */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                                        Subtasks / Checklist
                                    </label>
                                    <div className="space-y-2">
                                        {subtasks.map(subtask => (
                                            <div key={subtask.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg group">
                                                <input
                                                    type="checkbox"
                                                    checked={subtask.completed}
                                                    onChange={() => handleToggleSubtask(subtask.id)}
                                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                                    {subtask.text}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteSubtask(subtask.id)}
                                                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newSubtask}
                                                onChange={(e) => setNewSubtask(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                                                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                placeholder="Add a subtask..."
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddSubtask}
                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'properties' && (
                            <div className="p-4 sm:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Category
                                        </label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                        >
                                            {CATEGORIES.map((cat) => (
                                                <option key={cat.value} value={cat.value}>
                                                    {cat.icon} {cat.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Priority */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Priority
                                        </label>
                                        <select
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value as any)}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                        >
                                            {PRIORITIES.map((p) => (
                                                <option key={p.value} value={p.value}>
                                                    {p.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Status
                                        </label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value as any)}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                        >
                                            {STATUSES.map((s) => (
                                                <option key={s.value} value={s.value}>
                                                    {s.icon} {s.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Start Date */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                        />
                                    </div>

                                    {/* Due Date */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Due Date
                                        </label>
                                        <input
                                            type="date"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                        />
                                    </div>

                                    {/* Time Estimate */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Time Estimate
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={timeEstimate}
                                                onChange={(e) => setTimeEstimate(e.target.value)}
                                                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                                placeholder="0"
                                                min="0"
                                            />
                                            <select
                                                value={timeUnit}
                                                onChange={(e) => setTimeUnit(e.target.value as any)}
                                                className="px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                            >
                                                <option value="minutes">Minutes</option>
                                                <option value="hours">Hours</option>
                                                <option value="days">Days</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Reminder */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Reminder
                                        </label>
                                        <select
                                            value={reminder}
                                            onChange={(e) => setReminder(e.target.value)}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900"
                                        >
                                            {REMINDER_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Notes */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                                            Additional Notes
                                        </label>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 min-h-[100px]"
                                            placeholder="Add any additional notes, context, or links..."
                                        />
                                    </div>

                                    {/* Info Box */}
                                    <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                                        <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                            <span>💡</span>
                                            <span>Pro Tips</span>
                                        </h4>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            <li>• Set realistic time estimates to better plan your day</li>
                                            <li>• Use reminders to never miss important deadlines</li>
                                            <li>• Add start dates to schedule when you'll begin working</li>
                                            <li>• Break down complex tasks into subtasks for better tracking</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
