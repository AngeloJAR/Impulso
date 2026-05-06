"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  FolderKanban,
  ListTodo,
  Plus,
  RefreshCcw,
  Search,
  Target,
} from "lucide-react";

import {
  getProyectoDetalle,
  type ProyectoDetalleData,
  type ProyectoObjetivoResumen,
  type ProyectoTareaResumen,
} from "@/features/proyectos/project-detail-queries";
import { flowRoutes } from "@/config/app";
import { theme } from "@/config/theme";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const emptyData: ProyectoDetalleData = {
  proyecto: null,
  objetivos: [],
  tareas: [],
  metricas: {
    objetivosActivos: 0,
    objetivosCompletados: 0,
    tareasPendientes: 0,
    tareasTerminadas: 0,
  },
};

const estadoObjetivoStyles: Record<ProyectoObjetivoResumen["estado"], string> = {
  activo: theme.states.objetivo.activo,
  pausado: theme.states.objetivo.pausado,
  completado: theme.states.objetivo.completado,
  abandonado: theme.states.objetivo.abandonado,
};

const prioridadTareaStyles: Record<ProyectoTareaResumen["prioridad"], string> = {
  baja: theme.states.prioridad.baja,
  media: theme.states.prioridad.media,
  alta: theme.states.prioridad.alta,
};

const estadoTareaStyles: Record<ProyectoTareaResumen["estado"], string> = {
  pendiente: theme.states.tarea.pendiente,
  hoy: theme.states.tarea.hoy,
  en_proceso: theme.states.tarea.en_proceso,
  bloqueada: theme.states.tarea.bloqueada,
  terminada: theme.states.tarea.terminada,
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
  const clean = value.replaceAll("_", " ");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function clampProgreso(value?: number | null) {
  const progreso = Number(value ?? 0);

  if (!Number.isFinite(progreso)) return 0;
  if (progreso < 0) return 0;
  if (progreso > 100) return 100;

  return progreso;
}

export default function ProyectoDetallePage() {
  const params = useParams<{ id: string }>();
  const proyectoId = params.id;

  const [data, setData] = useState<ProyectoDetalleData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadProyecto = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getProyectoDetalle(proyectoId);
      setData(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar el proyecto.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [proyectoId]);
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProyecto();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadProyecto]);

  const proyecto = data.proyecto;

  const tareasPorObjetivo = useMemo(() => {
    return data.objetivos.map((objetivo) => ({
      objetivo,
      tareas: data.tareas.filter((tarea) => tarea.objetivo_id === objetivo.id),
    }));
  }, [data.objetivos, data.tareas]);

  const tareasSinObjetivo = useMemo(() => {
    return data.tareas.filter((tarea) => !tarea.objetivo_id);
  }, [data.tareas]);

  const tareasPendientes = useMemo(() => {
    return data.tareas.filter((tarea) => tarea.estado !== "terminada");
  }, [data.tareas]);

  const tareasTerminadas = useMemo(() => {
    return data.tareas.filter((tarea) => tarea.estado === "terminada");
  }, [data.tareas]);

  const objetivosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return tareasPorObjetivo;

    return tareasPorObjetivo.filter(({ objetivo, tareas }) => {
      const coincideObjetivo =
        objetivo.titulo.toLowerCase().includes(term) ||
        objetivo.descripcion?.toLowerCase().includes(term) ||
        objetivo.estado.toLowerCase().includes(term);

      const coincideTarea = tareas.some((tarea) => {
        return (
          tarea.titulo.toLowerCase().includes(term) ||
          tarea.estado.toLowerCase().includes(term) ||
          tarea.prioridad.toLowerCase().includes(term)
        );
      });

      return coincideObjetivo || coincideTarea;
    });
  }, [search, tareasPorObjetivo]);

  const progresoGeneral = useMemo(() => {
    if (data.tareas.length === 0) return 0;

    return Math.round((tareasTerminadas.length / data.tareas.length) * 100);
  }, [data.tareas.length, tareasTerminadas.length]);

  return (
    <AppShell
      title={proyecto ? proyecto.nombre : "Proyecto"}
      description="Detalle del proyecto, objetivos y tareas asociadas."
    >
      <div className="space-y-5">
        {error ? <div className={theme.alerts.error}>{error}</div> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href={flowRoutes.proyectos}>
            <Button variant="outline" className={theme.button.secondary}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a proyectos
            </Button>
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className={theme.button.secondary}
              onClick={() => void loadProyecto()}
              disabled={loading}
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Actualizando" : "Actualizar"}
            </Button>

            <Link href={`/objetivos?proyectoId=${proyectoId}#crear-objetivo`}>
              <Button className={theme.button.primary}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo objetivo
              </Button>
            </Link>

            <Button
              variant="outline"
              className={theme.button.secondary}
              disabled
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>

        {loading ? (
          <Card className={theme.card.base}>
            <div className="space-y-4">
              <div className="h-8 w-2/3 animate-pulse rounded-full bg-slate-100" />
              <div className="h-24 animate-pulse rounded-[1.5rem] bg-slate-100" />
              <div className="grid gap-3 md:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-28 animate-pulse rounded-[1.5rem] bg-slate-100"
                  />
                ))}
              </div>
            </div>
          </Card>
        ) : !proyecto ? (
          <Card className={theme.card.base}>
            <div className={theme.card.empty}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                <FolderKanban className="h-6 w-6" />
              </div>

              <h2 className="mt-4 text-xl font-black text-slate-950">
                Proyecto no encontrado
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-600">
                Puede que no exista, que haya sido eliminado o que no pertenezca a tu usuario.
              </p>

              <Link href={flowRoutes.proyectos} className="mt-5 inline-block">
                <Button className={theme.button.primary}>
                  Ir a proyectos
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <>
            <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
              <Card className={theme.card.hero}>
                <div className={theme.hero.wrapper}>
                  <div className={theme.hero.glow} />

                  <div className={theme.hero.content}>
                    <div className={theme.hero.badge}>
                      <FolderKanban className="h-4 w-4" />
                      Proyecto
                    </div>

                    <h2 className={theme.hero.title}>{proyecto.nombre}</h2>

                    <p className={theme.hero.description}>
                      {proyecto.descripcion ||
                        "Este proyecto todavía no tiene descripción."}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <span className={`${theme.badge.base} ${theme.badge.emerald}`}>
                        {capitalizar(proyecto.estado)}
                      </span>

                      <span className={`${theme.badge.base} ${theme.badge.slate}`}>
                        Creado: {formatFecha(proyecto.created_at)}
                      </span>
                    </div>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                      <Link href={`/objetivos?proyectoId=${proyectoId}#crear-objetivo`}>
                        <Button className={theme.button.primaryLarge}>
                          <Plus className="mr-2 h-4 w-4" />
                          Nuevo objetivo
                        </Button>
                      </Link>

                      <Link href={`/tareas?proyectoId=${proyectoId}#crear-tarea`}>
                        <Button variant="outline" className={theme.button.secondaryLarge}>
                          <ListTodo className="mr-2 h-4 w-4" />
                          Nueva tarea
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className={theme.card.base}>
                <p className={theme.text.kicker}>Avance general</p>

                <div className="mt-5">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-5xl font-black text-slate-950">
                        {progresoGeneral}%
                      </p>
                      <p className={`${theme.text.body} mt-2`}>
                        Basado en tareas terminadas
                      </p>
                    </div>

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  </div>

                  <div className={`${theme.progress.track} mt-5`}>
                    <div
                      className={theme.progress.bar}
                      style={{ width: `${progresoGeneral}%` }}
                    />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-2xl font-black text-slate-950">
                        {tareasPendientes.length}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        Pendientes
                      </p>
                    </div>

                    <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-2xl font-black text-slate-950">
                        {tareasTerminadas.length}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        Terminadas
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Objetivos activos",
                  value: data.metricas.objetivosActivos,
                  icon: Target,
                  iconClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
                },
                {
                  title: "Objetivos completados",
                  value: data.metricas.objetivosCompletados,
                  icon: CheckCircle2,
                  iconClass: "bg-sky-50 text-sky-700 ring-sky-100",
                },
                {
                  title: "Tareas pendientes",
                  value: data.metricas.tareasPendientes,
                  icon: ListTodo,
                  iconClass: "bg-amber-50 text-amber-700 ring-amber-100",
                },
                {
                  title: "Tareas terminadas",
                  value: data.metricas.tareasTerminadas,
                  icon: CheckCircle2,
                  iconClass: "bg-violet-50 text-violet-700 ring-violet-100",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <Card key={item.title} className={theme.card.base}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className={theme.text.kicker}>{item.title}</p>

                        <p className="mt-3 text-4xl font-black text-slate-950">
                          {item.value}
                        </p>
                      </div>

                      <div className={`rounded-2xl p-3 ring-1 ${item.iconClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </section>

            <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
              <Card className={theme.card.base}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className={theme.text.kicker}>Trabajo del proyecto</p>

                    <h2 className="mt-2 text-2xl font-black text-slate-950">
                      Objetivos y tareas
                    </h2>

                    <p className={`${theme.text.body} mt-2 max-w-2xl`}>
                      Cada objetivo agrupa sus tareas. Desde aquí puedes crear la
                      siguiente acción sin salir del flujo.
                    </p>
                  </div>

                  <div className="relative w-full lg:w-[320px]">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Buscar objetivo o tarea..."
                      className={theme.input.search}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  {data.objetivos.length === 0 ? (
                    <div className={theme.card.empty}>
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                        <Target className="h-6 w-6" />
                      </div>

                      <h3 className="mt-4 text-xl font-black text-slate-950">
                        Este proyecto todavía no tiene objetivos
                      </h3>

                      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-600">
                        Crea un objetivo para darle dirección al proyecto y luego
                        agrega tareas.
                      </p>

                      <Link
                        href={`/objetivos?proyectoId=${proyectoId}#crear-objetivo`}
                        className="mt-5 inline-block"
                      >
                        <Button className={theme.button.primary}>
                          <Plus className="mr-2 h-4 w-4" />
                          Crear primer objetivo
                        </Button>
                      </Link>
                    </div>
                  ) : objetivosFiltrados.length === 0 ? (
                    <div className={theme.card.empty}>
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                        <Search className="h-6 w-6" />
                      </div>

                      <h3 className="mt-4 text-xl font-black text-slate-950">
                        No se encontraron resultados
                      </h3>

                      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-600">
                        Cambia la búsqueda para ver otros objetivos o tareas.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {objetivosFiltrados.map(({ objetivo, tareas }) => {
                        const progreso = clampProgreso(objetivo.progreso);

                        return (
                          <div
                            key={objetivo.id}
                            className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-5"
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap gap-2">
                                  <span
                                    className={`${theme.badge.base} ${estadoObjetivoStyles[objetivo.estado]
                                      }`}
                                  >
                                    {capitalizar(objetivo.estado)}
                                  </span>

                                  <span className={`${theme.badge.base} ${theme.badge.slate}`}>
                                    {formatFecha(objetivo.fecha_inicio)} -{" "}
                                    {formatFecha(objetivo.fecha_limite)}
                                  </span>
                                </div>

                                <h3 className="mt-4 text-xl font-black text-slate-950">
                                  {objetivo.titulo}
                                </h3>

                                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                                  {objetivo.descripcion || "Sin descripción"}
                                </p>
                              </div>

                              <Link
                                href={`/tareas?proyectoId=${proyectoId}&objetivoId=${objetivo.id}#crear-tarea`}
                              >
                                <Button variant="outline" className={theme.button.secondary}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Nueva tarea
                                </Button>
                              </Link>
                            </div>

                            <div className="mt-5">
                              <div className="mb-2 flex items-center justify-between text-xs font-black">
                                <span className="text-slate-500">Progreso</span>
                                <span className="text-slate-950">{progreso}%</span>
                              </div>

                              <div className={theme.progress.trackSmall}>
                                <div
                                  className={theme.progress.barSmall}
                                  style={{ width: `${progreso}%` }}
                                />
                              </div>
                            </div>

                            <div className="mt-5 grid gap-2">
                              {tareas.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-center">
                                  <p className="text-sm font-medium text-slate-600">
                                    Sin tareas para este objetivo.
                                  </p>

                                  <Link
                                    href={`/tareas?proyectoId=${proyectoId}&objetivoId=${objetivo.id}#crear-tarea`}
                                    className="mt-3 inline-block"
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className={theme.button.secondary}
                                    >
                                      <Plus className="mr-2 h-4 w-4" />
                                      Crear tarea
                                    </Button>
                                  </Link>
                                </div>
                              ) : (
                                tareas.slice(0, 4).map((tarea) => (
                                  <Link
                                    key={tarea.id}
                                    href={`/tareas?proyectoId=${proyectoId}&objetivoId=${objetivo.id}`}
                                    className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40"
                                  >
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                      <div className="min-w-0">
                                        <div className="flex flex-wrap gap-2">
                                          <span
                                            className={`${theme.badge.base} ${prioridadTareaStyles[tarea.prioridad]
                                              }`}
                                          >
                                            {capitalizar(tarea.prioridad)}
                                          </span>

                                          <span
                                            className={`${theme.badge.base} ${estadoTareaStyles[tarea.estado]
                                              }`}
                                          >
                                            {capitalizar(tarea.estado)}
                                          </span>
                                        </div>

                                        <p className="mt-2 text-sm font-black text-slate-950">
                                          {tarea.titulo}
                                        </p>
                                      </div>

                                      <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
                                    </div>
                                  </Link>
                                ))
                              )}

                              {tareas.length > 4 ? (
                                <Link
                                  href={`/tareas?proyectoId=${proyectoId}&objetivoId=${objetivo.id}`}
                                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-black text-blue-700 shadow-sm transition hover:bg-blue-50"
                                >
                                  Ver {tareas.length - 4} tareas más
                                </Link>
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>

              <div className="grid h-fit gap-5">
                <Card className={theme.card.base}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
                      <ListTodo className="h-5 w-5" />
                    </div>

                    <div>
                      <p className={theme.text.kicker}>Acciones</p>

                      <h2 className="mt-2 text-xl font-black text-slate-950">
                        Tareas recientes
                      </h2>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {data.tareas.length === 0 ? (
                      <div className={theme.card.empty}>
                        <p className="text-sm font-medium text-slate-600">
                          Sin tareas todavía.
                        </p>
                      </div>
                    ) : (
                      data.tareas.slice(0, 8).map((tarea) => (
                        <div
                          key={tarea.id}
                          className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="mb-2 flex flex-wrap gap-2">
                            <span
                              className={`${theme.badge.base} ${prioridadTareaStyles[tarea.prioridad]
                                }`}
                            >
                              {capitalizar(tarea.prioridad)}
                            </span>

                            <span
                              className={`${theme.badge.base} ${estadoTareaStyles[tarea.estado]
                                }`}
                            >
                              {capitalizar(tarea.estado)}
                            </span>
                          </div>

                          <p className="text-sm font-black text-slate-950">
                            {tarea.titulo}
                          </p>

                          <div className="mt-3 grid gap-1 text-xs font-bold text-slate-500">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-3.5 w-3.5" />
                              Inicio: {formatFecha(tarea.fecha_inicio || tarea.fecha)}
                            </div>

                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-3.5 w-3.5" />
                              Fin: {formatFecha(tarea.fecha_limite || tarea.fecha)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </Card>

                <Card className={theme.card.base}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                      <Clock3 className="h-5 w-5" />
                    </div>

                    <div>
                      <p className={theme.text.kicker}>Calendario</p>

                      <h2 className="mt-2 text-xl font-black text-slate-950">
                        Fechas y recordatorios
                      </h2>
                    </div>
                  </div>

                  <p className={`${theme.text.body} mt-5`}>
                    Las tareas con fecha o recordatorio se muestran en el calendario.
                  </p>

                  <Link href="/calendario" className="mt-5 block">
                    <Button variant="outline" className={`${theme.button.secondary} w-full`}>
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Ver calendario
                    </Button>
                  </Link>
                </Card>

                {tareasSinObjetivo.length > 0 ? (
                  <Card className={theme.card.base}>
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                        <ListTodo className="h-5 w-5" />
                      </div>

                      <div>
                        <p className={theme.text.kicker}>Sin objetivo</p>

                        <h2 className="mt-2 text-xl font-black text-slate-950">
                          Tareas sueltas
                        </h2>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3">
                      {tareasSinObjetivo.map((tarea) => (
                        <div
                          key={tarea.id}
                          className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <p className="text-sm font-black text-slate-950">
                            {tarea.titulo}
                          </p>

                          <p className="mt-2 text-xs font-bold text-slate-500">
                            {capitalizar(tarea.estado)} ·{" "}
                            {formatFecha(tarea.fecha_inicio || tarea.fecha)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : null}
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}