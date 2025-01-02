import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Tag } from '../types/project';

interface TagManagerProps {
  tags: Tag[];
  onAddTag: (tag: Tag) => void;
  onDeleteTag: (tagId: string) => void;
}

const colorOptions = [
  { label: 'Gris', value: 'bg-slate-100 text-slate-700' },
  { label: 'Rojo', value: 'bg-red-100 text-red-700' },
  { label: 'Amarillo', value: 'bg-amber-100 text-amber-700' },
  { label: 'Verde', value: 'bg-emerald-100 text-emerald-700' },
  { label: 'Azul', value: 'bg-blue-100 text-blue-700' },
  { label: 'Morado', value: 'bg-purple-100 text-purple-700' },
  { label: 'Rosa', value: 'bg-pink-100 text-pink-700' },
];

export function TagManager({ tags, onAddTag, onDeleteTag }: TagManagerProps) {
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);

  const handleAddTag = () => {
    if (newTagName.trim()) {
      onAddTag({
        id: crypto.randomUUID(),
        name: newTagName.trim(),
        color: selectedColor,
      });
      setNewTagName('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Gestión de Etiquetas</h3>
        
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="Nueva etiqueta"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
          />
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {colorOptions.map((color) => (
              <option key={color.value} value={color.value}>
                {color.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAddTag}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-200"
            >
              <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${tag.color}`}>
                {tag.name}
              </span>
              <button
                type="button"
                onClick={() => onDeleteTag(tag.id)}
                className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}