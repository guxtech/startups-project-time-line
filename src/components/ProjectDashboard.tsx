import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectSummary } from './ProjectSummary';
import { Timeline } from './Timeline';
import { Home } from 'lucide-react';
import type { Project, ProjectList, Epic } from '../types/project';
import { loadProjects, saveProjects } from '../utils/storage';
import { EpicsManager } from './EpicsManager';
import { EpicEditor } from './EpicEditor';
import { ProjectSettings } from './ProjectSettings';

export function ProjectDashboard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [projectList, setProjectList] = useState<ProjectList>(loadProjects());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEpicsManagerOpen, setIsEpicsManagerOpen] = useState(false);
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [isEpicEditorOpen, setIsEpicEditorOpen] = useState(false);

  const currentProject = projectList.projects.find(p => p.id === projectId);

  useEffect(() => {
    if (!currentProject) {
      navigate('/');
      return;
    }
  }, [currentProject, navigate]);

  useEffect(() => {
    if (projectList) {
      saveProjects(projectList);
    }
  }, [projectList]);

  if (!currentProject) {
    return null;
  }

  const handleProjectUpdate = (updatedProject: Project) => {
    const newProjectList = {
      ...projectList,
      projects: projectList.projects.map(p => 
        p.id === updatedProject.id ? {
          ...updatedProject,
          tags: updatedProject.tags || [],
          epics: updatedProject.epics.map(epic => ({
            ...epic,
            tagIds: epic.tagIds || []
          }))
        } : p
      )
    };
    
    setProjectList(newProjectList);
    saveProjects(newProjectList);
  };

  const handleEpicStatusChange = (epicName: string, newStatus: Epic['status']) => {
    const updatedProject = {
      ...currentProject,
      epics: currentProject.epics.map(epic =>
        epic.name === epicName ? { ...epic, status: newStatus } : epic
      )
    };
    handleProjectUpdate(updatedProject);
  };

  const handleEpicUpdate = (epicName: string, updates: Partial<Epic>) => {
    const updatedProject = {
      ...currentProject,
      epics: currentProject.epics.map(epic =>
        epic.name === epicName ? { ...epic, ...updates } : epic
      ),
      currentPhase: currentProject.currentPhase === epicName ? updates.name || epicName : currentProject.currentPhase
    };
    handleProjectUpdate(updatedProject);
    setIsEpicEditorOpen(false);
    setEditingEpic(null);
  };

  const handleAddEpic = (newEpic: Epic) => {
    const updatedProject = {
      ...currentProject,
      epics: [...currentProject.epics, { ...newEpic, order: currentProject.epics.length }]
    };
    handleProjectUpdate(updatedProject);
  };

  const handleDeleteEpic = (epicName: string) => {
    const updatedProject = {
      ...currentProject,
      epics: currentProject.epics.filter(epic => epic.name !== epicName),
      currentPhase: currentProject.currentPhase === epicName ? 
        (currentProject.epics[0]?.name || "Sin fase") : 
        currentProject.currentPhase
    };
    handleProjectUpdate(updatedProject);
  };

  const handleReorderEpics = (reorderedEpics: Epic[]) => {
    const updatedProject = {
      ...currentProject,
      epics: reorderedEpics
    };
    handleProjectUpdate(updatedProject);
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
          onUpdate={handleProjectUpdate}
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
            onUpdate={handleEpicUpdate}
            isNewEpic={false}
          />
        )}
      </div>
    </div>
  );
}