"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Lightbulb,
  ListTodo,
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
  Target,
} from "lucide-react";

import {
  getProyectos,
  type ProyectoResumen,
} from "@/features/proyectos/queries";
import { flowRoutes } from "@/config/app";
import { theme } from "@/config/theme";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const colorStyles: Record<ProyectoResumen["color"], string> = {
  slate: theme.badge.slate,
  amber: theme.badge.amber,
  sky: theme.badge.sky,
  emerald: theme.badge.emerald,
  violet: theme.badge.violet,
  rose: theme.badge.rose,
  indigo: theme.badge.violet,
};

const estadoStyles: Record<ProyectoResumen["estado"], string> = {
  activo: theme.states.proyecto.activo,
  pausado: theme.states.proyecto.pausado,
  completado: theme.states.proyecto.completado,
  archivado: theme.states.proyecto.archivado,
};

function formatFecha(value?: string | null) {
  if (!value) return "Sin fecha";

  const fecha = new Date(`${value}T00:00:00`);

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

function capitalizar(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function HomePage() {
  const [proyectos, setProyectos] = useState<ProyectoResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadProyectos = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getProyectos();
      setProyectos(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudieron cargar los proyectos.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void loadProyectos();
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [loadProyectos]);

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

  const metricas = useMemo(() => {
    return {
      total: proyectos.length,
      activos: proyectos.filter((item) => item.estado === "activo").length,
      pausados: proyectos.filter((item) => item.estado === "pausado").length,
      completados: proyectos.filter((item) => item.estado === "completado")
        .length,
    };
  }, [proyectos]);

  const proyectosRecientes = useMemo(() => {
    return proyectos.slice(0, 4);
  }, [proyectos]);

  return (
    <AppShell
      title="Dashboard"
      description="Organiza tus ideas, proyectos, objetivos, tareas y recordatorios desde un solo lugar."
    >
      <div className="space-y-5">
        {error ? <div className={theme.alerts.error}>{error}</div> : null}

        <section className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
          <Card className={theme.card.hero}>
            <div className="relative min-h-[320px] p-6 md:p-8">
              <div className={theme.hero.glow} />

              <div className="relative z-10 max-w-3xl">
                <div className={theme.hero.badge}>
                  <Sparkles className="h-4 w-4" />
                  Centro de control
                </div>

                <h2 className={theme.hero.title}>
                  Convierte ideas sueltas en acciones claras.
                </h2>

                <p className={theme.hero.description}>
                  Captura rápido lo que tienes en mente, organízalo por proyecto,
                  define objetivos y baja todo a tareas con fecha.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href={flowRoutes.nuevaIdea}>
                    <Button className={`${theme.button.primaryLarge} w-full sm:w-auto`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Capturar idea
                    </Button>
                  </Link>

                  <Link href={flowRoutes.proyectos}>
                    <Button
                      variant="outline"
                      className={`${theme.button.secondaryLarge} w-full sm:w-auto`}
                    >
                      Ver proyectos
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <Card className={theme.card.base}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={theme.text.kicker}>Proyectos activos</p>
                  <p className="mt-3 text-4xl font-black text-slate-950">
                    {metricas.activos}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <FolderKanban className="h-5 w-5" />
                </div>
              </div>

              <p className={theme.text.body + " mt-4"}>
                Mantén visibles los proyectos que todavía necesitan avance.
              </p>
            </Card>

            <Card className={theme.card.base}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={theme.text.kicker}>Total registrados</p>
                  <p className="mt-3 text-4xl font-black text-slate-950">
                    {metricas.total}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>

              <p className={theme.text.body + " mt-4"}>
                Todo lo que creas queda conectado al flujo de Impulso.
              </p>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            {
              title: "Idea",
              description: "Captura rápido",
              icon: Lightbulb,
              iconClass: "bg-violet-50 text-violet-700 ring-violet-100",
            },
            {
              title: "Proyecto",
              description: "Agrupa por tema",
              icon: FolderKanban,
              iconClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
            },
            {
              title: "Objetivo",
              description: "Define avance",
              icon: Target,
              iconClass: "bg-amber-50 text-amber-700 ring-amber-100",
            },
            {
              title: "Tarea",
              description: "Acción concreta",
              icon: ListTodo,
              iconClass: "bg-sky-50 text-sky-700 ring-sky-100",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className={theme.card.base}>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ${item.iconClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-950">
                      {item.title}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
          <Card className={theme.card.base}>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className={theme.text.kicker}>Proyectos</p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Continúa donde lo dejaste
                </h2>

                <p className={theme.text.body + " mt-2 max-w-2xl"}>
                  Busca un proyecto y entra directo para crear objetivos, tareas
                  o revisar su avance.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className={theme.button.secondary}
                  onClick={() => void loadProyectos()}
                  disabled={loading}
                >
                  <RefreshCcw
                    className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  {loading ? "Actualizando" : "Actualizar"}
                </Button>

                <Link href={flowRoutes.proyectos}>
                  <Button className={`${theme.button.primary} w-full sm:w-auto`}>
                    Ver todos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative mt-5">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar proyecto por nombre, estado o descripción..."
                className={theme.input.search}
              />
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {loading ? (
                [1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-40 animate-pulse rounded-[1.5rem] border border-slate-200 bg-slate-100"
                  />
                ))
              ) : proyectos.length === 0 ? (
                <div className="col-span-full rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                    <Lightbulb className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 text-lg font-black text-slate-950">
                    Todavía no hay proyectos
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-600">
                    Crea una idea y conviértela en proyecto para empezar tu flujo.
                  </p>

                  <Link href={flowRoutes.nuevaIdea} className="mt-4 inline-block">
                    <Button className={theme.button.primary}>
                      Crear nueva idea
                    </Button>
                  </Link>
                </div>
              ) : proyectosFiltrados.length === 0 ? (
                <div className="col-span-full rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <h3 className="text-lg font-black text-slate-950">
                    No se encontraron proyectos
                  </h3>

                  <p className="mt-2 text-sm font-medium text-slate-600">
                    Prueba con otro nombre, estado o palabra de la descripción.
                  </p>
                </div>
              ) : (
                proyectosFiltrados.slice(0, 6).map((proyecto) => (
                  <Link
                    key={proyecto.id}
                    href={`/proyectos/${proyecto.id}`}
                    className="group rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`${theme.badge.base} ${
                          estadoStyles[proyecto.estado]
                        }`}
                      >
                        {capitalizar(proyecto.estado)}
                      </span>

                      <span
                        className={`${theme.badge.base} ${
                          colorStyles[proyecto.color]
                        }`}
                      >
                        {proyecto.color}
                      </span>
                    </div>

                    <h3 className="mt-4 line-clamp-2 text-lg font-black text-slate-950">
                      {proyecto.nombre}
                    </h3>

                    <p className="mt-2 line-clamp-2 min-h-10 text-sm font-medium leading-5 text-slate-600">
                      {proyecto.descripcion || "Sin descripción"}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                      <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Clock3 className="h-4 w-4" />
                        {formatFecha(proyecto.created_at)}
                      </span>

                      <span className="flex items-center gap-2 text-sm font-black text-blue-700">
                        Abrir
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>

          <div className="space-y-4">
            <Card className={theme.card.base}>
              <p className={theme.text.kicker}>Accesos rápidos</p>

              <div className="mt-4 space-y-2">
                {[
                  {
                    href: flowRoutes.nuevaIdea,
                    title: "Nueva idea",
                    icon: Lightbulb,
                    iconClass: "text-amber-600",
                  },
                  {
                    href: flowRoutes.tareas,
                    title: "Ver tareas",
                    icon: ListTodo,
                    iconClass: "text-sky-600",
                  },
                  {
                    href: flowRoutes.calendario,
                    title: "Calendario",
                    icon: CalendarDays,
                    iconClass: "text-emerald-600",
                  },
                  {
                    href: flowRoutes.revisionSemanal,
                    title: "Revisión semanal",
                    icon: RefreshCcw,
                    iconClass: "text-violet-600",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-slate-950 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50"
                    >
                      <span className="flex items-center gap-3 text-sm font-black">
                        <Icon className={`h-5 w-5 ${item.iconClass}`} />
                        {item.title}
                      </span>

                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </Link>
                  );
                })}
              </div>
            </Card>

            <Card className={theme.card.base}>
              <p className={theme.text.kicker}>Últimos proyectos</p>

              <div className="mt-4 space-y-3">
                {loading ? (
                  [1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-14 animate-pulse rounded-2xl bg-slate-100"
                    />
                  ))
                ) : proyectosRecientes.length === 0 ? (
                  <p className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-600">
                    Aún no hay proyectos recientes.
                  </p>
                ) : (
                  proyectosRecientes.map((proyecto) => (
                    <Link
                      key={proyecto.id}
                      href={`/proyectos/${proyecto.id}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-950">
                          {proyecto.nombre}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {capitalizar(proyecto.estado)}
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
                    </Link>
                  ))
                )}
              </div>
            </Card>
          </div>
        </section>
      </div>
    </AppShell>
  );
}