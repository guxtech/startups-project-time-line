import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, PlayCircle, Edit2, Plus, Trash2 } from 'lucide-react';
import type { Epic, Project } from '../types/project';
import { EpicEditor } from './EpicEditor';
import { DeleteEpicModal } from './DeleteEpicModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SidebarProps {
  epics: Epic[];
  project: Project;
  onEpicStatusChange: (epicName: string, newStatus: Epic['status']) => void;
  onEpicUpdate: (epicName: string, updates: Partial<Epic>) => void;
  onAddEpic: (epic: Epic) => void;
  onDeleteEpic?: (epicName: string) => void;
  editingEpic: Epic | null;
  onEditComplete: () => void;
}

export function Sidebar({ 
  epics, 
  project, 
  onEpicStatusChange, 
  onEpicUpdate, 
  onAddEpic, 
  onDeleteEpic,
  editingEpic,
  onEditComplete
}: SidebarProps) {
  const [isAddingEpic, setIsAddingEpic] = useState(false);
  const [epicToDelete, setEpicToDelete] = useState<Epic | null>(null);

  const getStatusIcon = (status: Epic['status']) => {
    switch (status) {
      case 'Completada':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'En Progreso':
        return <PlayCircle className="w-5 h-5 text-blue-500" />;
      case 'Atrasada':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleAddEpic = () => {
    const newEpic: Epic = {
      name: `Nueva Épica ${epics.length + 1}`,
      startDate: format(new Date(), "d 'de' MMMM yyyy", { locale: es }),
      endDate: format(new Date(), "d 'de' MMMM yyyy", { locale: es }),
      status: 'No Iniciada',
      tagIds: []
    };
    setIsAddingEpic(true);
    onEditComplete();
    setTimeout(() => {
      onAddEpic(newEpic);
    }, 0);
  };

  const handleEpicUpdate = (epicName: string, updates: Partial<Epic>) => {
    onEpicUpdate(epicName, updates);
    setIsAddingEpic(false);
  };

  const handleDeleteClick = (epic: Epic, e: React.MouseEvent) => {
    e.stopPropagation();
    setEpicToDelete(epic);
  };

  const confirmDelete = () => {
    if (epicToDelete && onDeleteEpic) {
      onDeleteEpic(epicToDelete.name);
    }
    setEpicToDelete(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Estado de Épicas</h2>
        <button
          onClick={handleAddEpic}
          className="p-2 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
          title="Agregar épica"
        >
          <Plus className="w-5 h-5 text-blue-600" />
        </button>
      </div>
      
      <div className="space-y-4">
        {epics.map((epic) => (
          <div key={epic.name} className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                {getStatusIcon(epic.status)}
                <span className="font-medium text-gray-700">{epic.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEditComplete()}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  title="Editar épica"
                >
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={(e) => handleDeleteClick(epic, e)}
                  className="p-1 hover:bg-red-100 rounded-full transition-colors"
                  title="Eliminar épica"
                >
                  <Trash2 className="w-4 h-4 text-gray-600 hover:text-red-600" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-gray-500">
                <div>Inicio: {epic.startDate}</div>
                <div>Fin: {epic.endDate}</div>
              </div>
              <select
                value={epic.status}
                onChange={(e) => onEpicStatusChange(epic.name, e.target.value as Epic['status'])}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white"
              >
                <option value="No Iniciada">No Iniciada</option>
                <option value="En Progreso">En Progreso</option>
                <option value="Completada">Completada</option>
                <option value="Atrasada">Atrasada</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {editingEpic && (
        <EpicEditor
          epic={editingEpic}
          project={project}
          isOpen={true}
          onClose={onEditComplete}
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
  );
}