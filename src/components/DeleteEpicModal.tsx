import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteEpicModalProps {
  epicName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteEpicModal({ epicName, isOpen, onClose, onConfirm }: DeleteEpicModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Eliminar Épica</h2>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Estás seguro que deseas eliminar la épica <span className="font-semibold">"{epicName}"</span>?
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              ⚠️ Esta acción eliminará permanentemente toda la información de la épica y no se puede deshacer.
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
              className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Eliminar Épica
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}