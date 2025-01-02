import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ImportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportAsNew: () => void;
  onImportReplace: () => void;
  projectName: string;
  hasExistingProject: boolean;
}

export function ImportProjectModal({
  isOpen,
  onClose,
  onImportAsNew,
  onImportReplace,
  projectName,
  hasExistingProject
}: ImportProjectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Importar Proyecto</h2>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            Proyecto a importar: <span className="font-semibold">"{projectName}"</span>
          </p>
          
          {hasExistingProject && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                ⚠️ Ya existe un proyecto con el mismo nombre o identificador.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={onImportAsNew}
              className="w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Importar como Nuevo Proyecto
            </button>
            
            {hasExistingProject && (
              <button
                onClick={onImportReplace}
                className="w-full px-4 py-2 text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
              >
                Reemplazar Proyecto Existente
              </button>
            )}

            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}