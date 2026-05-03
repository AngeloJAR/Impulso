"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type PrioridadIdea = "baja" | "media" | "alta";

export type EstadoIdea =
  | "nueva"
  | "revisar"
  | "convertir_en_tarea"
  | "convertida"
  | "archivada";

type CrearIdeaRapidaPayload = {
  titulo: string;
  descripcion?: string;
  proyectoId?: string;
  prioridad: PrioridadIdea;
  fechaRecordatorio?: string;
};

const estadosIdeaPermitidos: EstadoIdea[] = [
  "nueva",
  "revisar",
  "convertir_en_tarea",
  "convertida",
  "archivada",
];

export async function crearIdeaRapida(payload: CrearIdeaRapidaPayload) {
  const titulo = payload.titulo.trim();
  const descripcion = payload.descripcion?.trim() || null;
  const proyectoId = payload.proyectoId?.trim() || null;
  const fechaRecordatorio = payload.fechaRecordatorio?.trim() || null;

  if (!titulo) {
    throw new Error("Escribe un título para la idea.");
  }

  if (!["baja", "media", "alta"].includes(payload.prioridad)) {
    throw new Error("Selecciona una prioridad válida.");
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
    throw new Error("Debes iniciar sesión para guardar ideas.");
  }

  const { data, error } = await supabase
    .from("ideas")
    .insert({
      user_id: user.id,
      titulo,
      descripcion,
      proyecto_id: proyectoId,
      prioridad: payload.prioridad,
      fecha_recordatorio: fechaRecordatorio,
      estado: "nueva",
      convertida_en_tarea: false,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/inbox");
  revalidatePath("/ideas");

  return data;
}

export async function archivarIdea(ideaId: string) {
  return cambiarEstadoIdea(ideaId, "archivada");
}

export async function cambiarEstadoIdea(ideaId: string, estado: EstadoIdea) {
  const id = ideaId.trim();

  if (!id) {
    throw new Error("No se recibió la idea que quieres actualizar.");
  }

  if (!estadosIdeaPermitidos.includes(estado)) {
    throw new Error("Selecciona un estado válido para la idea.");
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
    throw new Error("Debes iniciar sesión para actualizar ideas.");
  }

  const { error } = await supabase
    .from("ideas")
    .update({
      estado,
      convertida_en_tarea: estado === "convertida",
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/inbox");
  revalidatePath("/ideas");

  return { ok: true };
}