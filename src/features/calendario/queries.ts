import { supabase } from "@/lib/supabase/client";

export type CalendarioTarea = {
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
    proyecto: {
        id: string;
        nombre: string;
        color: "slate" | "amber" | "sky" | "emerald" | "violet" | "rose" | "indigo";
    } | null;
};

export type CalendarioMetricas = {
    tareasHoy: number;
    tareasProximas: number;
    recordatoriosProximos: number;
    tareasTerminadas: number;
    tareasHoyLista: CalendarioTarea[];
    tareasProximasLista: CalendarioTarea[];
    recordatoriosLista: CalendarioTarea[];
    tareasSemana: CalendarioTarea[];
};

type ProyectoRelacion =
    | {
        id: string;
        nombre: string;
        color:
        | "slate"
        | "amber"
        | "sky"
        | "emerald"
        | "violet"
        | "rose"
        | "indigo";
    }
    | {
        id: string;
        nombre: string;
        color:
        | "slate"
        | "amber"
        | "sky"
        | "emerald"
        | "violet"
        | "rose"
        | "indigo";
    }[]
    | null;

type CalendarioTareaRow = {
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
    proyectos: ProyectoRelacion;
};
function normalizarProyecto(proyectos: ProyectoRelacion) {
    if (Array.isArray(proyectos)) {
        return proyectos[0] ?? null;
    }

    return proyectos;
}

function getDateInEcuador(date: Date) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Guayaquil",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(date);
}

function addDays(date: Date, days: number) {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
}

function normalizeRows(rows: CalendarioTareaRow[]): CalendarioTarea[] {
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
        proyecto: normalizarProyecto(tarea.proyectos),
    }));
}

export async function getCalendarioMetricas(): Promise<CalendarioMetricas> {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        throw new Error(userError.message);
    }

    if (!user) {
        return {
            tareasHoy: 0,
            tareasProximas: 0,
            recordatoriosProximos: 0,
            tareasTerminadas: 0,
            tareasHoyLista: [],
            tareasProximasLista: [],
            recordatoriosLista: [],
            tareasSemana: [],
        };
    }

    const today = getDateInEcuador(new Date());
    const nextSevenDays = getDateInEcuador(addDays(new Date(), 7));

    const baseSelect = `
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
    proyectos (
      id,
      nombre,
      color
    )
  `;

    const [
        tareasHoyResult,
        tareasProximasResult,
        recordatoriosResult,
        tareasTerminadasResult,
        tareasSemanaResult,
    ] = await Promise.all([
        supabase
            .from("tareas")
            .select(baseSelect)
            .eq("user_id", user.id)
            .neq("estado", "terminada")
            .or(`fecha.eq.${today},fecha_inicio.eq.${today},estado.eq.hoy`)
            .order("created_at", { ascending: false }),

        supabase
            .from("tareas")
            .select(baseSelect)
            .eq("user_id", user.id)
            .neq("estado", "terminada")
            .or(`fecha_inicio.gte.${today},fecha.gte.${today}`)
            .or(`fecha_inicio.lte.${nextSevenDays},fecha.lte.${nextSevenDays}`)
            .order("fecha_inicio", { ascending: true }),

        supabase
            .from("tareas")
            .select(baseSelect)
            .eq("user_id", user.id)
            .neq("estado", "terminada")
            .not("recordatorio", "is", null)
            .order("recordatorio", { ascending: true }),

        supabase
            .from("tareas")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("estado", "terminada"),

        supabase
            .from("tareas")
            .select(baseSelect)
            .eq("user_id", user.id)
            .or(`fecha_inicio.gte.${today},fecha.gte.${today}`)
            .or(`fecha_inicio.lte.${nextSevenDays},fecha.lte.${nextSevenDays}`)
            .order("fecha_inicio", { ascending: true }),
    ]);

    const results = [
        tareasHoyResult,
        tareasProximasResult,
        recordatoriosResult,
        tareasTerminadasResult,
        tareasSemanaResult,
    ];

    const firstError = results.find((result) => result.error)?.error;

    if (firstError) {
        throw new Error(firstError.message);
    }

    const tareasHoyLista = normalizeRows(
        (tareasHoyResult.data ?? []) as unknown as CalendarioTareaRow[]
    );

    const tareasProximasLista = normalizeRows(
        (tareasProximasResult.data ?? []) as unknown as CalendarioTareaRow[]
    );

    const recordatoriosLista = normalizeRows(
        (recordatoriosResult.data ?? []) as unknown as CalendarioTareaRow[]
    );

    const tareasSemana = normalizeRows(
        (tareasSemanaResult.data ?? []) as unknown as CalendarioTareaRow[]
    );

    return {
        tareasHoy: tareasHoyLista.length,
        tareasProximas: tareasProximasLista.length,
        recordatoriosProximos: recordatoriosLista.length,
        tareasTerminadas: tareasTerminadasResult.count ?? 0,
        tareasHoyLista,
        tareasProximasLista,
        recordatoriosLista,
        tareasSemana,
    };
}