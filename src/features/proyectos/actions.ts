"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type CrearProyectoPayload = {
  nombre: string;
  descripcion?: string;
  color?: string;
};

const coloresPermitidos = [
  "slate",
  "amber",
  "sky",
  "emerald",
  "violet",
  "rose",
  "indigo",
] as const;

type ColorProyecto = (typeof coloresPermitidos)[number];

function validarColorProyecto(color: string): ColorProyecto {
  if (coloresPermitidos.includes(color as ColorProyecto)) {
    return color as ColorProyecto;
  }

  throw new Error("Selecciona un color válido.");
}

export async function crearProyecto(payload: CrearProyectoPayload) {
  const nombre = payload.nombre.trim();
  const descripcion = payload.descripcion?.trim() || null;
  const color = validarColorProyecto(payload.color?.trim() || "slate");

  if (!nombre) {
    throw new Error("Escribe un nombre para el proyecto.");
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
    throw new Error("Debes iniciar sesión para crear proyectos.");
  }

  const { data, error } = await supabase
    .from("proyectos")
    .insert({
      user_id: user.id,
      nombre,
      descripcion,
      color,
      estado: "activo",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/proyectos");
  revalidatePath(`/proyectos/${data.id}`);
  revalidatePath("/inbox");

  return data;
}