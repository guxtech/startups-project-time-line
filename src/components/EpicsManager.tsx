import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import type { Epic, Project } from '../types/project';
import { DeleteEpicModal } from './DeleteEpicModal';
import { EpicEditor } from './EpicEditor';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EpicsManagerProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onEpicStatusChange: (epicName: string, newStatus: Epic['status']) => void;
  onEpicUpdate: (epicName: string, updates: Partial<Epic>) => void;
  onAddEpic: (epic: Epic) => void;
  onDeleteEpic: (epicName: string) => void;
}

export function EpicsManager({
  project,
  isOpen,
  onClose,
  onEpicStatusChange,
  onEpicUpdate,
  onAddEpic,
  onDeleteEpic,
}: EpicsManagerProps) {
  const [epicToDelete, setEpicToDelete] = useState<Epic | null>(null);
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [isAddingEpic, setIsAddingEpic] = useState(false);

  if (!isOpen) return null;

  const handleAddClick = () => {
    const newEpic: Epic = {
      name: `Nueva Épica ${project.epics.length + 1}`,
      startDate: format(new Date(), "d 'de' MMMM yyyy", { locale: es }),
      endDate: format(new Date(), "d 'de' MMMM yyyy", { locale: es }),
      status: 'No Iniciada',
      tagIds: []
    };
    setEditingEpic(newEpic);
    setIsAddingEpic(true);
  };

  const handleEditClick = (epic: Epic) => {
    setEditingEpic(epic);
    setIsAddingEpic(false);
  };

  const handleEpicUpdate = (epicName: string, updates: Partial<Epic>) => {
    if (isAddingEpic) {
      onAddEpic({ ...editingEpic!, ...updates });
    } else {
      onEpicUpdate(epicName, updates);
    }
    setEditingEpic(null);
    setIsAddingEpic(false);
  };

  const handleDeleteClick = (epic: Epic) => {
    setEpicToDelete(epic);
  };

  const confirmDelete = () => {
    if (epicToDelete) {
      onDeleteEpic(epicToDelete.name);
    }
    setEpicToDelete(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Épicas</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Épica
          </button>
        </div>

        <div className="space-y-4">
          {project.epics.map((epic) => (
            <div
              key={epic.name}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    epic.status === 'Completada' ? 'bg-green-500' :
                    epic.status === 'En Progreso' ? 'bg-blue-500' :
                    epic.status === 'Atrasada' ? 'bg-red-500' :
                    'bg-gray-300'
                  }`} />
                  <h3 className="font-medium text-gray-900">{epic.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={epic.status}
                    onChange={(e) => onEpicStatusChange(epic.name, e.target.value as Epic['status'])}
                    className="text-sm border border-gray-300 rounded-md px-2 py-1"
                  >
                    <option value="No Iniciada">No Iniciada</option>
                    <option value="En Progreso">En Progreso</option>
                    <option value="Completada">Completada</option>
                    <option value="Atrasada">Atrasada</option>
                  </select>
                  <button
                    onClick={() => handleEditClick(epic)}
                    className="p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(epic)}
                    className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                <p>Inicio: {epic.startDate}</p>
                <p>Fin: {epic.endDate}</p>
              </div>
            </div>
          ))}
        </div>

        {editingEpic && (
          <EpicEditor
            epic={editingEpic}
            project={project}
            isOpen={true}
            onClose={() => {
              setEditingEpic(null);
              setIsAddingEpic(false);
            }}
            onUpdate={handleEpicUpdate}
            isNewEpic={isAddingEpic}
          />
        )}

        <DeleteEpicModal
          epicName={epicToDelete?.name || ''}
          isOpen={!!epicToDelete}
          onClose={() => setEpicToDelete(null)}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}