"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type PrioridadTarea = "baja" | "media" | "alta";

export type EstadoTarea =
    | "pendiente"
    | "hoy"
    | "en_proceso"
    | "bloqueada"
    | "terminada";

type CrearTareaPayload = {
    titulo: string;
    descripcion?: string;
    proyectoId?: string;
    objetivoId?: string;
    prioridad: PrioridadTarea;
    estado?: EstadoTarea;
    fecha?: string;
    fechaInicio?: string;
    fechaLimite?: string;
    recordatorio?: string;
    ideaId?: string;
};

const prioridadesPermitidas: PrioridadTarea[] = ["baja", "media", "alta"];

const estadosPermitidos: EstadoTarea[] = [
    "pendiente",
    "hoy",
    "en_proceso",
    "bloqueada",
    "terminada",
];

export async function crearTarea(payload: CrearTareaPayload) {
    const titulo = payload.titulo.trim();
    const descripcion = payload.descripcion?.trim() || null;
    const proyectoId = payload.proyectoId?.trim() || null;
    const objetivoId = payload.objetivoId?.trim() || null;
    const prioridad = payload.prioridad;
    const estado = payload.estado || "pendiente";
    const fecha = payload.fecha?.trim() || null;
    const fechaInicio = payload.fechaInicio?.trim() || fecha;
    const fechaLimite = payload.fechaLimite?.trim() || fecha;
    const recordatorio = payload.recordatorio?.trim() || null;
    const ideaId = payload.ideaId?.trim() || null;

    if (!titulo) {
        throw new Error("Escribe un título para la tarea.");
    }

    if (!prioridadesPermitidas.includes(prioridad)) {
        throw new Error("Selecciona una prioridad válida.");
    }

    if (!estadosPermitidos.includes(estado)) {
        throw new Error("Selecciona un estado válido para la tarea.");
    }

    if (fechaInicio && fechaLimite && fechaInicio > fechaLimite) {
        throw new Error("La fecha de inicio de la tarea no puede ser mayor que la fecha límite.");
    }

    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        throw new Error(userError.message);
    }

    if (!user) {
        throw new Error("Debes iniciar sesión para crear tareas.");
    }
    if (
        objetivoId &&
        fechaInicio &&
        fechaLimite &&
        estado !== "terminada"
    ) {
        const { data: tareasCruzadas, error: tareasCruzadasError } = await supabase
            .from("tareas")
            .select("id, titulo, fecha_inicio, fecha_limite, estado")
            .eq("user_id", user.id)
            .eq("objetivo_id", objetivoId)
            .neq("estado", "terminada")
            .lte("fecha_inicio", fechaLimite)
            .gte("fecha_limite", fechaInicio);

        if (tareasCruzadasError) {
            throw new Error(tareasCruzadasError.message);
        }

        if ((tareasCruzadas?.length ?? 0) > 0) {
            const tarea = tareasCruzadas?.[0];

            throw new Error(
                `Ya existe una tarea activa en ese rango: "${tarea?.titulo}". Rango ocupado: ${tarea?.fecha_inicio} al ${tarea?.fecha_limite}.`
            );
        }
    }

    const { data, error } = await supabase
        .from("tareas")
        .insert({
            user_id: user.id,
            titulo,
            descripcion,
            proyecto_id: proyectoId,
            objetivo_id: objetivoId,
            prioridad,
            estado,
            fecha,
            fecha_inicio: fechaInicio,
            fecha_limite: fechaLimite,
            recordatorio,
            completada: estado === "terminada",
        })
        .select("id")
        .single();

    if (error) {
        throw new Error(error.message);
    }

    if (ideaId) {
        const { error: ideaError } = await supabase
            .from("ideas")
            .update({
                estado: "convertida",
                convertida_en_tarea: true,
            })
            .eq("id", ideaId)
            .eq("user_id", user.id);

        if (ideaError) {
            throw new Error(
                `La tarea se creó, pero no se pudo marcar la idea como convertida: ${ideaError.message}`
            );
        }
    }

    revalidatePath("/");
    revalidatePath("/ideas");
    revalidatePath("/inbox");
    revalidatePath("/tareas");
    revalidatePath("/calendario");

    return data;
}

export async function cambiarEstadoTarea(tareaId: string, estado: EstadoTarea) {
    const id = tareaId.trim();

    if (!id) {
        throw new Error("No se recibió la tarea que quieres actualizar.");
    }

    if (!estadosPermitidos.includes(estado)) {
        throw new Error("Selecciona un estado válido para la tarea.");
    }

    const supabase = await createSupabaseServerClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        throw new Error(userError.message);
    }

    if (!user) {
        throw new Error("Debes iniciar sesión para actualizar tareas.");
    }

    const { error } = await supabase
        .from("tareas")
        .update({
            estado,
            completada: estado === "terminada",
        })
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/");
    revalidatePath("/tareas");
    revalidatePath("/calendario");

    return { ok: true };
}