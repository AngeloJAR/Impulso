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

const estadosPermitidos: EstadoObjetivo[] = ["activo", "pausado", "completado", "abandonado"];

function validarEstadoObjetivo(estado?: EstadoObjetivo): EstadoObjetivo {
  if (!estado) return "activo";

  if (!estadosPermitidos.includes(estado)) {
    throw new Error("Selecciona un estado válido para el objetivo.");
  }

  return estado;
}

function normalizeOptionalDate(value?: string) {
  const date = value?.trim();

  if (!date) return null;

  return date;
}

function normalizeOptionalUuid(value?: string) {
  const id = value?.trim();

  if (!id) return null;

  return id;
}

export async function crearObjetivo(payload: CrearObjetivoPayload) {
  const titulo = payload.titulo.trim();
  const descripcion = payload.descripcion?.trim() || null;
  const proyectoId = normalizeOptionalUuid(payload.proyectoId);
  const fechaInicio = normalizeOptionalDate(payload.fechaInicio);
  const fechaLimite = normalizeOptionalDate(payload.fechaLimite);
  const estado = validarEstadoObjetivo(payload.estado);

  if (!titulo) {
    throw new Error("Escribe un título para el objetivo.");
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

  const { data, error } = await supabase
    .from("objetivos")
    .insert({
      user_id: user.id,
      titulo,
      descripcion,
      proyecto_id: proyectoId,
      fecha_inicio: fechaInicio,
      fecha_limite: fechaLimite,
      estado,
      progreso: estado === "completado" ? 100 : 0,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/objetivos");
  revalidatePath("/proyectos");
  revalidatePath("/tareas");

  if (proyectoId) {
    revalidatePath(`/proyectos/${proyectoId}`);
  }

  return data;
}

export async function cambiarEstadoObjetivo(objetivoId: string, estado: EstadoObjetivo) {
  const id = objetivoId.trim();
  const nuevoEstado = validarEstadoObjetivo(estado);

  if (!id) {
    throw new Error("No se encontró el objetivo.");
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

  const { data: objetivoActual, error: objetivoError } = await supabase
    .from("objetivos")
    .select("proyecto_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (objetivoError) {
    throw new Error(objetivoError.message);
  }

  const { error } = await supabase
    .from("objetivos")
    .update({
      estado: nuevoEstado,
      progreso: nuevoEstado === "completado" ? 100 : 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/objetivos");
  revalidatePath("/proyectos");
  revalidatePath("/tareas");

  if (objetivoActual?.proyecto_id) {
    revalidatePath(`/proyectos/${objetivoActual.proyecto_id}`);
  }
}
export async function actualizarProgresoObjetivo(objetivoId: string) {
  const id = objetivoId.trim();

  if (!id) {
    throw new Error("No se encontró el objetivo.");
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

  const { data: objetivoActual, error: objetivoError } = await supabase
    .from("objetivos")
    .select("id, proyecto_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (objetivoError) {
    throw new Error(objetivoError.message);
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

  const tareasTerminadas = tareas?.filter((tarea) => tarea.estado === "terminada").length ?? 0;

  const progreso = totalTareas > 0 ? Math.round((tareasTerminadas / totalTareas) * 100) : 0;

  const nuevoEstado: EstadoObjetivo = progreso >= 100 && totalTareas > 0 ? "completado" : "activo";

  const { error } = await supabase
    .from("objetivos")
    .update({
      progreso,
      estado: nuevoEstado,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/objetivos");
  revalidatePath(`/objetivos/${id}`);
  revalidatePath("/proyectos");
  revalidatePath("/tareas");
  revalidatePath("/calendario");

  if (objetivoActual?.proyecto_id) {
    revalidatePath(`/proyectos/${objetivoActual.proyecto_id}`);
  }

  return {
    ok: true,
    progreso,
    tareasTerminadas,
    totalTareas,
  };
}
