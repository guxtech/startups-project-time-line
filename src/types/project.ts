export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Epic {
  name: string;
  startDate: string;
  endDate: string;
  status: 'No Iniciada' | 'En Progreso' | 'Completada' | 'Atrasada';
  tagIds: string[];
  order?: number; // Add order field for explicit ordering
}

export interface Project {
  id: string;
  projectName: string;
  totalEstimatedHours: number;
  totalConsumedHours: number;
  currentPhase: string;
  totalTasks: number;
  progressStatus: number;
  startMonth: string;
  monthsToDisplay: number;
  currentDate: string;
  epics: Epic[];
  tags: Tag[];
}

export interface ProjectList {
  selectedProjectId: string | null;
  projects: Project[];
}