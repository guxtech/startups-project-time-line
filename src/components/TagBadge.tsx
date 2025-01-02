import React from 'react';
import type { Tag } from '../types/project';

interface TagBadgeProps {
  tag: Tag;
  className?: string;
}

export function TagBadge({ tag, className = '' }: TagBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tag.color} ${className}`}>
      {tag.name}
    </span>
  );
}