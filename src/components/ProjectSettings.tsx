import React, { useState, useRef } from 'react';
import { Settings, Download, Upload, AlertTriangle } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Project, Tag } from '../types/project';
import { TagManager } from './TagManager';
import "react-datepicker/dist/react-datepicker.css";

interface ImportWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
}

function ImportWarningModal({ isOpen, onClose, onConfirm, projectName }: ImportWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-amber-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Reemplazar Proyecto</h2>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro que deseas reemplazar el proyecto actual con <span className="font-semibold">"{projectName}"</span>?
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              ⚠️ Esta acción reemplazará toda la información del proyecto actual y no se puede deshacer.
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
            >
              Reemplazar Proyecto
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProjectSettingsProps {
  project: Project;
  onUpdate: (updatedProject: Project) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectSettings({ project, onUpdate, isOpen, onClose }: ProjectSettingsProps) {
  const [selectedStartMonth, setSelectedStartMonth] = useState(
    parse(project.startMonth, 'MMMM yyyy', new Date(), { locale: es })
  );
  const [showImportWarning, setShowImportWarning] = useState(false);
  const [importedProject, setImportedProject] = useState<Project | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportProject = () => {
    try {
      // Create a deep copy of the project to avoid reference issues
      const projectToExport = JSON.parse(JSON.stringify({
        ...project,
        tags: project.tags || [],
        epics: project.epics.map(epic => ({
          ...epic,
          tagIds: epic.tagIds || []
        }))
      }));

      const dataStr = JSON.stringify(projectToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.projectName.toLowerCase().replace(/\s+/g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting project:', error);
      alert('Error al exportar el proyecto. Por favor, intenta nuevamente.');
    }
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
          id: importedData.id,
          projectName: importedData.projectName,
          totalEstimatedHours: importedData.totalEstimatedHours || 0,
          totalConsumedHours: importedData.totalConsumedHours || 0,
          currentPhase: importedData.currentPhase || '',
          totalTasks: importedData.totalTasks || 0,
          progressStatus: importedData.progressStatus || 0,
          startMonth: importedData.startMonth || format(new Date(), 'MMMM yyyy', { locale: es }),
          monthsToDisplay: importedData.monthsToDisplay || 6,
          currentDate: importedData.currentDate || new Date().toISOString(),
          tags: Array.isArray(importedData.tags) ? importedData.tags : [],
          epics: importedData.epics.map((epic: any) => ({
            name: epic.name,
            startDate: epic.startDate,
            endDate: epic.endDate,
            status: epic.status,
            tagIds: Array.isArray(epic.tagIds) ? epic.tagIds : []
          }))
        };

        setImportedProject(validatedProject);
        setShowImportWarning(true);
      } catch (error) {
        console.error('Error parsing project file:', error);
        alert('Error al leer el archivo. Asegúrate de que sea un archivo de proyecto válido.');
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const handleConfirmImport = () => {
    if (importedProject) {
      // Update the project with the imported data
      onUpdate(importedProject);
      setShowImportWarning(false);
      setImportedProject(null);
      onClose();
    }
  };

  const handleAddTag = (newTag: Tag) => {
    const updatedProject = {
      ...project,
      tags: [...(project.tags || []), newTag]
    };
    onUpdate(updatedProject);
  };

  const handleDeleteTag = (tagId: string) => {
    const updatedProject = {
      ...project,
      tags: project.tags.filter(tag => tag.id !== tagId),
      epics: project.epics.map(epic => ({
        ...epic,
        tagIds: (epic.tagIds || []).filter(id => id !== tagId)
      }))
    };
    onUpdate(updatedProject);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updatedProject: Project = {
      ...project,
      projectName: formData.get('projectName') as string,
      totalEstimatedHours: Number(formData.get('totalEstimatedHours')),
      totalConsumedHours: Number(formData.get('totalConsumedHours')),
      currentPhase: formData.get('currentPhase') as string,
      totalTasks: Number(formData.get('totalTasks')),
      progressStatus: Number(formData.get('progressStatus')),
      startMonth: format(selectedStartMonth, 'MMMM yyyy', { locale: es }),
      monthsToDisplay: Number(formData.get('monthsToDisplay')),
    };

    onUpdate(updatedProject);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Configuración del Proyecto</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <span className="sr-only">Cerrar</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={handleExportProject}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <Download className="w-5 h-5" />
            Exportar Proyecto
          </button>
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Upload className="w-5 h-5" />
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

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  id="projectName"
                  name="projectName"
                  defaultValue={project.projectName}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="currentPhase" className="block text-sm font-medium text-gray-700">
                  Fase Actual
                </label>
                <select
                  id="currentPhase"
                  name="currentPhase"
                  defaultValue={project.currentPhase}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {project.epics.map((epic) => (
                    <option key={epic.name} value={epic.name}>
                      {epic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="totalEstimatedHours" className="block text-sm font-medium text-gray-700">
                  Horas Estimadas
                </label>
                <input
                  type="number"
                  id="totalEstimatedHours"
                  name="totalEstimatedHours"
                  defaultValue={project.totalEstimatedHours}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="totalConsumedHours" className="block text-sm font-medium text-gray-700">
                  Horas Consumidas
                </label>
                <input
                  type="number"
                  id="totalConsumedHours"
                  name="totalConsumedHours"
                  defaultValue={project.totalConsumedHours}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="totalTasks" className="block text-sm font-medium text-gray-700">
                  Tareas Totales
                </label>
                <input
                  type="number"
                  id="totalTasks"
                  name="totalTasks"
                  defaultValue={project.totalTasks}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="progressStatus" className="block text-sm font-medium text-gray-700">
                  Progreso (%)
                </label>
                <input
                  type="number"
                  id="progressStatus"
                  name="progressStatus"
                  defaultValue={project.progressStatus}
                  min="0"
                  max="100"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="startMonth" className="block text-sm font-medium text-gray-700 mb-1">
                  Mes de Inicio
                </label>
                <DatePicker
                  selected={selectedStartMonth}
                  onChange={(date: Date) => setSelectedStartMonth(date)}
                  dateFormat="MMMM yyyy"
                  showMonthYearPicker
                  locale={es}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="monthsToDisplay" className="block text-sm font-medium text-gray-700">
                  Meses a Mostrar
                </label>
                <input
                  type="number"
                  id="monthsToDisplay"
                  name="monthsToDisplay"
                  defaultValue={project.monthsToDisplay}
                  min="1"
                  max="24"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <TagManager
                tags={project.tags || []}
                onAddTag={handleAddTag}
                onDeleteTag={handleDeleteTag}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
            >
              Guardar Cambios
            </button>
          </div>
        </form>

        <ImportWarningModal
          isOpen={showImportWarning}
          onClose={() => {
            setShowImportWarning(false);
            setImportedProject(null);
          }}
          onConfirm={handleConfirmImport}
          projectName={importedProject?.projectName || ''}
        />
      </div>
    </div>
  );
}