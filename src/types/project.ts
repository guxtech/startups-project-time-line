import type { Database } from "./database.types";

export type DbProject = Database["public"]["Tables"]["projects"]["Row"];
export type DbProjectInsert =
  Database["public"]["Tables"]["projects"]["Insert"];
export type DbEpic = Database["public"]["Tables"]["epics"]["Row"];
export type DbTag = Database["public"]["Tables"]["tags"]["Row"];

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Epic {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "No Iniciada" | "En Progreso" | "Completada" | "Atrasada";
  tagIds: string[];
  order: number;
}

export interface Project extends DbProject {
  epics: Epic[];
  tags: Tag[];
}

export type ProjectWithRelations = Project;

export interface ProjectList {
  selectedProjectId: string | null;
  projects: Project[];
}

export interface ImportedTag {
  id: string;
  name: string;
  color: string;
}

export interface ImportedEpic {
  name: string;
  startDate: string;
  endDate: string;
  status: "No Iniciada" | "En Progreso" | "Completada" | "Atrasada";
  tagIds: string[];
}

export interface ImportedProject {
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
  epics: ImportedEpic[];
  tags: ImportedTag[];
}
