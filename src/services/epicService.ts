import { supabase } from "../config/supabase";
import type { Database } from "../types/database.types";

type Epic = Database["public"]["Tables"]["epics"]["Row"];
type EpicInsert = Database["public"]["Tables"]["epics"]["Insert"];
type EpicUpdate = Database["public"]["Tables"]["epics"]["Update"];

export const epicService = {
  async getProjectEpics(projectId: string) {
    const { data, error } = await supabase
      .from("epics")
      .select("*")
      .eq("project_id", projectId)
      .order("order", { ascending: true });

    if (error) throw error;
    return data as Epic[];
  },

  async createEpic(epic: EpicInsert) {
    const { data, error } = await supabase
      .from("epics")
      .insert({
        name: epic.name,
        start_date: epic.start_date,
        end_date: epic.end_date,
        status: epic.status,
        tag_ids: epic.tag_ids,
        order: epic.order,
        project_id: epic.project_id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating epic:", error);
      throw error;
    }
    return data as Epic;
  },

  async updateEpic(id: string, updates: EpicUpdate) {
    const { data, error } = await supabase
      .from("epics")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Epic;
  },

  async deleteEpic(id: string) {
    const { error } = await supabase.from("epics").delete().eq("id", id);

    if (error) throw error;
  },

  async updateEpicOrder(epics: Epic[]) {
    const { error } = await supabase.from("epics").upsert(
      epics.map((epic, index) => ({
        ...epic,
        order: index,
      }))
    );

    if (error) throw error;
  },
};
