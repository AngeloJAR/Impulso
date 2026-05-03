import { supabase } from "@/lib/supabase/client";

export type PrioridadTarea = "baja" | "media" | "alta";

export type EstadoTarea = "pendiente" | "hoy" | "en_proceso" | "bloqueada" | "terminada";

export type ProyectoTarea = {
  id: string;
  nombre: string;
  color: "slate" | "amber" | "sky" | "emerald" | "violet" | "rose" | "indigo";
};

export type ObjetivoTarea = {
  id: string;
  titulo: string;
  estado: "activo" | "pausado" | "completado" | "abandonado";
};

export type TareaResumen = {
  id: string;
  titulo: string;
  descripcion: string | null;
  prioridad: PrioridadTarea;
  estado: EstadoTarea;
  fecha: string | null;
  fecha_inicio: string | null;
  fecha_limite: string | null;
  recordatorio: string | null;
  completada: boolean;
  created_at: string;
  proyecto: ProyectoTarea | null;
  objetivo: ObjetivoTarea | null;
};

type ProyectoRelacion = ProyectoTarea | ProyectoTarea[] | null;
type ObjetivoRelacion = ObjetivoTarea | ObjetivoTarea[] | null;

type TareaResumenRow = {
  id: string;
  titulo: string;
  descripcion: string | null;
  prioridad: PrioridadTarea;
  estado: EstadoTarea;
  fecha: string | null;
  fecha_inicio: string | null;
  fecha_limite: string | null;
  recordatorio: string | null;
  completada: boolean;
  created_at: string;
  proyectos: ProyectoRelacion;
  objetivos: ObjetivoRelacion;
};

function normalizarRelacion<T>(relacion: T | T[] | null): T | null {
  if (Array.isArray(relacion)) {
    return relacion[0] ?? null;
  }

  return relacion;
}

export async function getTareas(): Promise<TareaResumen[]> {
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
    .from("tareas")
    .select(
      `
      id,
    titulo,
    descripcion,
    prioridad,
    estado,
    fecha,
    fecha_inicio,
    fecha_limite,
    recordatorio,
    completada,
    created_at,
      proyectos (
        id,
        nombre,
        color
      ),
      objetivos (
        id,
        titulo,
        estado
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as TareaResumenRow[];

  return rows.map((tarea) => ({
    id: tarea.id,
    titulo: tarea.titulo,
    descripcion: tarea.descripcion,
    prioridad: tarea.prioridad,
    estado: tarea.estado,
    fecha: tarea.fecha,
    fecha_inicio: tarea.fecha_inicio,
    fecha_limite: tarea.fecha_limite,
    recordatorio: tarea.recordatorio,
    completada: tarea.completada,
    created_at: tarea.created_at,
    proyecto: normalizarRelacion(tarea.proyectos),
    objetivo: normalizarRelacion(tarea.objetivos),
  }));
}
