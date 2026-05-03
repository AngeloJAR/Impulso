import { supabase } from "@/lib/supabase/client";

export type ProyectoResumen = {
  id: string;
  nombre: string;
  descripcion: string | null;
  color: "slate" | "amber" | "sky" | "emerald" | "violet" | "rose" | "indigo";
  estado: "activo" | "pausado" | "completado" | "archivado";
  created_at: string;
};

export async function getProyectos(): Promise<ProyectoResumen[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("proyectos")
    .select("id, nombre, descripcion, color, estado, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ProyectoResumen[];
}