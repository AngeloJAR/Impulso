import { supabase } from "@/lib/supabase/client";

export type DashboardIdeaReciente = {
  id: string;
  titulo: string;
  estado: string;
  prioridad: string;
  created_at: string;
};

export type DashboardTareaReciente = {
  id: string;
  titulo: string;
  estado: string;
  prioridad: string;
  fecha: string | null;
  created_at: string;
};

export type DashboardMetricas = {
  ideasPendientes: number;
  tareasHoy: number;
  recordatoriosProximos: number;
  objetivosActivos: number;
  proyectosActivos: number;
  ideasRecientes: DashboardIdeaReciente[];
  tareasRecientes: DashboardTareaReciente[];
};

function getTodayISODate() {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(now);
}

export async function getDashboardMetricas(): Promise<DashboardMetricas> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    return {
      ideasPendientes: 0,
      tareasHoy: 0,
      recordatoriosProximos: 0,
      objetivosActivos: 0,
      proyectosActivos: 0,
      ideasRecientes: [],
      tareasRecientes: [],
    };
  }

  const today = getTodayISODate();

  const [
    ideasPendientesResult,
    tareasHoyResult,
    recordatoriosProximosResult,
    objetivosActivosResult,
    proyectosActivosResult,
    ideasRecientesResult,
    tareasRecientesResult,
  ] = await Promise.all([
    supabase
      .from("ideas")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .neq("estado", "archivada")
      .neq("estado", "convertida"),

    supabase
      .from("tareas")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .or(`fecha.eq.${today},estado.eq.hoy`)
      .neq("estado", "terminada"),

    supabase
      .from("recordatorios")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("estado", "pendiente")
      .gte("fecha", new Date().toISOString()),

    supabase
      .from("objetivos")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("estado", "activo"),

    supabase
      .from("proyectos")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("estado", "activo"),

    supabase
      .from("ideas")
      .select("id, titulo, estado, prioridad, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("tareas")
      .select("id, titulo, estado, prioridad, fecha, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const results = [
    ideasPendientesResult,
    tareasHoyResult,
    recordatoriosProximosResult,
    objetivosActivosResult,
    proyectosActivosResult,
    ideasRecientesResult,
    tareasRecientesResult,
  ];

  const firstError = results.find((result) => result.error)?.error;

  if (firstError) {
    throw new Error(firstError.message);
  }

  return {
    ideasPendientes: ideasPendientesResult.count ?? 0,
    tareasHoy: tareasHoyResult.count ?? 0,
    recordatoriosProximos: recordatoriosProximosResult.count ?? 0,
    objetivosActivos: objetivosActivosResult.count ?? 0,
    proyectosActivos: proyectosActivosResult.count ?? 0,
    ideasRecientes: ideasRecientesResult.data ?? [],
    tareasRecientes: tareasRecientesResult.data ?? [],
  };
}
