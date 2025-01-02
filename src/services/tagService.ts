import { supabase } from "../config/supabase";
import type { Database } from "../types/database.types";

type Tag = Database["public"]["Tables"]["tags"]["Row"];
type TagInsert = Database["public"]["Tables"]["tags"]["Insert"];
type TagUpdate = Database["public"]["Tables"]["tags"]["Update"];

export const tagService = {
  async getProjectTags(projectId: string) {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data as Tag[];
  },

  async createTag(tag: TagInsert) {
    const { data, error } = await supabase
      .from("tags")
      .insert(tag)
      .select()
      .single();

    if (error) throw error;
    return data as Tag;
  },

  async updateTag(id: string, updates: TagUpdate) {
    const { data, error } = await supabase
      .from("tags")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Tag;
  },

  async deleteTag(id: string) {
    const { error } = await supabase.from("tags").delete().eq("id", id);

    if (error) throw error;
  },
};
