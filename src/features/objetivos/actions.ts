"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type EstadoObjetivo = "activo" | "pausado" | "completado" | "abandonado";

type CrearObjetivoPayload = {
    titulo: string;
    descripcion?: string;
    proyectoId?: string;
    fechaInicio?: string;
    fechaLimite?: string;
    estado?: EstadoObjetivo;
};

const estadosPermitidos: EstadoObjetivo[] = [
    "activo",
    "pausado",
    "completado",
    "abandonado",
];

export async function crearObjetivo(payload: CrearObjetivoPayload) {
    const titulo = payload.titulo.trim();
    const descripcion = payload.descripcion?.trim() || null;
    const proyectoId = payload.proyectoId?.trim() || null;
    const fechaInicio = payload.fechaInicio?.trim() || null;
    const fechaLimite = payload.fechaLimite?.trim() || null;
    const estado = payload.estado || "activo";

    if (!titulo) {
        throw new Error("Escribe un título para el objetivo.");
    }

    if (!estadosPermitidos.includes(estado)) {
        throw new Error("Selecciona un estado válido para el objetivo.");
    }

    if (fechaInicio && fechaLimite && fechaInicio > fechaLimite) {
        throw new Error("La fecha de inicio no puede ser mayor que la fecha límite.");
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
        throw new Error("Debes iniciar sesión para crear objetivos.");
    }
    if (proyectoId && fechaInicio && fechaLimite && ["activo", "pausado"].includes(estado)) {
        const { data: objetivosCruzados, error: objetivosCruzadosError } =
            await supabase
                .from("objetivos")
                .select("id, titulo, fecha_inicio, fecha_limite, estado")
                .eq("user_id", user.id)
                .eq("proyecto_id", proyectoId)
                .in("estado", ["activo", "pausado"])
                .lte("fecha_inicio", fechaLimite)
                .gte("fecha_limite", fechaInicio);

        if (objetivosCruzadosError) {
            throw new Error(objetivosCruzadosError.message);
        }

        if ((objetivosCruzados?.length ?? 0) > 0) {
            const objetivo = objetivosCruzados?.[0];

            throw new Error(
                `Ya existe un objetivo activo o pausado en ese rango: "${objetivo?.titulo}". Rango ocupado: ${objetivo?.fecha_inicio} al ${objetivo?.fecha_limite}.`
            );
        }
    }
    const { data, error } = await supabase
        .from("objetivos")
        .insert({
            user_id: user.id,
            titulo,
            descripcion,
            proyecto_id: proyectoId,
            fecha_inicio: fechaInicio,
            fecha_limite: fechaLimite,
            progreso: estado === "completado" ? 100 : 0,
            estado,
        })
        .select("id")
        .single();

    if (error) {
        throw new Error(error.message);
    }
    revalidatePath("/");
    revalidatePath("/objetivos");
    revalidatePath("/proyectos");
    revalidatePath("/calendario");

    return data;
}

export async function cambiarEstadoObjetivo(
    objetivoId: string,
    estado: EstadoObjetivo
) {
    const id = objetivoId.trim();

    if (!id) {
        throw new Error("No se recibió el objetivo que quieres actualizar.");
    }

    if (!estadosPermitidos.includes(estado)) {
        throw new Error("Selecciona un estado válido para el objetivo.");
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
        throw new Error("Debes iniciar sesión para actualizar objetivos.");
    }

    const { error } = await supabase
        .from("objetivos")
        .update({
            estado,
            progreso: estado === "completado" ? 100 : undefined,
        })
        .eq("id", id)
        .eq("user_id", user.id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath("/");
    revalidatePath("/objetivos");
    revalidatePath("/proyectos");
    revalidatePath("/calendario");

    return { ok: true };
}

export async function actualizarProgresoObjetivo(objetivoId: string) {
    const id = objetivoId.trim();

    if (!id) {
        throw new Error("No se recibió el objetivo para actualizar progreso.");
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
        throw new Error("Debes iniciar sesión para actualizar el progreso.");
    }

    const { data: tareas, error: tareasError } = await supabase
        .from("tareas")
        .select("id, estado")
        .eq("objetivo_id", id)
        .eq("user_id", user.id);

    if (tareasError) {
        throw new Error(tareasError.message);
    }

    const totalTareas = tareas?.length ?? 0;
    const tareasTerminadas =
        tareas?.filter((tarea) => tarea.estado === "terminada").length ?? 0;

    const progreso =
        totalTareas === 0 ? 0 : Math.round((tareasTerminadas / totalTareas) * 100);

    const updatePayload: {
        progreso: number;
        estado?: EstadoObjetivo;
    } = {
        progreso,
    };

    if (totalTareas > 0 && progreso === 100) {
        updatePayload.estado = "completado";
    }

    const { error: objetivoError } = await supabase
        .from("objetivos")
        .update(updatePayload)
        .eq("id", id)
        .eq("user_id", user.id);

    if (objetivoError) {
        throw new Error(objetivoError.message);
    }

    revalidatePath("/");
    revalidatePath("/objetivos");
    revalidatePath(`/objetivos/${id}`);
    revalidatePath("/proyectos");
    revalidatePath("/calendario");

    return {
        ok: true,
        progreso,
        totalTareas,
        tareasTerminadas,
    };
}