import { useState, useEffect } from "react";
import { epicService } from "../services/epicService";
import type { Database } from "../types/database.types";

type Epic = Database["public"]["Tables"]["epics"]["Row"];

export function useEpics(projectId: string) {
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEpics = async () => {
      try {
        const data = await epicService.getProjectEpics(projectId);
        setEpics(data);
        setError(null);
      } catch (err) {
        setError("Error al cargar las épicas");
        console.error("Error loading epics:", err);
      } finally {
        setLoading(false);
      }
    };

    loadEpics();
  }, [projectId]);

  const createEpic = async (epicData: Omit<Epic, "id" | "created_at">) => {
    try {
      const newEpic = await epicService.createEpic(epicData);
      setEpics((prev) => [...prev, newEpic]);
      return newEpic;
    } catch (err) {
      setError("Error al crear la épica");
      throw err;
    }
  };

  const updateEpic = async (id: string, updates: Partial<Epic>) => {
    try {
      const updatedEpic = await epicService.updateEpic(id, updates);
      setEpics((prev) => prev.map((e) => (e.id === id ? updatedEpic : e)));
      return updatedEpic;
    } catch (err) {
      setError("Error al actualizar la épica");
      throw err;
    }
  };

  const deleteEpic = async (id: string) => {
    try {
      await epicService.deleteEpic(id);
      setEpics((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      setError("Error al eliminar la épica");
      throw err;
    }
  };

  const updateEpicsOrder = async (reorderedEpics: Epic[]) => {
    try {
      await epicService.updateEpicOrder(reorderedEpics);
      setEpics(reorderedEpics);
    } catch (err) {
      setError("Error al reordenar las épicas");
      throw err;
    }
  };

  return {
    epics,
    loading,
    error,
    createEpic,
    updateEpic,
    deleteEpic,
    updateEpicsOrder,
  };
}
