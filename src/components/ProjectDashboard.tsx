import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectSummary } from './ProjectSummary';
import { Timeline } from './Timeline';
import { Home } from 'lucide-react';
import type { Epic, Project } from '../types/project';
import { EpicsManager } from './EpicsManager';
import { EpicEditor } from './EpicEditor';
import { ProjectSettings } from './ProjectSettings';
import { useProjects } from '../hooks/useProjects';

export function ProjectDashboard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, loading, updateProject } = useProjects();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEpicsManagerOpen, setIsEpicsManagerOpen] = useState(false);
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [isEpicEditorOpen, setIsEpicEditorOpen] = useState(false);

  const currentProject = projects.find(p => p.id === projectId);

  useEffect(() => {
    if (!loading && !currentProject) {
      navigate('/');
      return;
    }
  }, [currentProject, navigate, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentProject) {
    return null;
  }

  const handleEpicStatusChange = (epicId: string, newStatus: Epic['status']) => {
    const updatedProject = {
      ...currentProject,
      epics: currentProject.epics.map(epic =>
        epic.id === epicId ? { ...epic, status: newStatus } : epic
      )
    };
    updateProject(currentProject.id, updatedProject);
  };

  const handleEpicUpdate = (epicId: string, updates: Partial<Epic>) => {
    const updatedProject = {
      ...currentProject,
      epics: currentProject.epics.map(epic =>
        epic.id === epicId ? { ...epic, ...updates } : epic
      )
    };
    updateProject(currentProject.id, updatedProject);
    setIsEpicEditorOpen(false);
    setEditingEpic(null);
  };

  const handleAddEpic = (newEpic: Epic) => {
    const updatedProject = {
      ...currentProject,
      epics: [...currentProject.epics, { ...newEpic, order: currentProject.epics.length }]
    };
    updateProject(currentProject.id, updatedProject);
  };

  const handleDeleteEpic = (epicId: string) => {
    const updatedProject = {
      ...currentProject,
      epics: currentProject.epics.filter(epic => epic.id !== epicId)
    };
    updateProject(currentProject.id, updatedProject);
  };

  const handleReorderEpics = (reorderedEpics: Epic[]) => {
    const updatedProject = {
      ...currentProject,
      epics: reorderedEpics
    };
    updateProject(currentProject.id, updatedProject);
  };

  const handleTimelineEpicClick = (epic: Epic) => {
    setEditingEpic(epic);
    setIsEpicEditorOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 bg-white rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Volver al Inicio</span>
          </button>
        </div>

        <ProjectSummary 
          project={currentProject}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenEpics={() => setIsEpicsManagerOpen(true)}
        />
        
        <div className="grid grid-cols-1 gap-6">
          <Timeline 
            project={currentProject} 
            onReorderEpics={handleReorderEpics}
            onEditEpic={handleTimelineEpicClick}
            onEpicStatusChange={handleEpicStatusChange}
          />
        </div>

        <ProjectSettings
          project={currentProject}
          onUpdate={(updates: Partial<Project>) => updateProject(currentProject.id, updates)}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        <EpicsManager
          project={currentProject}
          isOpen={isEpicsManagerOpen}
          onClose={() => setIsEpicsManagerOpen(false)}
          onEpicStatusChange={handleEpicStatusChange}
          onEpicUpdate={handleEpicUpdate}
          onAddEpic={handleAddEpic}
          onDeleteEpic={handleDeleteEpic}
        />

        {editingEpic && (
          <EpicEditor
            epic={editingEpic}
            project={currentProject}
            isOpen={isEpicEditorOpen}
            onClose={() => {
              setIsEpicEditorOpen(false);
              setEditingEpic(null);
            }}
            onUpdate={(updates) => handleEpicUpdate(editingEpic.id, updates)}
            isNewEpic={false}
          />
        )}
      </div>
    </div>
  );
}