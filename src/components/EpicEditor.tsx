import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { format, parse, startOfMonth, endOfMonth, addMonths, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Epic, Project } from '../types/project';
import { TagPicker } from './TagPicker';
import { parseProjectDate, formatProjectDate } from '../utils/dateUtils';

interface EpicEditorProps {
  epic: Epic;
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updates: Partial<Epic>) => void;
  isNewEpic?: boolean;
}

export function EpicEditor({ epic, project, isOpen, onClose, onUpdate, isNewEpic = false }: EpicEditorProps) {
  const [name, setName] = useState(epic.name);
  const [startDate, setStartDate] = useState<Date>(parseProjectDate(epic.startDate));
  const [endDate, setEndDate] = useState<Date>(parseProjectDate(epic.endDate));
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(epic.tagIds || []);
  const [error, setError] = useState<string>('');

  // Calculate min and max dates based on project timeline
  const minDate = startOfMonth(parse(project.start_month, 'MMMM yyyy', new Date(), { locale: es }));
  const maxDate = endOfMonth(addMonths(minDate, project.months_to_display - 1));

  useEffect(() => {
    setName(epic.name);
    setStartDate(parseProjectDate(epic.startDate));
    setEndDate(parseProjectDate(epic.endDate));
    setSelectedTagIds(epic.tagIds || []);
    setError('');
  }, [epic]);

  const handleStartDateChange = (date: Date) => {
    if (isAfter(date, endDate)) {
      setError('La fecha de inicio no puede ser posterior a la fecha de término');
    } else if (isBefore(date, minDate) || isAfter(date, maxDate)) {
      setError('La fecha debe estar dentro del rango del timeline del proyecto');
    } else {
      setError('');
      setStartDate(date);
    }
  };

  const handleEndDateChange = (date: Date) => {
    if (isBefore(date, startDate)) {
      setError('La fecha de término no puede ser anterior a la fecha de inicio');
    } else if (isBefore(date, minDate) || isAfter(date, maxDate)) {
      setError('La fecha debe estar dentro del rango del timeline del proyecto');
    } else {
      setError('');
      setEndDate(date);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (error) return;

    if (isBefore(startDate, minDate) || isAfter(startDate, maxDate) ||
        isBefore(endDate, minDate) || isAfter(endDate, maxDate)) {
      setError('Las fechas deben estar dentro del rango del timeline del proyecto');
      return;
    }

    const updates: Partial<Epic> = {
      name,
      startDate: formatProjectDate(startDate),
      endDate: formatProjectDate(endDate),
      status: epic.status,
      tagIds: selectedTagIds,
      project_id: project.id
    };

    onUpdate(updates);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {isNewEpic ? 'Nueva Épica' : `Editar Épica: ${epic.name}`}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Épica
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio
            </label>
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              minDate={minDate}
              maxDate={maxDate}
              locale={es}
              dateFormat="d 'de' MMMM yyyy"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Término
            </label>
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              minDate={minDate}
              maxDate={maxDate}
              locale={es}
              dateFormat="d 'de' MMMM yyyy"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetas
            </label>
            <TagPicker
              tags={project.tags || []}
              selectedTagIds={selectedTagIds}
              onChange={setSelectedTagIds}
              className="mb-2"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!!error}
              className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                error ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isNewEpic ? 'Crear Épica' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}