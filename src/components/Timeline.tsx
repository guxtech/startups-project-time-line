import React from 'react';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { Project, Epic } from '../types/project';
import { calculatePosition, calculateCurrentDatePosition, parseProjectDate } from '../utils/dateUtils';
import { TagBadge } from './TagBadge';
import { GripVertical } from 'lucide-react';

interface TimelineProps {
  project: Project;
  onReorderEpics: (epics: Epic[]) => void;
  onEditEpic: (epic: Epic) => void;
  onEpicStatusChange: (epicName: string, newStatus: Epic['status']) => void;
}

export function Timeline({ project, onReorderEpics, onEditEpic, onEpicStatusChange }: TimelineProps) {
  const getStatusColor = (status: Epic['status']) => {
    switch (status) {
      case 'Completada':
        return 'bg-green-500';
      case 'En Progreso':
        return 'bg-blue-500';
      case 'Atrasada':
        return 'bg-red-500';
      default:
        return 'bg-slate-300';
    }
  };

  const getNextStatus = (currentStatus: Epic['status']): Epic['status'] => {
    const statusOrder: Epic['status'][] = ['No Iniciada', 'En Progreso', 'Completada', 'Atrasada'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    return statusOrder[(currentIndex + 1) % statusOrder.length];
  };

  const formatShortDate = (dateStr: string) => {
    const date = parseProjectDate(dateStr);
    return format(date, 'dd/MM/yyyy');
  };

  const months = Array.from(
    { length: project.monthsToDisplay },
    (_, i) => {
      const date = parse(project.startMonth, 'MMMM yyyy', new Date(), { locale: es });
      date.setMonth(date.getMonth() + i);
      return {
        key: format(date, 'yyyy-MM'),
        label: format(date, 'MMMM yyyy', { locale: es })
      };
    }
  );

  const currentDatePosition = calculateCurrentDatePosition(
    new Date(),
    project.startMonth,
    project.monthsToDisplay
  );

  const legendItems = [
    { status: 'Completada', color: 'bg-green-500' },
    { status: 'En Progreso', color: 'bg-blue-500' },
    { status: 'Atrasada', color: 'bg-red-500' },
    { status: 'No Iniciada', color: 'bg-slate-300' },
  ];

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(project.epics);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const reorderedEpics = items.map((epic, index) => ({
      ...epic,
      order: index
    }));

    onReorderEpics(reorderedEpics);
  };

  return (
    <div id="project-timeline" className="card p-6 overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="flex justify-end gap-4 mb-6">
          {legendItems.map(({ status, color }) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="text-sm text-slate-600">{status}</span>
            </div>
          ))}
        </div>

        <div className="timeline-grid gap-4">
          <div className="font-medium text-slate-600">Épicas</div>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${project.monthsToDisplay}, 1fr)` }}>
            {months.map(({ key, label }) => (
              <div key={key} className="text-sm font-medium text-slate-600 text-center">
                {label}
              </div>
            ))}
          </div>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="epics">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="mt-6 space-y-4 relative"
              >
                {project.epics.map((epic, index) => {
                  const startPosition = calculatePosition(epic.startDate, project.startMonth, project.monthsToDisplay);
                  const endPosition = calculatePosition(epic.endDate, project.startMonth, project.monthsToDisplay);
                  const width = Math.max(0, endPosition - startPosition);
                  const epicTags = (epic.tagIds || [])
                    .map(tagId => project.tags?.find(tag => tag.id === tagId))
                    .filter(tag => tag);

                  return (
                    <Draggable key={epic.name} draggableId={epic.name} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`timeline-grid gap-4 items-center group ${
                            snapshot.isDragging ? 'opacity-75' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 pr-4">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab hover:bg-slate-100 p-1 rounded"
                            >
                              <GripVertical className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-3">
                                <div 
                                  className={`w-2.5 h-2.5 rounded-full ${getStatusColor(epic.status)} cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-current transition-all`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onEpicStatusChange(epic.name, getNextStatus(epic.status));
                                  }}
                                  title="Clic para cambiar estado"
                                />
                                <span 
                                  className="text-sm font-medium text-slate-700 truncate cursor-pointer hover:text-blue-600 transition-colors" 
                                  title={epic.name}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onEditEpic(epic);
                                  }}
                                >
                                  {epic.name}
                                </span>
                              </div>
                              {epicTags.length > 0 && (
                                <div className="flex flex-wrap gap-1 ml-5">
                                  {epicTags.map(tag => tag && (
                                    <TagBadge key={tag.id} tag={tag} />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="relative h-8">
                            <div 
                              className={`absolute top-1/2 -translate-y-1/2 h-3 rounded-full transition-all duration-200 ${getStatusColor(epic.status)} group-hover:h-4 cursor-pointer hover:shadow-md`} 
                              style={{ 
                                left: `${startPosition}%`, 
                                width: `${width}%`,
                                opacity: epic.status === 'No Iniciada' ? 0.5 : 1 
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onEditEpic(epic);
                              }}
                            >
                              <div className="absolute invisible group-hover:visible bg-slate-900 text-white text-xs rounded px-2 py-1 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                {formatShortDate(epic.startDate)} - {formatShortDate(epic.endDate)}
                                <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-slate-900 transform -translate-x-1/2 rotate-45"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}

                {currentDatePosition >= 0 && (
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" 
                    style={{ 
                      left: `calc(200px + ((100% - 200px) * ${currentDatePosition / 100}))`,
                      transition: 'left 0.3s ease-in-out'
                    }} 
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium text-red-500 whitespace-nowrap">
                      Hoy
                    </div>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}