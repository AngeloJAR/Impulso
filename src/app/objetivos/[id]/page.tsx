"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
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
  getObjetivoDetalle,
  type ObjetivoDetalleData,
  type ObjetivoDetalleTarea,
} from "@/features/objetivos/objective-detail-queries";
import { actualizarProgresoObjetivo } from "@/features/objetivos/actions";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const emptyData: ObjetivoDetalleData = {
  objetivo: null,
  tareas: [],
  metricas: {
    totalTareas: 0,
    tareasPendientes: 0,
    tareasTerminadas: 0,
    progresoCalculado: 0,
  },
};

const estadoObjetivoStyles = {
  activo: "bg-emerald-300/20 text-emerald-100 ring-emerald-200/20",
  pausado: "bg-amber-300/20 text-amber-100 ring-amber-200/20",
  completado: "bg-sky-300/20 text-sky-100 ring-sky-200/20",
  abandonado: "bg-slate-300/15 text-slate-200 ring-white/10",
};

const prioridadTareaStyles: Record<ObjetivoDetalleTarea["prioridad"], string> = {
  baja: "bg-slate-300/15 text-slate-200 ring-white/10",
  media: "bg-amber-300/20 text-amber-100 ring-amber-200/20",
  alta: "bg-rose-300/20 text-rose-100 ring-rose-200/20",
};

const estadoTareaStyles: Record<ObjetivoDetalleTarea["estado"], string> = {
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

export default function ObjetivoDetallePage() {
  const params = useParams<{ id: string }>();
  const objetivoId = params.id;

  const [data, setData] = useState<ObjetivoDetalleData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [isPending, startTransition] = useTransition();

  async function loadObjetivo() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await getObjetivoDetalle(objetivoId);
      setData(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar el objetivo.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadObjetivo();
  }, [objetivoId]);

  function handleActualizarProgreso() {
    setError("");
    setMessage("");

    startTransition(async () => {
      try {
        const result = await actualizarProgresoObjetivo(objetivoId);

        setMessage(
          `Progreso actualizado: ${result.progreso}% (${result.tareasTerminadas}/${result.totalTareas} tareas terminadas).`
        );

        await loadObjetivo();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo actualizar el progreso.";

        setError(message);
      }
    });
  }

  const tareasPorEstado = useMemo(() => {
    return {
      pendiente: data.tareas.filter((tarea) => tarea.estado === "pendiente"),
      hoy: data.tareas.filter((tarea) => tarea.estado === "hoy"),
      en_proceso: data.tareas.filter((tarea) => tarea.estado === "en_proceso"),
      bloqueada: data.tareas.filter((tarea) => tarea.estado === "bloqueada"),
      terminada: data.tareas.filter((tarea) => tarea.estado === "terminada"),
    };
  }, [data.tareas]);

  const objetivo = data.objetivo;
  const proyectoHref = objetivo?.proyecto_id
    ? `/proyectos/${objetivo.proyecto_id}`
    : "/";

  return (
    <AppShell
      title={objetivo ? objetivo.titulo : "Objetivo"}
      description="Detalle del objetivo y sus tareas asociadas."
    >
      <div className="grid gap-6 text-white">
        {error ? (
          <div className="rounded-2xl border border-red-300/30 bg-red-500/15 px-4 py-3 text-sm font-medium text-red-100 backdrop-blur-xl">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-2xl border border-emerald-300/30 bg-emerald-500/15 px-4 py-3 text-sm font-medium text-emerald-100 backdrop-blur-xl">
            {message}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href={proyectoHref}>
            <Button
              variant="outline"
              className="rounded-2xl border-white/15 bg-white/10 text-white shadow-sm backdrop-blur-xl hover:bg-white/15"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al proyecto
            </Button>
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link href={`/tareas?objetivoId=${objetivoId}#crear-tarea`}>
              <Button className="rounded-2xl bg-white text-slate-950 shadow-sm hover:bg-slate-100">
                <Plus className="mr-2 h-4 w-4" />
                Nueva tarea
              </Button>
            </Link>

            <Button
              variant="outline"
              className="rounded-2xl border-white/15 bg-white/10 text-white shadow-sm backdrop-blur-xl hover:bg-white/15 disabled:opacity-50"
              disabled
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Editar objetivo
            </Button>
          </div>
        </div>

        {loading ? (
          <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
            <p className="text-sm font-medium text-slate-300">
              Cargando objetivo...
            </p>
          </Card>
        ) : !objetivo ? (
          <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
            <div className="rounded-3xl border border-dashed border-white/20 bg-white/10 p-6 text-center backdrop-blur-xl">
              <Target className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              <p className="font-semibold text-white">Objetivo no encontrado</p>
              <p className="mt-1 text-sm text-slate-300">
                Puede que no exista o no pertenezca a tu usuario.
              </p>
            </div>
          </Card>
        ) : (
          <>
            <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/48 shadow-[0_24px_90px_rgba(2,6,23,0.35)] backdrop-blur-2xl">
              <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_340px] md:p-8">
                <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />

                <div className="relative">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-300/15 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-sm backdrop-blur-xl">
                    <Target className="h-4 w-4" />
                    Objetivo
                  </div>

                  <h2 className="max-w-2xl text-3xl font-black tracking-tight text-white drop-shadow-sm md:text-4xl">
                    {objetivo.titulo}
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
                    {objetivo.descripcion ||
                      "Este objetivo todavía no tiene descripción."}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                        estadoObjetivoStyles[objetivo.estado]
                      }`}
                    >
                      {objetivo.estado}
                    </span>

                    {objetivo.proyecto ? (
                      <Link href={`/proyectos/${objetivo.proyecto.id}`}>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/20 bg-sky-300/15 px-3 py-1 text-xs font-semibold text-sky-100 backdrop-blur-xl">
                          <FolderKanban className="h-3.5 w-3.5" />
                          {objetivo.proyecto.nombre}
                        </span>
                      </Link>
                    ) : (
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300 backdrop-blur-xl">
                        Sin proyecto
                      </span>
                    )}

                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200 shadow-sm backdrop-blur-xl">
                      {formatFecha(objetivo.fecha_inicio)} -{" "}
                      {formatFecha(objetivo.fecha_limite)}
                    </span>
                  </div>
                </div>

                <Card className="relative rounded-[2rem] border-white/10 bg-slate-950/72 p-6 text-white shadow-[0_18px_70px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
                  <p className="text-sm font-semibold text-slate-300">
                    Progreso calculado
                  </p>

                  <h3 className="mt-2 text-5xl font-black text-white">
                    {data.metricas.progresoCalculado}%
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    Calculado usando tareas terminadas sobre el total de tareas
                    del objetivo.
                  </p>

                  <div className="mt-6 h-3 rounded-full bg-white/10 ring-1 ring-white/10">
                    <div
                      className="h-3 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.35)]"
                      style={{
                        width: `${data.metricas.progresoCalculado}%`,
                      }}
                    />
                  </div>
                </Card>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Total tareas",
                  value: data.metricas.totalTareas,
                  icon: ListTodo,
                },
                {
                  title: "Pendientes",
                  value: data.metricas.tareasPendientes,
                  icon: Clock3,
                },
                {
                  title: "Terminadas",
                  value: data.metricas.tareasTerminadas,
                  icon: CheckCircle2,
                },
                {
                  title: "Progreso",
                  value: `${data.metricas.progresoCalculado}%`,
                  icon: Target,
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
                        <p className="text-sm font-semibold text-slate-300">
                          {item.title}
                        </p>
                        <p className="mt-3 text-4xl font-black text-white">
                          {item.value}
                        </p>
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
                <div className="mb-5">
                  <h2 className="text-xl font-black text-white">
                    Tareas del objetivo
                  </h2>
                  <p className="mt-1 text-sm text-slate-300">
                    Acciones concretas que hacen avanzar este objetivo.
                  </p>
                </div>

                {data.tareas.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-white/20 bg-white/10 p-6 text-center backdrop-blur-xl">
                    <ListTodo className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                    <p className="font-semibold text-white">
                      No hay tareas asociadas
                    </p>
                    <p className="mt-1 text-sm text-slate-300">
                      Las tareas que crees dentro del flujo lineal aparecerán
                      aquí.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 xl:grid-cols-2">
                    {data.tareas.map((tarea) => (
                      <div
                        key={tarea.id}
                        className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                      >
                        <div className="mb-2 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                              prioridadTareaStyles[tarea.prioridad]
                            }`}
                          >
                            {tarea.prioridad}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                              estadoTareaStyles[tarea.estado]
                            }`}
                          >
                            {tarea.estado}
                          </span>
                        </div>

                        <h3 className="font-black text-white">{tarea.titulo}</h3>

                        {tarea.descripcion ? (
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-300">
                            {tarea.descripcion}
                          </p>
                        ) : (
                          <p className="mt-1 text-sm text-slate-400">
                            Sin descripción
                          </p>
                        )}

                        <div className="mt-4 grid gap-2 text-xs font-medium text-slate-300">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Inicio:{" "}
                            {formatFecha(tarea.fecha_inicio || tarea.fecha)}
                          </div>

                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Fin: {formatFecha(tarea.fecha_limite || tarea.fecha)}
                          </div>

                          <div className="flex items-center gap-2">
                            <Clock3 className="h-3.5 w-3.5" />
                            Recordatorio: {formatFecha(tarea.recordatorio)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <div className="grid gap-6">
                <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="rounded-2xl bg-emerald-300/20 p-3 text-emerald-100 ring-1 ring-emerald-200/20">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-lg font-black text-white">
                        Progreso real
                      </h2>
                      <p className="text-sm text-slate-300">
                        Basado en tareas terminadas.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                    <p className="text-sm leading-6 text-slate-300">
                      {data.metricas.tareasTerminadas} de{" "}
                      {data.metricas.totalTareas} tareas terminadas.
                    </p>

                    <Button
                      type="button"
                      className="mt-4 w-full rounded-2xl bg-white text-slate-950 hover:bg-slate-100"
                      disabled={isPending}
                      onClick={handleActualizarProgreso}
                    >
                      {isPending ? "Actualizando..." : "Actualizar progreso"}
                    </Button>
                  </div>
                </Card>

                <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
                  <h2 className="text-lg font-black text-white">
                    Distribución por estado
                  </h2>

                  <div className="mt-5 grid gap-3">
                    {[
                      ["Pendiente", tareasPorEstado.pendiente.length],
                      ["Hoy", tareasPorEstado.hoy.length],
                      ["En proceso", tareasPorEstado.en_proceso.length],
                      ["Bloqueada", tareasPorEstado.bloqueada.length],
                      ["Terminada", tareasPorEstado.terminada.length],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                      >
                        <p className="text-sm font-semibold text-slate-100">
                          {label}
                        </p>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-950 shadow-sm ring-1 ring-white/20">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
                  <h2 className="text-lg font-black text-white">
                    Próximo ajuste
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Ahora falta guardar el progreso calculado en la tabla
                    objetivos y aplicar reglas de bloqueo por rango de fechas.
                  </p>
                </Card>
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}