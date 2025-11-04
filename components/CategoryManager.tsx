'use client';

import { useState } from 'react';
import { useCategories } from '@/lib/hooks/useCategories';

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export default function CategoryManager() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', color: PRESET_COLORS[0] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingId) {
      await updateCategory(editingId, formData);
      setEditingId(null);
    } else {
      await createCategory(formData);
      setIsAdding(false);
    }
    setFormData({ name: '', color: PRESET_COLORS[0] });
  };

  const handleEdit = (id: string, name: string, color: string) => {
    setEditingId(id);
    setFormData({ name, color });
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', color: PRESET_COLORS[0] });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Toutes les sessions associées seront également supprimées.')) {
      await deleteCategory(id);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Chargement des catégories...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Catégories</h2>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            + Ajouter
          </button>
        )}
      </div>

      {/* Form for adding/editing */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Nom de la catégorie</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              placeholder="Ex: Développement"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Couleur</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    formData.color === color ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              {editingId ? 'Modifier' : 'Créer'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* List of categories */}
      <div className="space-y-2">
        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Aucune catégorie. Commencez par en ajouter une !</p>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium">{category.name}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category.id, category.name, category.color)}
                  className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
