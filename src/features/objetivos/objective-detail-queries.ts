import { supabase } from "@/lib/supabase/client";

export type ObjetivoDetalleProyecto = {
  id: string;
  nombre: string;
  descripcion: string | null;
  color: "slate" | "amber" | "sky" | "emerald" | "violet" | "rose" | "indigo";
  estado: "activo" | "pausado" | "completado" | "archivado";
};

export type ObjetivoDetalle = {
  id: string;
  titulo: string;
  descripcion: string | null;
  proyecto_id: string | null;
  fecha_inicio: string | null;
  fecha_limite: string | null;
  progreso: number;
  estado: "activo" | "pausado" | "completado" | "abandonado";
  created_at: string;
  proyecto: ObjetivoDetalleProyecto | null;
};

export type ObjetivoDetalleTarea = {
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
  created_at: string;
};
export type ObjetivoDetalleData = {
  objetivo: ObjetivoDetalle | null;
  tareas: ObjetivoDetalleTarea[];
  metricas: {
    totalTareas: number;
    tareasPendientes: number;
    tareasTerminadas: number;
    progresoCalculado: number;
  };
};

type ProyectoRelacion = ObjetivoDetalleProyecto | ObjetivoDetalleProyecto[] | null;

type ObjetivoRow = {
  id: string;
  titulo: string;
  descripcion: string | null;
  proyecto_id: string | null;
  fecha_inicio: string | null;
  fecha_limite: string | null;
  progreso: number;
  estado: "activo" | "pausado" | "completado" | "abandonado";
  created_at: string;
  proyectos: ProyectoRelacion;
};

function normalizarProyecto(proyectos: ProyectoRelacion): ObjetivoDetalleProyecto | null {
  if (Array.isArray(proyectos)) {
    return proyectos[0] ?? null;
  }

  return proyectos;
}

function calcularProgreso(tareas: ObjetivoDetalleTarea[]) {
  if (tareas.length === 0) return 0;

  const terminadas = tareas.filter((tarea) => tarea.estado === "terminada").length;

  return Math.round((terminadas / tareas.length) * 100);
}

export async function getObjetivoDetalle(objetivoId: string): Promise<ObjetivoDetalleData> {
  const id = objetivoId.trim();

  if (!id) {
    throw new Error("No se recibió el objetivo.");
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
      objetivo: null,
      tareas: [],
      metricas: {
        totalTareas: 0,
        tareasPendientes: 0,
        tareasTerminadas: 0,
        progresoCalculado: 0,
      },
    };
  }

  const [objetivoResult, tareasResult] = await Promise.all([
    supabase
      .from("objetivos")
      .select(
        `
        id,
        titulo,
        descripcion,
        proyecto_id,
        fecha_inicio,
        fecha_limite,
        progreso,
        estado,
        created_at,
        proyectos (
          id,
          nombre,
          descripcion,
          color,
          estado
        )
      `
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),

    supabase
      .from("tareas")
      .select(
        "id, titulo, descripcion, prioridad, estado, fecha, fecha_inicio, fecha_limite, recordatorio, completada, created_at"
      )
      .eq("objetivo_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (objetivoResult.error) {
    throw new Error(objetivoResult.error.message);
  }

  if (tareasResult.error) {
    throw new Error(tareasResult.error.message);
  }

  const tareas = (tareasResult.data ?? []) as ObjetivoDetalleTarea[];
  const progresoCalculado = calcularProgreso(tareas);

  const objetivoRow = objetivoResult.data as unknown as ObjetivoRow;

  return {
    objetivo: {
      id: objetivoRow.id,
      titulo: objetivoRow.titulo,
      descripcion: objetivoRow.descripcion,
      proyecto_id: objetivoRow.proyecto_id,
      fecha_inicio: objetivoRow.fecha_inicio,
      fecha_limite: objetivoRow.fecha_limite,
      progreso: objetivoRow.progreso,
      estado: objetivoRow.estado,
      created_at: objetivoRow.created_at,
      proyecto: normalizarProyecto(objetivoRow.proyectos),
    },
    tareas,
    metricas: {
      totalTareas: tareas.length,
      tareasPendientes: tareas.filter((tarea) => tarea.estado !== "terminada").length,
      tareasTerminadas: tareas.filter((tarea) => tarea.estado === "terminada").length,
      progresoCalculado,
    },
  };
}
