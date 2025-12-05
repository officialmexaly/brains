'use client';

interface Category {
    value: string;
    label: string;
    icon: string;
}

interface CategorySelectorProps {
    value: string;
    onChange: (value: string) => void;
    categories: Category[];
    label?: string;
}

export default function CategorySelector({ value, onChange, categories, label }: CategorySelectorProps) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => (
                    <button
                        key={category.value}
                        type="button"
                        onClick={() => onChange(category.value)}
                        className={`
              relative p-4 rounded-xl border-2 transition-all duration-200
              flex flex-col items-center justify-center gap-2
              hover:shadow-md
              ${value === category.value
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 bg-white hover:border-gray-300'
                            }
            `}
                    >
                        <span className="text-2xl">{category.icon}</span>
                        <span className={`text-sm font-medium ${value === category.value ? 'text-blue-700' : 'text-gray-700'
                            }`}>
                            {category.label}
                        </span>
                        {value === category.value && (
                            <div className="absolute top-2 right-2">
                                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
