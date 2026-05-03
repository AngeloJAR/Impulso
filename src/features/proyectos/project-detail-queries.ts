import { supabase } from "@/lib/supabase/client";

export type ProyectoDetalle = {
  id: string;
  nombre: string;
  descripcion: string | null;
  color: "slate" | "amber" | "sky" | "emerald" | "violet" | "rose" | "indigo";
  estado: "activo" | "pausado" | "completado" | "archivado";
  created_at: string;
};

export type ProyectoObjetivoResumen = {
  id: string;
  titulo: string;
  descripcion: string | null;
  estado: "activo" | "pausado" | "completado" | "abandonado";
  progreso: number;
  fecha_inicio: string | null;
  fecha_limite: string | null;
  created_at: string;
};

export type ProyectoTareaResumen = {
  id: string;
  titulo: string;
  descripcion: string | null;
  prioridad: "baja" | "media" | "alta";
  estado: "pendiente" | "hoy" | "en_proceso" | "bloqueada" | "terminada";
  fecha: string | null;
  fecha_inicio: string | null;
  fecha_limite: string | null;
  recordatorio: string | null;
  completada: boolean;
  objetivo_id: string | null;
  created_at: string;
};

export type ProyectoDetalleData = {
  proyecto: ProyectoDetalle | null;
  objetivos: ProyectoObjetivoResumen[];
  tareas: ProyectoTareaResumen[];
  metricas: {
    objetivosActivos: number;
    objetivosCompletados: number;
    tareasPendientes: number;
    tareasTerminadas: number;
  };
};

export async function getProyectoDetalle(proyectoId: string): Promise<ProyectoDetalleData> {
  const id = proyectoId.trim();

  if (!id) {
    throw new Error("No se recibió el proyecto.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    return {
      proyecto: null,
      objetivos: [],
      tareas: [],
      metricas: {
        objetivosActivos: 0,
        objetivosCompletados: 0,
        tareasPendientes: 0,
        tareasTerminadas: 0,
      },
    };
  }

  const [proyectoResult, objetivosResult, tareasResult] = await Promise.all([
    supabase
      .from("proyectos")
      .select("id, nombre, descripcion, color, estado, created_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),

    supabase
      .from("objetivos")
      .select("id, titulo, descripcion, estado, progreso, fecha_inicio, fecha_limite, created_at")
      .eq("proyecto_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("tareas")
      .select(
        "id, titulo, descripcion, prioridad, estado, fecha, fecha_inicio, fecha_limite, recordatorio, completada, objetivo_id, created_at"
      )
      .eq("proyecto_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (proyectoResult.error) {
    throw new Error(proyectoResult.error.message);
  }

  if (objetivosResult.error) {
    throw new Error(objetivosResult.error.message);
  }

  if (tareasResult.error) {
    throw new Error(tareasResult.error.message);
  }

  const objetivos = (objetivosResult.data ?? []) as ProyectoObjetivoResumen[];
  const tareas = (tareasResult.data ?? []) as ProyectoTareaResumen[];

  return {
    proyecto: proyectoResult.data as ProyectoDetalle,
    objetivos,
    tareas,
    metricas: {
      objetivosActivos: objetivos.filter((objetivo) => objetivo.estado === "activo").length,
      objetivosCompletados: objetivos.filter((objetivo) => objetivo.estado === "completado").length,
      tareasPendientes: tareas.filter((tarea) => tarea.estado !== "terminada").length,
      tareasTerminadas: tareas.filter((tarea) => tarea.estado === "terminada").length,
    },
  };
}
