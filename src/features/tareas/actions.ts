"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type PrioridadTarea = "baja" | "media" | "alta";

export type EstadoTarea = "pendiente" | "hoy" | "en_proceso" | "bloqueada" | "terminada";

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

function normalizeOptionalText(value?: string) {
  const text = value?.trim();

  if (!text) return null;

  return text;
}

function validarPrioridadTarea(prioridad: PrioridadTarea) {
  if (!prioridadesPermitidas.includes(prioridad)) {
    throw new Error("Selecciona una prioridad válida.");
  }

  return prioridad;
}

function validarEstadoTarea(estado?: EstadoTarea) {
  const estadoFinal = estado || "pendiente";

  if (!estadosPermitidos.includes(estadoFinal)) {
    throw new Error("Selecciona un estado válido para la tarea.");
  }

  return estadoFinal;
}

export async function crearTarea(payload: CrearTareaPayload) {
  const titulo = payload.titulo.trim();
  const descripcion = normalizeOptionalText(payload.descripcion);
  const proyectoId = normalizeOptionalText(payload.proyectoId);
  const objetivoId = normalizeOptionalText(payload.objetivoId);
  const prioridad = validarPrioridadTarea(payload.prioridad);
  const estado = validarEstadoTarea(payload.estado);
  const fecha = normalizeOptionalText(payload.fecha);
  const fechaInicio = normalizeOptionalText(payload.fechaInicio) || fecha;
  const fechaLimite = normalizeOptionalText(payload.fechaLimite) || fecha;
  const recordatorio = normalizeOptionalText(payload.recordatorio);
  const ideaId = normalizeOptionalText(payload.ideaId);

  if (!titulo) {
    throw new Error("Escribe un título para la tarea.");
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

  if (objetivoId && fechaInicio && fechaLimite && estado !== "terminada") {
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
  revalidatePath("/proyectos");

  if (proyectoId) {
    revalidatePath(`/proyectos/${proyectoId}`);
  }

  return data;
}

export async function cambiarEstadoTarea(tareaId: string, estado: EstadoTarea) {
  const id = tareaId.trim();
  const nuevoEstado = validarEstadoTarea(estado);

  if (!id) {
    throw new Error("No se recibió la tarea que quieres actualizar.");
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

  const { data: tareaActual, error: tareaActualError } = await supabase
    .from("tareas")
    .select("proyecto_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (tareaActualError) {
    throw new Error(tareaActualError.message);
  }

  const { error } = await supabase
    .from("tareas")
    .update({
      estado: nuevoEstado,
      completada: nuevoEstado === "terminada",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/tareas");
  revalidatePath("/calendario");
  revalidatePath("/proyectos");

  if (tareaActual?.proyecto_id) {
    revalidatePath(`/proyectos/${tareaActual.proyecto_id}`);
  }

  return { ok: true };
}
