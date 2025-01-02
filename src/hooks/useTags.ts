import { useState, useEffect } from "react";
import { tagService } from "../services/tagService";
import type { Database } from "../types/database.types";

type Tag = Database["public"]["Tables"]["tags"]["Row"];

export function useTags(projectId: string) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const data = await tagService.getProjectTags(projectId);
        setTags(data);
        setError(null);
      } catch (err) {
        setError("Error al cargar las etiquetas");
        console.error("Error loading tags:", err);
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, [projectId]);

  const createTag = async (tagData: Omit<Tag, "id" | "created_at">) => {
    try {
      const newTag = await tagService.createTag(tagData);
      setTags((prev) => [...prev, newTag]);
      return newTag;
    } catch (err) {
      setError("Error al crear la etiqueta");
      throw err;
    }
  };

  const updateTag = async (id: string, updates: Partial<Tag>) => {
    try {
      const updatedTag = await tagService.updateTag(id, updates);
      setTags((prev) => prev.map((t) => (t.id === id ? updatedTag : t)));
      return updatedTag;
    } catch (err) {
      setError("Error al actualizar la etiqueta");
      throw err;
    }
  };

  const deleteTag = async (id: string) => {
    try {
      await tagService.deleteTag(id);
      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError("Error al eliminar la etiqueta");
      throw err;
    }
  };

  return {
    tags,
    loading,
    error,
    createTag,
    updateTag,
    deleteTag,
  };
}
