import { supabase } from "../config/supabase";
import type { Database } from "../types/database.types";
import type { DbProjectInsert } from "../types/project";

type Project = Database["public"]["Tables"]["projects"]["Row"];

export const projectService = {
  async getProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Project[];
  },

  async getProject(id: string) {
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        *,
        epics (*),
        tags (*)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Project & {
      epics: Database["public"]["Tables"]["epics"]["Row"][];
      tags: Database["public"]["Tables"]["tags"]["Row"][];
    };
  },

  async createProject(project: DbProjectInsert) {
    const { data, error } = await supabase
      .from("projects")
      .insert(project)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  async updateProject(
    id: string,
    updates: Database["public"]["Tables"]["projects"]["Update"]
  ) {
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  async deleteProject(id: string) {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) throw error;
  },
};
