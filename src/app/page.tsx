"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  FolderKanban,
  Lightbulb,
  RefreshCcw,
  Search,
} from "lucide-react";

import {
  getProyectos,
  type ProyectoResumen,
} from "@/features/proyectos/queries";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const colorStyles: Record<ProyectoResumen["color"], string> = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  amber: "bg-amber-100 text-amber-700 ring-amber-200",
  sky: "bg-sky-100 text-sky-700 ring-sky-200",
  emerald: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  violet: "bg-violet-100 text-violet-700 ring-violet-200",
  rose: "bg-rose-100 text-rose-700 ring-rose-200",
  indigo: "bg-indigo-100 text-indigo-700 ring-indigo-200",
};

function formatFecha(value?: string | null) {
  if (!value) return "Sin fecha";

  const fecha = new Date(value);

  if (Number.isNaN(fecha.getTime())) {
    return "Fecha no válida";
  }

  return new Intl.DateTimeFormat("es-EC", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Guayaquil",
  }).format(fecha);
}

export default function HomePage() {
  const [proyectos, setProyectos] = useState<ProyectoResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadProyectos() {
    setLoading(true);
    setError("");

    try {
      const data = await getProyectos();
      setProyectos(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los proyectos.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProyectos();
  }, []);

  const proyectosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return proyectos;

    return proyectos.filter((proyecto) => {
      const nombre = proyecto.nombre.toLowerCase();
      const descripcion = proyecto.descripcion?.toLowerCase() ?? "";
      const estado = proyecto.estado.toLowerCase();

      return (
        nombre.includes(term) ||
        descripcion.includes(term) ||
        estado.includes(term)
      );
    });
  }, [proyectos, search]);

  return (
    <AppShell
      title="Proyectos"
      description="Administra tus proyectos y entra a sus objetivos y tareas."
    >
      <div className="grid gap-4">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                <FolderKanban className="h-5 w-5" />
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                    Panel de proyectos
                  </h2>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                    {loading
                      ? "Cargando..."
                      : `${proyectos.length} proyecto${
                          proyectos.length === 1 ? "" : "s"
                        }`}
                  </span>
                </div>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Selecciona un proyecto para trabajar sus objetivos, tareas y
                  seguimiento.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto md:items-center">
              <div className="relative w-full md:w-[340px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar proyecto..."
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-2xl border-slate-200 bg-white px-4 font-bold shadow-sm"
                onClick={loadProyectos}
                disabled={loading}
              >
                <RefreshCcw
                  className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Actualizando" : "Actualizar"}
              </Button>
            </div>
          </div>

          <div className="p-5 md:p-6">
            {loading ? (
              <div className="grid max-w-5xl gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-44 animate-pulse rounded-3xl border border-slate-200 bg-slate-50"
                  />
                ))}
              </div>
            ) : proyectos.length === 0 ? (
              <Card className="rounded-3xl border-dashed border-slate-300 bg-slate-50 p-8 text-center shadow-none">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                  <Lightbulb className="h-6 w-6" />
                </div>

                <p className="text-lg font-black text-slate-900">
                  Todavía no hay proyectos
                </p>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Cuando crees proyectos, aparecerán aquí para que puedas entrar
                  a sus objetivos y tareas.
                </p>
              </Card>
            ) : proyectosFiltrados.length === 0 ? (
              <Card className="rounded-3xl border-dashed border-slate-300 bg-slate-50 p-8 text-center shadow-none">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                  <Search className="h-6 w-6" />
                </div>

                <p className="text-lg font-black text-slate-900">
                  No se encontraron proyectos
                </p>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Prueba con otro nombre, estado o palabra de la descripción.
                </p>
              </Card>
            ) : (
              <div className="grid max-w-5xl gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {proyectosFiltrados.map((proyecto) => (
                  <Link
                    key={proyecto.id}
                    href={`/proyectos/${proyecto.id}`}
                    className="group flex min-h-[190px] flex-col rounded-3xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-sm"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div
                        className={`rounded-2xl p-3 ring-1 ${
                          colorStyles[proyecto.color]
                        }`}
                      >
                        <FolderKanban className="h-5 w-5" />
                      </div>

                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-slate-300 shadow-sm ring-1 ring-slate-200 transition group-hover:text-slate-800">
                        <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold capitalize text-slate-600 shadow-sm ring-1 ring-slate-200">
                        {proyecto.estado}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-200">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatFecha(proyecto.created_at)}
                      </span>
                    </div>

                    <h3 className="line-clamp-2 text-lg font-black leading-6 text-slate-950">
                      {proyecto.nombre}
                    </h3>

                    {proyecto.descripcion ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                        {proyecto.descripcion}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-slate-400">
                        Sin descripción
                      </p>
                    )}

                    <div className="mt-auto pt-4">
                      <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-xs font-bold text-slate-400">
                        <span>Ver proyecto</span>
                        <span className="text-slate-300 transition group-hover:text-slate-700">
                          Abrir
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}