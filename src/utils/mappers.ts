import type { DbEpic, DbTag, Epic, Tag } from "../types/project";

export function mapDbEpicToEpic(dbEpic: DbEpic): Epic {
  return {
    id: dbEpic.id,
    name: dbEpic.name,
    startDate: dbEpic.start_date,
    endDate: dbEpic.end_date,
    status: dbEpic.status as Epic["status"],
    tagIds: dbEpic.tag_ids,
    order: dbEpic.order,
  };
}

export function mapEpicToDbEpic(epic: Epic): Omit<DbEpic, "id" | "created_at"> {
  return {
    name: epic.name,
    start_date: epic.startDate,
    end_date: epic.endDate,
    status: epic.status,
    tag_ids: epic.tagIds,
    order: epic.order,
    project_id: "", // Este valor debe ser proporcionado al crear/actualizar
  };
}

export function mapDbTagToTag(dbTag: DbTag): Tag {
  return {
    id: dbTag.id,
    name: dbTag.name,
    color: dbTag.color,
  };
}

export function mapTagToDbTag(tag: Tag): Omit<DbTag, "id" | "created_at"> {
  return {
    name: tag.name,
    color: tag.color,
    project_id: "", // Este valor debe ser proporcionado al crear/actualizar
  };
}
