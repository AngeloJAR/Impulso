"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  FolderKanban,
  ListTodo,
  Plus,
  Target,
} from "lucide-react";

import {
  getProyectoDetalle,
  type ProyectoDetalleData,
  type ProyectoObjetivoResumen,
  type ProyectoTareaResumen,
} from "@/features/proyectos/project-detail-queries";
import { flowRoutes } from "@/config/app";
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
  activo: "bg-emerald-300/20 text-emerald-100 ring-emerald-200/20",
  pausado: "bg-amber-300/20 text-amber-100 ring-amber-200/20",
  completado: "bg-sky-300/20 text-sky-100 ring-sky-200/20",
  abandonado: "bg-slate-300/15 text-slate-200 ring-white/10",
};

const prioridadTareaStyles: Record<ProyectoTareaResumen["prioridad"], string> = {
  baja: "bg-slate-300/15 text-slate-200 ring-white/10",
  media: "bg-amber-300/20 text-amber-100 ring-amber-200/20",
  alta: "bg-rose-300/20 text-rose-100 ring-rose-200/20",
};

const estadoTareaStyles: Record<ProyectoTareaResumen["estado"], string> = {
  pendiente: "bg-slate-300/15 text-slate-200 ring-white/10",
  hoy: "bg-sky-300/20 text-sky-100 ring-sky-200/20",
  en_proceso: "bg-violet-300/20 text-violet-100 ring-violet-200/20",
  bloqueada: "bg-rose-300/20 text-rose-100 ring-rose-200/20",
  terminada: "bg-emerald-300/20 text-emerald-100 ring-emerald-200/20",
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

export default function ProyectoDetallePage() {
  const params = useParams<{ id: string }>();
  const proyectoId = params.id;

  const [data, setData] = useState<ProyectoDetalleData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProyecto() {
    setLoading(true);
    setError("");

    try {
      const result = await getProyectoDetalle(proyectoId);
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo cargar el proyecto.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProyecto();
  }, [proyectoId]);

  const tareasPorObjetivo = useMemo(() => {
    return data.objetivos.map((objetivo) => ({
      objetivo,
      tareas: data.tareas.filter((tarea) => tarea.objetivo_id === objetivo.id),
    }));
  }, [data.objetivos, data.tareas]);

  const tareasSinObjetivo = useMemo(() => {
    return data.tareas.filter((tarea) => !tarea.objetivo_id);
  }, [data.tareas]);

  const proyecto = data.proyecto;

  return (
    <AppShell
      title={proyecto ? proyecto.nombre : "Proyecto"}
      description="Detalle del proyecto, objetivos y tareas asociadas."
    >
      <div className="grid gap-6 text-white">
        {error ? (
          <div className="rounded-2xl border border-red-300/30 bg-red-500/15 px-4 py-3 text-sm font-medium text-red-100 backdrop-blur-xl">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href={flowRoutes.dashboard}>
            <Button
              variant="outline"
              className="rounded-2xl border-white/15 bg-white/10 text-white shadow-sm backdrop-blur-xl hover:bg-white/15"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al dashboard
            </Button>
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={`/objetivos?proyectoId=${proyectoId}#crear-objetivo`}>
              <Button className="rounded-2xl bg-white text-slate-950 shadow-sm hover:bg-slate-100">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo objetivo
              </Button>
            </Link>

            <Button
              variant="outline"
              className="rounded-2xl border-white/15 bg-white/10 text-white shadow-sm backdrop-blur-xl hover:bg-white/15 disabled:opacity-50"
              disabled
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Editar proyecto
            </Button>
          </div>
        </div>

        {loading ? (
          <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
            <p className="text-sm font-medium text-slate-300">Cargando proyecto...</p>
          </Card>
        ) : !proyecto ? (
          <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
            <div className="rounded-3xl border border-dashed border-white/20 bg-white/10 p-6 text-center backdrop-blur-xl">
              <FolderKanban className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              <p className="font-semibold text-white">Proyecto no encontrado</p>
              <p className="mt-1 text-sm text-slate-300">
                Puede que no exista o no pertenezca a tu usuario.
              </p>
            </div>
          </Card>
        ) : (
          <>
            <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/48 shadow-[0_24px_90px_rgba(2,6,23,0.35)] backdrop-blur-2xl">
              <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_340px] md:p-8">
                <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-sky-400/20 blur-3xl" />

                <div className="relative">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-100 shadow-sm backdrop-blur-xl">
                    <FolderKanban className="h-4 w-4 text-sky-200" />
                    Proyecto activo
                  </div>

                  <h2 className="max-w-2xl text-3xl font-black tracking-tight text-white drop-shadow-sm md:text-4xl">
                    {proyecto.nombre}
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
                    {proyecto.descripcion || "Este proyecto todavía no tiene descripción."}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100 backdrop-blur-xl">
                      Estado: {proyecto.estado}
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-100 backdrop-blur-xl">
                      Creado: {formatFecha(proyecto.created_at)}
                    </span>
                  </div>
                </div>

                <Card className="relative rounded-[2rem] border-white/10 bg-slate-950/72 p-6 text-white shadow-[0_18px_70px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
                  <p className="text-sm font-semibold text-slate-300">Flujo del proyecto</p>

                  <h3 className="mt-2 text-2xl font-black text-white">
                    Objetivos → Tareas → Calendario
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Este proyecto debe avanzar por objetivos claros. Cada objetivo puede tener
                    tareas y las tareas con fecha aparecen en el calendario.
                  </p>
                </Card>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Objetivos activos",
                  value: data.metricas.objetivosActivos,
                  icon: Target,
                },
                {
                  title: "Objetivos completados",
                  value: data.metricas.objetivosCompletados,
                  icon: CheckCircle2,
                },
                {
                  title: "Tareas pendientes",
                  value: data.metricas.tareasPendientes,
                  icon: ListTodo,
                },
                {
                  title: "Tareas terminadas",
                  value: data.metricas.tareasTerminadas,
                  icon: CheckCircle2,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <Card
                    key={item.title}
                    className="rounded-[1.75rem] border-white/10 bg-white/10 p-5 text-white shadow-[0_18px_70px_rgba(2,6,23,0.18)] backdrop-blur-2xl"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-300">{item.title}</p>

                        <p className="mt-3 text-4xl font-black text-white">{item.value}</p>
                      </div>

                      <div className="rounded-2xl bg-white/15 p-3 text-slate-100 ring-1 ring-white/10">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </section>

            <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
              <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-black text-white">Objetivos del proyecto</h2>

                    <p className="mt-1 text-sm text-slate-300">
                      Cada objetivo puede tener sus propias tareas asociadas.
                    </p>
                  </div>

                  <Link href={`/objetivos?proyectoId=${proyectoId}#crear-objetivo`}>
                    <Button
                      size="sm"
                      className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Nuevo objetivo
                    </Button>
                  </Link>
                </div>

                {data.objetivos.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/20 bg-white/10 p-6 text-center backdrop-blur-xl">
                    <Target className="mx-auto mb-3 h-8 w-8 text-slate-300" />

                    <p className="font-semibold text-white">No hay objetivos en este proyecto</p>

                    <p className="mt-1 text-sm text-slate-300">
                      Crea un objetivo para este proyecto y luego agrega sus tareas.
                    </p>

                    <Link
                      href={`/objetivos?proyectoId=${proyectoId}#crear-objetivo`}
                      className="mt-4 inline-flex"
                    >
                      <Button className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100">
                        <Plus className="mr-2 h-4 w-4" />
                        Crear primer objetivo
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {tareasPorObjetivo.map(({ objetivo, tareas }) => (
                      <div
                        key={objetivo.id}
                        className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-sm backdrop-blur-xl"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                                  estadoObjetivoStyles[objetivo.estado]
                                }`}
                              >
                                {objetivo.estado}
                              </span>

                              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200 shadow-sm backdrop-blur-xl">
                                {formatFecha(objetivo.fecha_inicio)} -{" "}
                                {formatFecha(objetivo.fecha_limite)}
                              </span>
                            </div>

                            <h3 className="font-black text-white">{objetivo.titulo}</h3>

                            {objetivo.descripcion ? (
                              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-300">
                                {objetivo.descripcion}
                              </p>
                            ) : (
                              <p className="mt-1 text-sm text-slate-400">Sin descripción</p>
                            )}
                          </div>

                          <Link
                            href={`/tareas?proyectoId=${proyectoId}&objetivoId=${objetivo.id}#crear-tarea`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-2xl border-white/15 bg-white/10 text-white backdrop-blur-xl hover:bg-white/15"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Nueva tarea
                            </Button>
                          </Link>
                        </div>

                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-300">Progreso</span>

                            <span className="font-black text-white">{objetivo.progreso}%</span>
                          </div>

                          <div className="h-3 rounded-full bg-white/10 ring-1 ring-white/10">
                            <div
                              className="h-3 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.35)]"
                              style={{ width: `${objetivo.progreso}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2">
                          {tareas.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-white/20 bg-white/10 p-3 text-center backdrop-blur-xl">
                              <p className="text-xs text-slate-300">
                                Sin tareas para este objetivo.
                              </p>

                              <Link
                                href={`/tareas?proyectoId=${proyectoId}&objetivoId=${objetivo.id}#crear-tarea`}
                                className="mt-3 inline-flex"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="rounded-2xl border-white/15 bg-white/10 text-white hover:bg-white/15"
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Crear tarea
                                </Button>
                              </Link>
                            </div>
                          ) : (
                            tareas.slice(0, 3).map((tarea) => (
                              <div
                                key={tarea.id}
                                className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl"
                              >
                                <div className="mb-1 flex flex-wrap gap-2">
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                                      prioridadTareaStyles[tarea.prioridad]
                                    }`}
                                  >
                                    {tarea.prioridad}
                                  </span>

                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                                      estadoTareaStyles[tarea.estado]
                                    }`}
                                  >
                                    {tarea.estado}
                                  </span>
                                </div>

                                <p className="text-sm font-semibold text-white">{tarea.titulo}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <div className="grid gap-6">
                <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-2xl bg-violet-300/20 p-3 text-violet-100 ring-1 ring-violet-200/20">
                      <ListTodo className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-lg font-black text-white">Tareas del proyecto</h2>

                      <p className="text-sm text-slate-300">Resumen de acciones.</p>
                    </div>
                  </div>

                  {data.tareas.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/20 bg-white/10 p-5 text-center backdrop-blur-xl">
                      <p className="text-sm font-semibold text-slate-200">Sin tareas</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {data.tareas.slice(0, 8).map((tarea) => (
                        <div
                          key={tarea.id}
                          className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl"
                        >
                          <div className="mb-2 flex flex-wrap gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                                prioridadTareaStyles[tarea.prioridad]
                              }`}
                            >
                              {tarea.prioridad}
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${
                                estadoTareaStyles[tarea.estado]
                              }`}
                            >
                              {tarea.estado}
                            </span>
                          </div>

                          <p className="text-sm font-semibold text-white">{tarea.titulo}</p>

                          <div className="mt-2 grid gap-1 text-xs font-medium text-slate-300">
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
                      ))}
                    </div>
                  )}
                </Card>

                <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-2xl bg-amber-300/20 p-3 text-amber-100 ring-1 ring-amber-200/20">
                      <Clock3 className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-lg font-black text-white">Calendario</h2>

                      <p className="text-sm text-slate-300">
                        Las tareas con fecha o recordatorio se muestran en el calendario.
                      </p>
                    </div>
                  </div>

                  <Link href="/calendario">
                    <Button
                      variant="outline"
                      className="w-full rounded-2xl border-white/15 bg-white/10 text-white backdrop-blur-xl hover:bg-white/15"
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Ver calendario
                    </Button>
                  </Link>
                </Card>

                {tareasSinObjetivo.length > 0 ? (
                  <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
                    <h2 className="text-lg font-black text-white">Tareas sin objetivo</h2>

                    <p className="mt-1 text-sm text-slate-300">
                      Estas tareas pertenecen al proyecto, pero no están asociadas a un objetivo.
                    </p>

                    <div className="mt-5 grid gap-3">
                      {tareasSinObjetivo.map((tarea) => (
                        <div
                          key={tarea.id}
                          className="rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl"
                        >
                          <p className="text-sm font-semibold text-white">{tarea.titulo}</p>

                          <div className="mt-2 grid gap-1 text-xs font-medium text-slate-300">
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
