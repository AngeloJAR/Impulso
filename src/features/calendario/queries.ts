import { supabase } from "@/lib/supabase/client";

export type CalendarioTarea = {
  id: string;
  titulo: string;
  descripcion: string | null;
  estado: "pendiente" | "hoy" | "en_proceso" | "bloqueada" | "terminada";
  prioridad: "baja" | "media" | "alta";
  fecha: string | null;
  fecha_inicio: string | null;
  fecha_limite: string | null;
  recordatorio: string | null;
  proyecto_id: string | null;
  objetivo_id: string | null;
  proyecto: {
    id: string;
    nombre: string;
    color: string;
  } | null;
  objetivo: {
    id: string;
    titulo: string;
  } | null;
};

export type CalendarioEventoTipo = "inicio" | "limite" | "recordatorio" | "fecha";

export type CalendarioEvento = {
  id: string;
  tareaId: string;
  tipo: CalendarioEventoTipo;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  estado: CalendarioTarea["estado"];
  prioridad: CalendarioTarea["prioridad"];
  proyecto: CalendarioTarea["proyecto"];
  objetivo: CalendarioTarea["objetivo"];
};

export type CalendarioMetricas = {
  totalTareas: number;
  tareasHoy: number;
  tareasVencidas: number;
  recordatorios: number;

  tareasSemana: CalendarioTarea[];
  tareasProximas: number;
  tareasProximasLista: CalendarioTarea[];
  recordatoriosProximos: number;
  tareasTerminadas: number;
  tareasHoyLista: CalendarioTarea[];
  recordatoriosLista: CalendarioTarea[];
};

function buildEventoId(tareaId: string, tipo: CalendarioEventoTipo) {
  return `${tareaId}-${tipo}`;
}

function buildTituloEvento(tarea: CalendarioTarea, tipo: CalendarioEventoTipo) {
  if (tipo === "inicio") return `Inicio: ${tarea.titulo}`;
  if (tipo === "limite") return `Límite: ${tarea.titulo}`;
  if (tipo === "recordatorio") return `Recordatorio: ${tarea.titulo}`;

  return tarea.titulo;
}

function crearEvento(
  tarea: CalendarioTarea,
  tipo: CalendarioEventoTipo,
  fecha: string | null
): CalendarioEvento | null {
  if (!fecha) return null;

  return {
    id: buildEventoId(tarea.id, tipo),
    tareaId: tarea.id,
    tipo,
    titulo: buildTituloEvento(tarea, tipo),
    descripcion: tarea.descripcion,
    fecha,
    estado: tarea.estado,
    prioridad: tarea.prioridad,
    proyecto: tarea.proyecto,
    objetivo: tarea.objetivo,
  };
}

function ordenarEventosPorFecha(eventos: CalendarioEvento[]) {
  return [...eventos].sort((a, b) => {
    const fechaA = new Date(a.fecha).getTime();
    const fechaB = new Date(b.fecha).getTime();

    if (Number.isNaN(fechaA) && Number.isNaN(fechaB)) return 0;
    if (Number.isNaN(fechaA)) return 1;
    if (Number.isNaN(fechaB)) return -1;

    return fechaA - fechaB;
  });
}

export async function getCalendarioTareas(): Promise<CalendarioTarea[]> {
  const { data, error } = await supabase
    .from("tareas")
    .select(
      `
      id,
      titulo,
      descripcion,
      estado,
      prioridad,
      fecha,
      fecha_inicio,
      fecha_limite,
      recordatorio,
      proyecto_id,
      objetivo_id,
      proyecto:proyectos (
        id,
        nombre,
        color
      ),
      objetivo:objetivos (
        id,
        titulo
      )
    `
    )
    .or(
      "fecha.not.is.null,fecha_inicio.not.is.null,fecha_limite.not.is.null,recordatorio.not.is.null"
    )
    .order("fecha_inicio", { ascending: true, nullsFirst: false })
    .order("fecha_limite", { ascending: true, nullsFirst: false })
    .order("recordatorio", { ascending: true, nullsFirst: false })
    .order("fecha", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((tarea) => ({
    ...tarea,
    proyecto: Array.isArray(tarea.proyecto)
      ? (tarea.proyecto[0] ?? null)
      : (tarea.proyecto ?? null),
    objetivo: Array.isArray(tarea.objetivo)
      ? (tarea.objetivo[0] ?? null)
      : (tarea.objetivo ?? null),
  })) as CalendarioTarea[];
}

export async function getCalendarioEventos(): Promise<CalendarioEvento[]> {
  const tareas = await getCalendarioTareas();

  const eventos = tareas.flatMap((tarea) => {
    const eventosTarea: Array<CalendarioEvento | null> = [
      crearEvento(tarea, "fecha", tarea.fecha),
      crearEvento(tarea, "inicio", tarea.fecha_inicio),
      crearEvento(tarea, "limite", tarea.fecha_limite),
      crearEvento(tarea, "recordatorio", tarea.recordatorio),
    ];

    return eventosTarea.filter(Boolean) as CalendarioEvento[];
  });

  return ordenarEventosPorFecha(eventos);
}

export async function getCalendarioMetricas(): Promise<CalendarioMetricas> {
  const tareas = await getCalendarioTareas();

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const finSemana = new Date(hoy);
  finSemana.setDate(hoy.getDate() + 7);

  const hoyISO = hoy.toISOString().slice(0, 10);
  const finSemanaISO = finSemana.toISOString().slice(0, 10);

  function getFechaPrincipal(tarea: CalendarioTarea) {
    return tarea.fecha_inicio || tarea.fecha_limite || tarea.fecha || tarea.recordatorio || null;
  }

  function tareaEsHoy(tarea: CalendarioTarea) {
    return (
      tarea.fecha === hoyISO ||
      tarea.fecha_inicio === hoyISO ||
      tarea.fecha_limite === hoyISO ||
      tarea.recordatorio === hoyISO
    );
  }

  function tareaEstaEnSemana(tarea: CalendarioTarea) {
    const fechas = [tarea.fecha, tarea.fecha_inicio, tarea.fecha_limite, tarea.recordatorio].filter(
      Boolean
    ) as string[];

    return fechas.some((fecha) => fecha >= hoyISO && fecha <= finSemanaISO);
  }

  function tareaEstaVencida(tarea: CalendarioTarea) {
    if (tarea.estado === "terminada") return false;

    const fechaReferencia =
      tarea.fecha_limite || tarea.fecha || tarea.recordatorio || tarea.fecha_inicio;

    if (!fechaReferencia) return false;

    return fechaReferencia < hoyISO;
  }

  const tareasHoyLista = tareas.filter(tareaEsHoy).sort((a, b) => {
    const fechaA = getFechaPrincipal(a) ?? "";
    const fechaB = getFechaPrincipal(b) ?? "";

    return fechaA.localeCompare(fechaB);
  });

  const tareasSemana = tareas.filter(tareaEstaEnSemana).sort((a, b) => {
    const fechaA = getFechaPrincipal(a) ?? "";
    const fechaB = getFechaPrincipal(b) ?? "";

    return fechaA.localeCompare(fechaB);
  });

  const recordatoriosLista = tareas
    .filter((tarea) => Boolean(tarea.recordatorio))
    .sort((a, b) => {
      const fechaA = a.recordatorio ?? "";
      const fechaB = b.recordatorio ?? "";

      return fechaA.localeCompare(fechaB);
    });

  const recordatoriosProximos = recordatoriosLista.filter((tarea) => {
    if (!tarea.recordatorio) return false;

    return tarea.recordatorio >= hoyISO && tarea.recordatorio <= finSemanaISO;
  }).length;

  const tareasTerminadas = tareas.filter((tarea) => tarea.estado === "terminada").length;

  const tareasVencidas = tareas.filter(tareaEstaVencida).length;

  return {
    totalTareas: tareas.length,
    tareasHoy: tareasHoyLista.length,
    tareasVencidas,
    recordatorios: recordatoriosLista.length,

    tareasSemana,
    tareasProximas: tareasSemana.length,
    tareasProximasLista: tareasSemana,
    recordatoriosProximos,
    tareasTerminadas,
    tareasHoyLista,
    recordatoriosLista,
  };
}
