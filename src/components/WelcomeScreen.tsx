import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LayoutDashboard, Trash2, Upload } from 'lucide-react';
import { format, addWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { loadProjects, saveProjects } from '../utils/storage';
import type { Project } from '../types/project';
import { DeleteProjectModal } from './DeleteProjectModal';
import { ImportProjectModal } from './ImportProjectModal';

export function WelcomeScreen() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState(loadProjects().projects);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedProject, setImportedProject] = useState<Project | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateProject = () => {
    const startDate = new Date();
    const newProject: Project = {
      id: crypto.randomUUID(),
      projectName: "Nuevo Proyecto",
      totalEstimatedHours: 0,
      totalConsumedHours: 0,
      currentPhase: "Planificación",
      totalTasks: 0,
      progressStatus: 0,
      startMonth: format(startDate, 'MMMM yyyy', { locale: es }),
      monthsToDisplay: 6,
      currentDate: startDate.toISOString(),
      tags: [],
      epics: [{
        name: "Planificación",
        startDate: format(startDate, "d 'de' MMMM yyyy", { locale: es }),
        endDate: format(addWeeks(startDate, 4), "d 'de' MMMM yyyy", { locale: es }),
        status: "No Iniciada",
        tagIds: []
      }]
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    saveProjects({ selectedProjectId: newProject.id, projects: updatedProjects });
    navigate(`/project/${newProject.id}`);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Validate required fields
        if (!importedData.id || !importedData.projectName || !Array.isArray(importedData.epics)) {
          throw new Error('Formato de archivo de proyecto inválido');
        }

        // Create a new project object with all required fields
        const validatedProject: Project = {
          ...importedData,
          tags: Array.isArray(importedData.tags) ? importedData.tags : [],
          epics: importedData.epics.map((epic: any) => ({
            name: epic.name,
            startDate: epic.startDate,
            endDate: epic.endDate,
            status: epic.status,
            tagIds: Array.isArray(epic.tagIds) ? epic.tagIds : []
          }))
        };

        // Check if a project with the same ID or name exists
        const existingProject = projects.find(
          p => p.id === validatedProject.id || p.projectName === validatedProject.projectName
        );

        setImportedProject(validatedProject);
        setShowImportModal(true);
      } catch (error) {
        console.error('Error parsing project file:', error);
        alert('Error al leer el archivo. Asegúrate de que sea un archivo de proyecto válido.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handleImportAsNew = () => {
    if (!importedProject) return;

    const newProject = {
      ...importedProject,
      id: crypto.randomUUID(), // Generate new ID
      projectName: `${importedProject.projectName} (Importado)`
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    saveProjects({ selectedProjectId: newProject.id, projects: updatedProjects });
    setShowImportModal(false);
    navigate(`/project/${newProject.id}`);
  };

  const handleImportReplace = () => {
    if (!importedProject) return;

    const updatedProjects = projects.map(p => 
      (p.id === importedProject.id || p.projectName === importedProject.projectName)
        ? importedProject
        : p
    );

    setProjects(updatedProjects);
    saveProjects({ selectedProjectId: importedProject.id, projects: updatedProjects });
    setShowImportModal(false);
    navigate(`/project/${importedProject.id}`);
  };

  const handleDeleteProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(project);
  };

  const confirmDelete = () => {
    if (!projectToDelete) return;

    const updatedProjects = projects.filter(p => p.id !== projectToDelete.id);
    setProjects(updatedProjects);
    saveProjects({ selectedProjectId: null, projects: updatedProjects });
    setProjectToDelete(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Planificador de Proyectos
          </h1>
          <p className="text-lg text-slate-600">
            Gestiona tus proyectos de manera eficiente con nuestra herramienta de planificación
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-all">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-blue-50 rounded-full">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Nuevo Proyecto</h2>
              <p className="text-slate-600">
                Comienza un nuevo proyecto desde cero
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateProject}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Crear Proyecto
                </button>
                <button
                  onClick={handleImportClick}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                >
                  Importar Proyecto
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImportProject}
                  accept=".json"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-emerald-50 rounded-full">
                <LayoutDashboard className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-800">Proyectos Existentes</h2>
              {projects.length > 0 ? (
                <div className="w-full space-y-3">
                  {projects.map(project => (
                    <div
                      key={project.id}
                      className="group flex items-center gap-3 w-full"
                    >
                      <button
                        onClick={() => navigate(`/project/${project.id}`)}
                        className="flex-1 px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-left transition-colors"
                      >
                        <span className="font-medium text-slate-700">{project.projectName}</span>
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(project, e)}
                        className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar proyecto"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-600">
                  No hay proyectos existentes
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <DeleteProjectModal
        projectName={projectToDelete?.projectName || ''}
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={confirmDelete}
      />

      <ImportProjectModal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportedProject(null);
        }}
        onImportAsNew={handleImportAsNew}
        onImportReplace={handleImportReplace}
        projectName={importedProject?.projectName || ''}
        hasExistingProject={!!projects.find(
          p => importedProject && (p.id === importedProject.id || p.projectName === importedProject.projectName)
        )}
      />
    </div>
  );
}