import { supabase } from "@/lib/supabase/client";

export type IdeaReciente = {
  id: string;
  titulo: string;
  descripcion: string | null;
  prioridad: "baja" | "media" | "alta";
  estado: "nueva" | "revisar" | "convertir_en_tarea" | "convertida" | "archivada";
  fecha_recordatorio: string | null;
  created_at: string;
  proyecto: {
    id: string;
    nombre: string;
    color: "slate" | "amber" | "sky" | "emerald" | "violet" | "rose" | "indigo";
  } | null;
};

type IdeaRecienteRow = {
  id: string;
  titulo: string;
  descripcion: string | null;
  prioridad: "baja" | "media" | "alta";
  estado: "nueva" | "revisar" | "convertir_en_tarea" | "convertida" | "archivada";
  fecha_recordatorio: string | null;
  created_at: string;
  proyectos:
    | {
        id: string;
        nombre: string;
        color: "slate" | "amber" | "sky" | "emerald" | "violet" | "rose" | "indigo";
      }
    | {
        id: string;
        nombre: string;
        color: "slate" | "amber" | "sky" | "emerald" | "violet" | "rose" | "indigo";
      }[]
    | null;
};

export async function getIdeasRecientes(): Promise<IdeaReciente[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("ideas")
    .select(
      `
      id,
      titulo,
      descripcion,
      prioridad,
      estado,
      fecha_recordatorio,
      created_at,
      proyectos (
        id,
        nombre,
        color
      )
    `
    )
    .eq("user_id", user.id)
    .neq("estado", "archivada")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as IdeaRecienteRow[];

  return rows.map((idea) => ({
    id: idea.id,
    titulo: idea.titulo,
    descripcion: idea.descripcion,
    prioridad: idea.prioridad,
    estado: idea.estado,
    fecha_recordatorio: idea.fecha_recordatorio,
    created_at: idea.created_at,
    proyecto: (() => {
      const proyecto = Array.isArray(idea.proyectos) ? idea.proyectos[0] : idea.proyectos;

      return proyecto
        ? {
            id: proyecto.id,
            nombre: proyecto.nombre,
            color: proyecto.color,
          }
        : null;
    })(),
  }));
}
