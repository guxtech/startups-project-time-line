import type { Epic } from '../types/project';

export function calculateProjectProgress(epics: Epic[]): number {
  if (epics.length === 0) return 0;

  const completedCount = epics.filter(
    epic => epic.status === 'Completada' || epic.status === 'En Progreso'
  ).length;

  const progress = Math.round((completedCount / epics.length) * 100);
  return Math.min(100, Math.max(0, progress));
}