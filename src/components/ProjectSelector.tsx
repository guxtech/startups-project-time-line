import React from 'react';
import { Plus } from 'lucide-react';
import type { Project } from '../types/project';

interface ProjectSelectorProps {
  projects: Project[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
}

export function ProjectSelector({ 
  projects, 
  selectedProjectId, 
  onSelectProject,
  onCreateProject 
}: ProjectSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <select
        value={selectedProjectId || ''}
        onChange={(e) => onSelectProject(e.target.value)}
        className="select flex-1 min-w-[200px] max-w-md"
      >
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.projectName}
          </option>
        ))}
      </select>
      
      <button
        onClick={onCreateProject}
        className="btn btn-primary inline-flex items-center gap-2 whitespace-nowrap"
      >
        <Plus className="w-5 h-5" />
        Nuevo Proyecto
      </button>
    </div>
  );
}