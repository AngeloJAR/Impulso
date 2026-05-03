import { supabase } from "@/lib/supabase/client";

export type EstadoIdea = "nueva" | "revisar" | "convertir_en_tarea" | "convertida" | "archivada";

export type PrioridadIdea = "baja" | "media" | "alta";

export type ProyectoIdea = {
  id: string;
  nombre: string;
  color: "slate" | "amber" | "sky" | "emerald" | "violet" | "rose" | "indigo";
};

export type IdeaResumen = {
  id: string;
  titulo: string;
  descripcion: string | null;
  prioridad: PrioridadIdea;
  estado: EstadoIdea;
  fecha_recordatorio: string | null;
  convertida_en_tarea: boolean;
  created_at: string;
  proyecto: ProyectoIdea | null;
};

type ProyectoRelacion = ProyectoIdea | ProyectoIdea[] | null;

type IdeaResumenRow = {
  id: string;
  titulo: string;
  descripcion: string | null;
  prioridad: PrioridadIdea;
  estado: EstadoIdea;
  fecha_recordatorio: string | null;
  convertida_en_tarea: boolean;
  created_at: string;
  proyectos: ProyectoRelacion;
};

function normalizarProyecto(proyectos: ProyectoRelacion): ProyectoIdea | null {
  if (Array.isArray(proyectos)) {
    return proyectos[0] ?? null;
  }

  return proyectos;
}

export async function getIdeas(): Promise<IdeaResumen[]> {
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
      convertida_en_tarea,
      created_at,
      proyectos (
        id,
        nombre,
        color
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as IdeaResumenRow[];

  return rows.map((idea) => ({
    id: idea.id,
    titulo: idea.titulo,
    descripcion: idea.descripcion,
    prioridad: idea.prioridad,
    estado: idea.estado,
    fecha_recordatorio: idea.fecha_recordatorio,
    convertida_en_tarea: idea.convertida_en_tarea,
    created_at: idea.created_at,
    proyecto: normalizarProyecto(idea.proyectos),
  }));
}
