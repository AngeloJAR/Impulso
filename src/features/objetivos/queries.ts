import { supabase } from "@/lib/supabase/client";

export type EstadoObjetivo =
  | "activo"
  | "pausado"
  | "completado"
  | "abandonado";

export type ProyectoObjetivo = {
  id: string;
  nombre: string;
  color: "slate" | "amber" | "sky" | "emerald" | "violet" | "rose" | "indigo";
};

export type ObjetivoResumen = {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string | null;
  fecha_limite: string | null;
  progreso: number;
  estado: EstadoObjetivo;
  created_at: string;
  proyecto: ProyectoObjetivo | null;
};

type ProyectoRelacion = ProyectoObjetivo | ProyectoObjetivo[] | null;

type ObjetivoResumenRow = {
  id: string;
  titulo: string;
  descripcion: string | null;
  fecha_inicio: string | null;
  fecha_limite: string | null;
  progreso: number;
  estado: EstadoObjetivo;
  created_at: string;
  proyectos: ProyectoRelacion;
};

function normalizarProyecto(proyectos: ProyectoRelacion): ProyectoObjetivo | null {
  if (Array.isArray(proyectos)) {
    return proyectos[0] ?? null;
  }

  return proyectos;
}

export async function getObjetivos(): Promise<ObjetivoResumen[]> {
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
    .from("objetivos")
    .select(
      `
      id,
      titulo,
      descripcion,
      fecha_inicio,
      fecha_limite,
      progreso,
      estado,
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

  const rows = (data ?? []) as unknown as ObjetivoResumenRow[];

  return rows.map((objetivo) => ({
    id: objetivo.id,
    titulo: objetivo.titulo,
    descripcion: objetivo.descripcion,
    fecha_inicio: objetivo.fecha_inicio,
    fecha_limite: objetivo.fecha_limite,
    progreso: objetivo.progreso,
    estado: objetivo.estado,
    created_at: objetivo.created_at,
    proyecto: normalizarProyecto(objetivo.proyectos),
  }));
}

export type ObjetivoSelector = {
  id: string;
  titulo: string;
  estado: EstadoObjetivo;
  proyecto_id: string | null;
};

export async function getObjetivosParaSelector(): Promise<ObjetivoSelector[]> {
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
    .from("objetivos")
    .select("id, titulo, estado, proyecto_id")
    .eq("user_id", user.id)
    .in("estado", ["activo", "pausado"])
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ObjetivoSelector[];
}