'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCategories } from '@/lib/hooks/useCategories';
import { useKnowledgeArticles } from '@/lib/hooks/useKnowledgeArticles';
import CategoryFormModal, { CategoryFormData } from '@/components/CategoryFormModal';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const router = useRouter();
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } = useCategories();
  const { articles } = useKnowledgeArticles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Get article count for each category
  const getCategoryArticleCount = (categoryName: string) => {
    return articles.filter(article => article.category === categoryName).length;
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CategoryFormData) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, data);
    } else {
      await createCategory(data);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const articleCount = getCategoryArticleCount(name);

    if (articleCount > 0) {
      const confirmed = window.confirm(
        `This category has ${articleCount} article${articleCount > 1 ? 's' : ''}. Please reassign or delete the articles first before deleting this category.`
      );
      if (!confirmed) return;
      toast.error(`Cannot delete category with ${articleCount} article${articleCount > 1 ? 's' : ''}`);
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete the "${name}" category?`);
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await deleteCategory(id);
    } catch (err) {
      // Error handled in hook
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12 sm:py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
              <p className="text-gray-600 text-base sm:text-lg">Loading categories...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Categories
            </h1>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all font-medium text-sm sm:text-base flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Category
            </button>
          </div>
          <p className="text-slate-600 text-sm sm:text-base lg:text-lg">
            Manage your knowledge base categories.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="flex items-center justify-center py-12 sm:py-20 px-4">
            <div className="text-center max-w-md">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">📚</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No categories yet</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-5 sm:mb-6">
                Create your first category to organize your knowledge base.
              </p>
              <button
                onClick={handleCreate}
                className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg sm:rounded-xl font-medium text-sm sm:text-base hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
              >
                Create Your First Category
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {categories.map((category) => {
              const articleCount = getCategoryArticleCount(category.name);
              return (
                <div
                  key={category.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-slate-200/60 hover:shadow-xl hover:shadow-blue-500/10 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg`}>
                      {category.icon}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit category"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        disabled={deletingId === category.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete category"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2 min-h-[40px]">
                    {category.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <p className="text-sm text-slate-600">{articleCount} {articleCount === 1 ? 'article' : 'articles'}</p>
                    <button
                      onClick={() => router.push(`/knowledge?category=${encodeURIComponent(category.name)}`)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingCategory ? {
          name: editingCategory.name,
          icon: editingCategory.icon,
          color: editingCategory.color,
          description: editingCategory.description,
        } : undefined}
        mode={editingCategory ? 'edit' : 'create'}
      />
    </div>
  );
}
