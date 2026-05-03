"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  FolderKanban,
  Lightbulb,
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
} from "lucide-react";

import {
  getProyectos,
  type ProyectoResumen,
} from "@/features/proyectos/queries";
import { flowRoutes } from "@/config/app";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const colorStyles: Record<ProyectoResumen["color"], string> = {
  slate: "bg-slate-200/20 text-slate-100 ring-white/10",
  amber: "bg-amber-300/20 text-amber-100 ring-amber-200/20",
  sky: "bg-sky-300/20 text-sky-100 ring-sky-200/20",
  emerald: "bg-emerald-300/20 text-emerald-100 ring-emerald-200/20",
  violet: "bg-violet-300/20 text-violet-100 ring-violet-200/20",
  rose: "bg-rose-300/20 text-rose-100 ring-rose-200/20",
  indigo: "bg-indigo-300/20 text-indigo-100 ring-indigo-200/20",
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
      title="Dashboard"
      description="Empieza con una idea nueva o entra a un proyecto para trabajar objetivos y tareas."
    >
      <div className="grid gap-6 text-white">
        {error ? (
          <div className="rounded-2xl border border-red-300/30 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100 backdrop-blur-xl">
            {error}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/48 shadow-[0_24px_90px_rgba(2,6,23,0.35)] backdrop-blur-2xl">
          <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_360px] md:p-8">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="absolute bottom-0 left-20 h-32 w-32 rounded-full bg-sky-400/20 blur-3xl" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-slate-100 shadow-sm backdrop-blur-xl">
                <Sparkles className="h-4 w-4 text-amber-200" />
                Centro de control
              </div>

              <h1 className="max-w-3xl text-3xl font-black tracking-tight text-white drop-shadow-sm md:text-5xl">
                Captura ideas, conviértelas en objetivos y aterrízalas en
                tareas.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
                Primero captura una idea nueva o entra a un proyecto existente.
                Dentro del proyecto trabajarás objetivos, tareas y calendario.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href={flowRoutes.nuevaIdea}>
                  <Button
                    size="lg"
                    className="w-full rounded-2xl bg-white text-slate-950 shadow-sm hover:bg-slate-100 sm:w-auto"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Nueva idea
                  </Button>
                </Link>

                <Link href="#proyectos">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full rounded-2xl border-white/15 bg-white/10 text-white shadow-sm backdrop-blur-xl hover:bg-white/15 sm:w-auto"
                  >
                    <FolderKanban className="mr-2 h-5 w-5" />
                    Ver proyectos
                  </Button>
                </Link>
              </div>
            </div>

            <Card className="relative rounded-[2rem] border-white/10 bg-slate-950/72 p-6 text-white shadow-[0_18px_70px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <p className="text-sm font-semibold text-slate-300">
                Flujo principal
              </p>

              <div className="mt-5 grid gap-3">
                {[
                  "Dashboard",
                  "Nueva idea o proyecto",
                  "Objetivos",
                  "Tareas",
                  "Calendario",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-xs font-black text-slate-950 shadow-sm">
                        {index + 1}
                      </span>

                      <span className="text-sm font-semibold text-white">
                        {item}
                      </span>
                    </div>

                    {index < 4 ? (
                      <ArrowRight className="h-4 w-4 text-slate-300" />
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section
          id="proyectos"
          className="rounded-[1.75rem] border border-white/10 bg-slate-950/44 shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl"
        >
          <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm">
                <FolderKanban className="h-5 w-5" />
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-xl font-black tracking-tight text-white md:text-2xl">
                    Proyectos
                  </h2>

                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-slate-200 backdrop-blur-xl">
                    {loading
                      ? "Cargando..."
                      : `${proyectos.length} proyecto${
                          proyectos.length === 1 ? "" : "s"
                        }`}
                  </span>
                </div>

                <p className="mt-1 text-sm leading-5 text-slate-300">
                  Entra a un proyecto para crear objetivos, tareas y revisar su
                  calendario.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto md:items-center">
              <div className="relative w-full md:w-[340px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar proyecto..."
                  className="h-10 w-full rounded-2xl border border-white/10 bg-white/10 pl-10 pr-4 text-sm font-semibold text-white outline-none backdrop-blur-xl transition placeholder:text-slate-300 focus:border-white/30 focus:bg-white/15 focus:ring-4 focus:ring-white/10"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-2xl border-white/15 bg-white/10 px-4 font-bold text-white shadow-sm backdrop-blur-xl hover:bg-white/15"
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
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-44 animate-pulse rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl"
                  />
                ))}
              </div>
            ) : proyectos.length === 0 ? (
              <Card className="rounded-3xl border-dashed border-white/20 bg-white/10 p-8 text-center text-white shadow-none backdrop-blur-2xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white/15 text-amber-100 shadow-sm ring-1 ring-white/10">
                  <Lightbulb className="h-6 w-6" />
                </div>

                <p className="text-lg font-black text-white">
                  Todavía no hay proyectos
                </p>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-200">
                  Crea una nueva idea para generar un proyecto y empezar el
                  flujo.
                </p>

                <Link href={flowRoutes.nuevaIdea} className="mt-5 inline-flex">
                  <Button className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear nueva idea
                  </Button>
                </Link>
              </Card>
            ) : proyectosFiltrados.length === 0 ? (
              <Card className="rounded-3xl border-dashed border-white/20 bg-white/10 p-8 text-center text-white shadow-none backdrop-blur-2xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white/15 text-slate-100 shadow-sm ring-1 ring-white/10">
                  <Search className="h-6 w-6" />
                </div>

                <p className="text-lg font-black text-white">
                  No se encontraron proyectos
                </p>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-200">
                  Prueba con otro nombre, estado o palabra de la descripción.
                </p>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {proyectosFiltrados.map((proyecto) => (
                  <Link
                    key={proyecto.id}
                    href={`/proyectos/${proyecto.id}`}
                    className="group flex min-h-[190px] flex-col rounded-3xl border border-white/10 bg-white/10 p-5 text-white shadow-[0_18px_70px_rgba(2,6,23,0.18)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/15 hover:shadow-[0_24px_90px_rgba(2,6,23,0.26)]"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div
                        className={`rounded-2xl p-3 ring-1 ${
                          colorStyles[proyecto.color]
                        }`}
                      >
                        <FolderKanban className="h-5 w-5" />
                      </div>

                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 text-slate-200 shadow-sm ring-1 ring-white/10 transition group-hover:bg-white group-hover:text-slate-950">
                        <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold capitalize text-slate-100 shadow-sm backdrop-blur-xl">
                        {proyecto.estado}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-slate-200 shadow-sm backdrop-blur-xl">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatFecha(proyecto.created_at)}
                      </span>
                    </div>

                    <h3 className="line-clamp-2 text-lg font-black leading-6 text-white">
                      {proyecto.nombre}
                    </h3>

                    {proyecto.descripcion ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-200">
                        {proyecto.descripcion}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-slate-300">
                        Sin descripción
                      </p>
                    )}

                    <div className="mt-auto pt-4">
                      <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs font-bold text-slate-300">
                        <span>Entrar al proyecto</span>

                        <span className="text-slate-400 transition group-hover:text-white">
                          Objetivos y tareas
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