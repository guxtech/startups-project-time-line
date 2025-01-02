import type { Database } from "./database.types";

export type DbProject = Database["public"]["Tables"]["projects"]["Row"];
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

export interface ProjectWithRelations extends Omit<Project, "epics" | "tags"> {
  epics: Epic[];
  tags: Tag[];
}

export interface ProjectList {
  selectedProjectId: string | null;
  projects: Project[];
}
