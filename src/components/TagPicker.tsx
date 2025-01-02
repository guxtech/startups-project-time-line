import React from 'react';
import type { Tag } from '../types/project';

interface TagPickerProps {
  tags: Tag[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  className?: string;
}

export function TagPicker({ tags, selectedTagIds, onChange, className = '' }: TagPickerProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => {
            const newSelectedTags = selectedTagIds.includes(tag.id)
              ? selectedTagIds.filter(id => id !== tag.id)
              : [...selectedTagIds, tag.id];
            onChange(newSelectedTags);
          }}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-all
            ${selectedTagIds.includes(tag.id)
              ? `${tag.color} border-2 border-current shadow-sm`
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}