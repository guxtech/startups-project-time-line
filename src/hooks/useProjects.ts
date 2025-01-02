import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { projectService } from "../services/projectService";
import type { Database } from "../types/database.types";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const loadProjects = async () => {
      try {
        const data = await projectService.getProjects();
        setProjects(data);
        setError(null);
      } catch (err) {
        setError("Error al cargar los proyectos");
        console.error("Error loading projects:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [user]);

  const createProject = async (
    projectData: Omit<Project, "id" | "created_at">
  ) => {
    try {
      const newProject = await projectService.createProject(projectData);
      setProjects((prev) => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      setError("Error al crear el proyecto");
      throw err;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const updatedProject = await projectService.updateProject(id, updates);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? updatedProject : p))
      );
      return updatedProject;
    } catch (err) {
      setError("Error al actualizar el proyecto");
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectService.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError("Error al eliminar el proyecto");
      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
  };
}
