import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { projectService } from "../services/projectService";
import { epicService } from "../services/epicService";
import { tagService } from "../services/tagService";
import type { Project, ProjectWithRelations } from "../types/project";
import { mapDbEpicToEpic, mapDbTagToTag } from "../utils/mappers";

export function useProjects() {
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const loadProjects = async () => {
      try {
        const projectsData = await projectService.getProjects();
        const projectsWithRelations = await Promise.all(
          projectsData.map(async (project) => {
            const [dbEpics, dbTags] = await Promise.all([
              epicService.getProjectEpics(project.id),
              tagService.getProjectTags(project.id),
            ]);

            return {
              ...project,
              epics: dbEpics.map(mapDbEpicToEpic),
              tags: dbTags.map(mapDbTagToTag),
            };
          })
        );
        setProjects(projectsWithRelations);
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
      setProjects((prev) => [
        {
          ...newProject,
          epics: [],
          tags: [],
        },
        ...prev,
      ]);
      return newProject;
    } catch (err) {
      setError("Error al crear el proyecto");
      throw err;
    }
  };

  const updateProject = async (
    projectId: string,
    updates: Partial<Project>
  ) => {
    try {
      const updatedProject = await projectService.updateProject(
        projectId,
        updates
      );

      // Si hay actualizaciones de epics, actualizarlos también
      if (updates.epics) {
        await Promise.all(
          updates.epics.map((epic) =>
            epicService.updateEpic(epic.id, {
              name: epic.name,
              start_date: epic.startDate,
              end_date: epic.endDate,
              status: epic.status,
              tag_ids: epic.tagIds,
              order: epic.order,
              project_id: projectId,
            })
          )
        );
      }

      // Recargar el proyecto con sus relaciones actualizadas
      const [dbEpics, dbTags] = await Promise.all([
        epicService.getProjectEpics(projectId),
        tagService.getProjectTags(projectId),
      ]);

      const projectWithRelations = {
        ...updatedProject,
        epics: dbEpics.map(mapDbEpicToEpic),
        tags: dbTags.map(mapDbTagToTag),
      };

      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? projectWithRelations : p))
      );

      return projectWithRelations;
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
