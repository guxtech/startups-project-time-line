import type { Project, ProjectList } from '../types/project';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const STORAGE_KEY = 'projectPlanner';

const initialProject: Project = {
  id: 'default',
  projectName: "Plataforma SaaS",
  totalEstimatedHours: 1200,
  totalConsumedHours: 600,
  currentPhase: "Desarrollo Módulo A",
  totalTasks: 80,
  progressStatus: 50,
  startMonth: format(new Date(), 'MMMM yyyy', { locale: es }),
  monthsToDisplay: 6,
  currentDate: new Date().toISOString(),
  epics: [
    {
      name: "Planificación",
      startDate: format(new Date(), "d 'de' MMMM yyyy", { locale: es }),
      endDate: format(new Date(), "d 'de' MMMM yyyy", { locale: es }),
      status: "Completada",
      tagIds: []
    }
  ],
  tags: []
};

const initialState: ProjectList = {
  selectedProjectId: null,
  projects: []
};

export const loadProjects = (): ProjectList => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      saveProjects(initialState);
      return initialState;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading projects:', error);
    return initialState;
  }
};

export const saveProjects = (state: ProjectList): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving projects:', error);
  }
};