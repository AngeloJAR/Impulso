"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
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
  RefreshCcw,
  Search,
  Target,
} from "lucide-react";

import {
  getObjetivoDetalle,
  type ObjetivoDetalleData,
  type ObjetivoDetalleTarea,
} from "@/features/objetivos/objective-detail-queries";
import { actualizarProgresoObjetivo } from "@/features/objetivos/actions";
import { theme } from "@/config/theme";
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
  activo: theme.states.objetivo.activo,
  pausado: theme.states.objetivo.pausado,
  completado: theme.states.objetivo.completado,
  abandonado: theme.states.objetivo.abandonado,
};

const prioridadTareaStyles: Record<ObjetivoDetalleTarea["prioridad"], string> = {
  baja: theme.states.prioridad.baja,
  media: theme.states.prioridad.media,
  alta: theme.states.prioridad.alta,
};

const estadoTareaStyles: Record<ObjetivoDetalleTarea["estado"], string> = {
  pendiente: theme.states.tarea.pendiente,
  hoy: theme.states.tarea.hoy,
  en_proceso: theme.states.tarea.en_proceso,
  bloqueada: theme.states.tarea.bloqueada,
  terminada: theme.states.tarea.terminada,
};

function capitalizar(value: string) {
  const clean = value.replaceAll("_", " ");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

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

function clampProgreso(value?: number | null) {
  const progreso = Number(value ?? 0);

  if (!Number.isFinite(progreso)) return 0;
  if (progreso < 0) return 0;
  if (progreso > 100) return 100;

  return progreso;
}

export default function ObjetivoDetallePage() {
  const params = useParams<{ id: string }>();
  const objetivoId = params.id;

  const [data, setData] = useState<ObjetivoDetalleData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [isPending, startTransition] = useTransition();

  const loadObjetivo = useCallback(async () => {
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
  }, [objetivoId]);

useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void loadObjetivo();
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [loadObjetivo]);
  function handleActualizarProgreso() {
    setError("");
    setMessage("");

    startTransition(() => {
      void (async () => {
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
      })();
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

  const tareasFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return data.tareas;

    return data.tareas.filter((tarea) => {
      return (
        tarea.titulo.toLowerCase().includes(term) ||
        tarea.descripcion?.toLowerCase().includes(term) ||
        tarea.estado.toLowerCase().includes(term) ||
        tarea.prioridad.toLowerCase().includes(term)
      );
    });
  }, [data.tareas, search]);

  const objetivo = data.objetivo;
  const progreso = clampProgreso(data.metricas.progresoCalculado);
  const proyectoHref = objetivo?.proyecto_id ? `/proyectos/${objetivo.proyecto_id}` : "/objetivos";

  return (
    <AppShell
      title={objetivo ? objetivo.titulo : "Objetivo"}
      description="Detalle del objetivo y sus tareas asociadas."
    >
      <div className="space-y-5">
        {error ? <div className={theme.alerts.error}>{error}</div> : null}

        {message ? (
          <div className={`flex items-center gap-2 ${theme.alerts.success}`}>
            <CheckCircle2 className="h-4 w-4" />
            {message}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href={proyectoHref}>
            <Button variant="outline" className={theme.button.secondary}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {objetivo?.proyecto_id ? "Volver al proyecto" : "Volver a objetivos"}
            </Button>
          </Link>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              className={theme.button.secondary}
              onClick={() => void loadObjetivo()}
              disabled={loading}
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Actualizando" : "Actualizar"}
            </Button>

            <Link
              href={
                objetivo?.proyecto_id
                  ? `/tareas?proyectoId=${objetivo.proyecto_id}&objetivoId=${objetivoId}#crear-tarea`
                  : `/tareas?objetivoId=${objetivoId}#crear-tarea`
              }
            >
              <Button className={theme.button.primary}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva tarea
              </Button>
            </Link>

            <Button variant="outline" className={theme.button.secondary} disabled>
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
        ) : !objetivo ? (
          <Card className={theme.card.base}>
            <div className={theme.card.empty}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                <Target className="h-6 w-6" />
              </div>

              <h2 className="mt-4 text-xl font-black text-slate-950">
                Objetivo no encontrado
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-600">
                Puede que no exista, que haya sido eliminado o que no pertenezca a tu usuario.
              </p>

              <Link href="/objetivos" className="mt-5 inline-block">
                <Button className={theme.button.primary}>Ir a objetivos</Button>
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
                      <Target className="h-4 w-4" />
                      Objetivo
                    </div>

                    <h2 className={theme.hero.title}>{objetivo.titulo}</h2>

                    <p className={theme.hero.description}>
                      {objetivo.descripcion || "Este objetivo todavía no tiene descripción."}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <span
                        className={`${theme.badge.base} ${
                          estadoObjetivoStyles[objetivo.estado]
                        }`}
                      >
                        {capitalizar(objetivo.estado)}
                      </span>

                      {objetivo.proyecto ? (
                        <Link href={`/proyectos/${objetivo.proyecto.id}`}>
                          <span
                            className={`${theme.badge.base} ${theme.badge.sky} inline-flex items-center gap-1.5`}
                          >
                            <FolderKanban className="h-3.5 w-3.5" />
                            {objetivo.proyecto.nombre}
                          </span>
                        </Link>
                      ) : (
                        <span className={`${theme.badge.base} ${theme.badge.slate}`}>
                          Sin proyecto
                        </span>
                      )}

                      <span className={`${theme.badge.base} ${theme.badge.slate}`}>
                        {formatFecha(objetivo.fecha_inicio)} - {formatFecha(objetivo.fecha_limite)}
                      </span>
                    </div>

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                      <Link
                        href={
                          objetivo.proyecto_id
                            ? `/tareas?proyectoId=${objetivo.proyecto_id}&objetivoId=${objetivoId}#crear-tarea`
                            : `/tareas?objetivoId=${objetivoId}#crear-tarea`
                        }
                      >
                        <Button className={theme.button.primaryLarge}>
                          <Plus className="mr-2 h-4 w-4" />
                          Nueva tarea
                        </Button>
                      </Link>

                      <Button
                        type="button"
                        variant="outline"
                        className={theme.button.secondaryLarge}
                        onClick={handleActualizarProgreso}
                        disabled={isPending}
                      >
                        <RefreshCcw
                          className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`}
                        />
                        {isPending ? "Actualizando" : "Actualizar progreso"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className={theme.card.base}>
                <p className={theme.text.kicker}>Progreso calculado</p>

                <div className="mt-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-5xl font-black text-slate-950">{progreso}%</p>
                    <p className={`${theme.text.body} mt-2`}>
                      Según tareas terminadas.
                    </p>
                  </div>

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </div>

                <div className={`${theme.progress.track} mt-5`}>
                  <div className={theme.progress.bar} style={{ width: `${progreso}%` }} />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-2xl font-black text-slate-950">
                      {data.metricas.tareasTerminadas}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      Terminadas
                    </p>
                  </div>

                  <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-2xl font-black text-slate-950">
                      {data.metricas.totalTareas}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      Total
                    </p>
                  </div>
                </div>
              </Card>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Total tareas",
                  value: data.metricas.totalTareas,
                  icon: ListTodo,
                  iconClass: "bg-violet-50 text-violet-700 ring-violet-100",
                },
                {
                  title: "Pendientes",
                  value: data.metricas.tareasPendientes,
                  icon: Clock3,
                  iconClass: "bg-amber-50 text-amber-700 ring-amber-100",
                },
                {
                  title: "Terminadas",
                  value: data.metricas.tareasTerminadas,
                  icon: CheckCircle2,
                  iconClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
                },
                {
                  title: "Progreso",
                  value: `${progreso}%`,
                  icon: Target,
                  iconClass: "bg-sky-50 text-sky-700 ring-sky-100",
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
                    <p className={theme.text.kicker}>Acciones del objetivo</p>

                    <h2 className="mt-2 text-2xl font-black text-slate-950">
                      Tareas asociadas
                    </h2>

                    <p className={`${theme.text.body} mt-2 max-w-2xl`}>
                      Estas tareas son las acciones concretas que hacen avanzar
                      este objetivo.
                    </p>
                  </div>

                  <div className="relative w-full lg:w-[280px]">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Buscar tarea..."
                      className={theme.input.search}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  {data.tareas.length === 0 ? (
                    <div className={theme.card.empty}>
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                        <ListTodo className="h-6 w-6" />
                      </div>

                      <h3 className="mt-4 text-xl font-black text-slate-950">
                        No hay tareas asociadas
                      </h3>

                      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-600">
                        Crea una tarea para que este objetivo tenga acciones reales.
                      </p>

                      <Link
                        href={
                          objetivo.proyecto_id
                            ? `/tareas?proyectoId=${objetivo.proyecto_id}&objetivoId=${objetivoId}#crear-tarea`
                            : `/tareas?objetivoId=${objetivoId}#crear-tarea`
                        }
                        className="mt-5 inline-block"
                      >
                        <Button className={theme.button.primary}>
                          <Plus className="mr-2 h-4 w-4" />
                          Crear primera tarea
                        </Button>
                      </Link>
                    </div>
                  ) : tareasFiltradas.length === 0 ? (
                    <div className={theme.card.empty}>
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                        <Search className="h-6 w-6" />
                      </div>

                      <h3 className="mt-4 text-xl font-black text-slate-950">
                        No se encontraron tareas
                      </h3>

                      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-600">
                        Cambia la búsqueda para ver otras tareas.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2">
                      {tareasFiltradas.map((tarea) => (
                        <div
                          key={tarea.id}
                          className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
                        >
                          <div className="mb-3 flex flex-wrap gap-2">
                            <span
                              className={`${theme.badge.base} ${
                                prioridadTareaStyles[tarea.prioridad]
                              }`}
                            >
                              {capitalizar(tarea.prioridad)}
                            </span>

                            <span
                              className={`${theme.badge.base} ${
                                estadoTareaStyles[tarea.estado]
                              }`}
                            >
                              {capitalizar(tarea.estado)}
                            </span>
                          </div>

                          <h3 className="text-base font-black text-slate-950">
                            {tarea.titulo}
                          </h3>

                          <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                            {tarea.descripcion || "Sin descripción"}
                          </p>

                          <div className="mt-4 grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-500">
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-3.5 w-3.5" />
                              Inicio: {formatFecha(tarea.fecha_inicio || tarea.fecha)}
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
                </div>
              </Card>

              <aside className="grid h-fit gap-5">
                <Card className={theme.card.base}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>

                    <div>
                      <p className={theme.text.kicker}>Progreso real</p>

                      <h2 className="mt-2 text-xl font-black text-slate-950">
                        Tareas terminadas
                      </h2>
                    </div>
                  </div>

                  <div className={`${theme.card.inner} mt-5`}>
                    <p className={theme.text.body}>
                      {data.metricas.tareasTerminadas} de{" "}
                      {data.metricas.totalTareas} tareas terminadas.
                    </p>

                    <Button
                      type="button"
                      className={`${theme.button.primary} mt-4 w-full`}
                      disabled={isPending}
                      onClick={handleActualizarProgreso}
                    >
                      {isPending ? "Actualizando..." : "Actualizar progreso"}
                    </Button>
                  </div>
                </Card>

                <Card className={theme.card.base}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                      <ListTodo className="h-5 w-5" />
                    </div>

                    <div>
                      <p className={theme.text.kicker}>Distribución</p>

                      <h2 className="mt-2 text-xl font-black text-slate-950">
                        Por estado
                      </h2>
                    </div>
                  </div>

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
                        className="flex items-center justify-between rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4"
                      >
                        <p className="text-sm font-bold text-slate-700">
                          {label}
                        </p>

                        <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              </aside>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}