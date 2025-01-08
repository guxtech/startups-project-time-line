import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { projectService } from "../services/projectService";
import { epicService } from "../services/epicService";
import { tagService } from "../services/tagService";
import type { Project, DbProjectInsert } from "../types/project";
import { mapDbEpicToEpic, mapDbTagToTag } from "../utils/mappers";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
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

  const createProject = async (projectData: DbProjectInsert) => {
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
      // Separar los datos del proyecto de las relaciones
      const { epics, tags, ...projectUpdates } = updates;

      // Actualizar el proyecto primero
      const updatedProject = await projectService.updateProject(
        projectId,
        projectUpdates
      );

      // Si hay actualizaciones de épicas, actualizarlas
      if (epics) {
        // Obtener las épicas actuales del proyecto
        const currentEpics = await epicService.getProjectEpics(projectId);
        const currentEpicIds = new Set(currentEpics.map((epic) => epic.id));

        await Promise.all(
          epics.map(async (epic) => {
            const epicData = {
              name: epic.name,
              start_date: epic.startDate,
              end_date: epic.endDate,
              status: epic.status,
              tag_ids: epic.tagIds,
              order: epic.order,
              project_id: projectId,
            };

            try {
              // Solo actualizar si la épica ya existe en la base de datos
              if (currentEpicIds.has(epic.id)) {
                await epicService.updateEpic(epic.id, epicData);
              } else {
                // Si es una nueva épica (no existe en la base de datos), crearla
                await epicService.createEpic(epicData);
              }
            } catch (error) {
              console.error(`Error updating/creating epic:`, error);
              throw error;
            }
          })
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
