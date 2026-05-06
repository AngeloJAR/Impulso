"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  ListTodo,
  RefreshCcw,
  Target,
} from "lucide-react";

import {
  getCalendarioMetricas,
  type CalendarioMetricas,
  type CalendarioTarea,
} from "@/features/calendario/queries";
import { theme } from "@/config/theme";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const emptyMetricas: CalendarioMetricas = {
  totalTareas: 0,
  tareasHoy: 0,
  tareasVencidas: 0,
  recordatorios: 0,
  tareasProximas: 0,
  recordatoriosProximos: 0,
  tareasTerminadas: 0,
  tareasHoyLista: [],
  tareasProximasLista: [],
  recordatoriosLista: [],
  tareasSemana: [],
};

const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const prioridadStyles: Record<CalendarioTarea["prioridad"], string> = {
  baja: theme.states.prioridad.baja,
  media: theme.states.prioridad.media,
  alta: theme.states.prioridad.alta,
};

const estadoStyles: Record<CalendarioTarea["estado"], string> = {
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

function getDateInEcuador(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Guayaquil",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getSemanaActual() {
  const today = new Date();

  return diasSemana.map((label, index) => {
    const date = addDays(today, index);

    return {
      label,
      date: getDateInEcuador(date),
      isToday: index === 0,
    };
  });
}

function getFechaInicioTarea(tarea: CalendarioTarea) {
  return tarea.fecha_inicio || tarea.fecha;
}

function getFechaFinTarea(tarea: CalendarioTarea) {
  return tarea.fecha_limite || tarea.fecha_inicio || tarea.fecha;
}

function tareaOcurreEnDia(tarea: CalendarioTarea, dia: string) {
  const inicio = getFechaInicioTarea(tarea);
  const fin = getFechaFinTarea(tarea);

  if (!inicio || !fin) return false;

  return inicio <= dia && dia <= fin;
}

function TareaMiniCard({ tarea }: { tarea: CalendarioTarea }) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/40">
      <div className="mb-2 flex min-w-0 flex-wrap items-center gap-1.5">
        <span
          className={`${theme.badge.base} ${prioridadStyles[tarea.prioridad]} max-w-full`}
        >
          {capitalizar(tarea.prioridad)}
        </span>

        <span
          className={`${theme.badge.base} ${estadoStyles[tarea.estado]} max-w-full`}
        >
          {capitalizar(tarea.estado)}
        </span>
      </div>

      <p className="line-clamp-2 break-words text-sm font-black leading-5 text-slate-950">
        {tarea.titulo}
      </p>

      {tarea.proyecto ? (
        <div
          className={`${theme.badge.base} ${theme.badge.sky} mt-3 inline-flex max-w-full items-center gap-1.5 normal-case tracking-normal`}
        >
          <FolderKanban className="h-3 w-3 shrink-0" />
          <span className="min-w-0 truncate">{tarea.proyecto.nombre}</span>
        </div>
      ) : null}

      <div className="mt-3 grid min-w-0 gap-1 text-[11px] font-bold text-slate-500">
        <div className="flex min-w-0 items-center gap-1.5">
          <CalendarDays className="h-3 w-3 shrink-0" />
          <span className="min-w-0 truncate">
            Inicio: {formatFecha(getFechaInicioTarea(tarea))}
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-1.5">
          <CalendarDays className="h-3 w-3 shrink-0" />
          <span className="min-w-0 truncate">
            Fin: {formatFecha(getFechaFinTarea(tarea))}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CalendarioPage() {
  const [metricas, setMetricas] = useState<CalendarioMetricas>(emptyMetricas);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCalendario = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getCalendarioMetricas();
      setMetricas(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar el calendario.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCalendario();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadCalendario]);
  const semanaActual = useMemo(() => getSemanaActual(), []);

  const tareasPorDia = useMemo(() => {
    return semanaActual.map((dia) => ({
      ...dia,
      tareas: metricas.tareasSemana.filter((tarea) =>
        tareaOcurreEnDia(tarea, dia.date)
      ),
    }));
  }, [metricas.tareasSemana, semanaActual]);

  const progresoSemana = useMemo(() => {
    const totalSemana = metricas.tareasSemana.length;

    if (totalSemana === 0) return 0;

    const terminadasSemana = metricas.tareasSemana.filter(
      (tarea) => tarea.estado === "terminada"
    ).length;

    return Math.round((terminadasSemana / totalSemana) * 100);
  }, [metricas.tareasSemana]);

  const resumenCalendario = [
    {
      title: "Hoy",
      value: String(metricas.tareasHoy),
      description: "Tareas para este día",
      icon: ListTodo,
      iconClass: "bg-violet-50 text-violet-700 ring-violet-100",
    },
    {
      title: "Próximas",
      value: String(metricas.tareasProximas),
      description: "En los próximos 7 días",
      icon: CalendarDays,
      iconClass: "bg-blue-50 text-blue-700 ring-blue-100",
    },
    {
      title: "Recordatorios",
      value: String(metricas.recordatoriosProximos),
      description: "Alertas configuradas",
      icon: Bell,
      iconClass: "bg-amber-50 text-amber-700 ring-amber-100",
    },
    {
      title: "Terminadas",
      value: String(metricas.tareasTerminadas),
      description: "Acciones completadas",
      icon: CheckCircle2,
      iconClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    },
  ];

  return (
    <AppShell
      title="Calendario"
      description="Vista temporal para tareas, recordatorios y fechas importantes."
    >
      <div className="space-y-5">
        {error ? <div className={theme.alerts.error}>{error}</div> : null}

        <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <Card className={theme.card.hero}>
            <div className={theme.hero.wrapper}>
              <div className={theme.hero.glow} />

              <div className={theme.hero.content}>
                <div className={theme.hero.badge}>
                  <CalendarDays className="h-4 w-4" />
                  Semana activa
                </div>

                <h2 className={theme.hero.title}>
                  Mira qué toca hacer, cuándo y con qué prioridad.
                </h2>

                <p className={theme.hero.description}>
                  El calendario reúne tareas con fecha, próximas acciones y
                  recordatorios para que no tengas que buscarlos en cada proyecto.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    className={theme.button.primaryLarge}
                    onClick={() => void loadCalendario()}
                    disabled={loading}
                  >
                    <RefreshCcw
                      className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""
                        }`}
                    />
                    {loading ? "Actualizando" : "Actualizar calendario"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className={theme.card.base}>
            <p className={theme.text.kicker}>Avance semanal</p>

            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-5xl font-black text-slate-950">
                  {loading ? "..." : `${progresoSemana}%`}
                </p>

                <p className={`${theme.text.body} mt-2`}>
                  Según tareas terminadas en la semana.
                </p>
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>

            <div className={`${theme.progress.track} mt-5`}>
              <div
                className={theme.progress.bar}
                style={{ width: `${progresoSemana}%` }}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-2xl font-black text-slate-950">
                  {metricas.tareasSemana.length}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  En semana
                </p>
              </div>

              <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-2xl font-black text-slate-950">
                  {metricas.tareasVencidas}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  Vencidas
                </p>
              </div>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {resumenCalendario.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className={theme.card.base}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={theme.text.kicker}>{item.title}</p>

                    <p className="mt-3 text-4xl font-black text-slate-950">
                      {loading ? "..." : item.value}
                    </p>

                    <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                      {item.description}
                    </p>
                  </div>

                  <div
                    className={`rounded-2xl p-3 ring-1 ${item.iconClass}`}
                  >
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
                <p className={theme.text.kicker}>Semana actual</p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Próximos 7 días
                </h2>

                <p className={`${theme.text.body} mt-2 max-w-2xl`}>
                  Las tareas se muestran en los días donde su rango de fechas
                  está activo.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Total semana
                </p>

                <p className="mt-1 text-2xl font-black text-slate-950">
                  {metricas.tareasSemana.length}
                </p>
              </div>
            </div>

            <div className="mt-5 grid min-w-0 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
              {tareasPorDia.map((dia) => {
                const tieneTareas = dia.tareas.length > 0;

                return (
                  <div
                    key={dia.date}
                    className={`min-w-0 overflow-hidden rounded-[1.7rem] border p-4 transition ${tieneTareas
                      ? "border-blue-200 bg-blue-50/40"
                      : "border-slate-200 bg-slate-50"
                      }`}
                  >
                    <div className="mb-4 flex min-w-0 items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <h3 className="text-base font-black text-slate-950">
                            {dia.label}
                          </h3>

                          {dia.isToday ? (
                            <span className={`${theme.badge.base} ${theme.badge.blue}`}>
                              Hoy
                            </span>
                          ) : null}

                          {tieneTareas ? (
                            <span
                              className={`${theme.badge.base} ${theme.badge.emerald}`}
                            >
                              Activo
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {formatFecha(dia.date)}
                        </p>
                      </div>

                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-black ring-1 ${tieneTareas
                          ? "bg-blue-600 text-white ring-blue-600"
                          : "bg-white text-slate-500 ring-slate-200"
                          }`}
                      >
                        {dia.tareas.length}
                      </span>
                    </div>

                    {dia.tareas.length === 0 ? (
                      <div className="flex min-h-[110px] items-center justify-center rounded-[1.4rem] border border-dashed border-slate-300 bg-white">
                        <p className="text-xs font-bold text-slate-500">
                          Sin tareas programadas
                        </p>
                      </div>
                    ) : (
                      <div className="grid min-w-0 gap-3">
                        {dia.tareas.slice(0, 2).map((tarea) => (
                          <TareaMiniCard key={tarea.id} tarea={tarea} />
                        ))}

                        {dia.tareas.length > 2 ? (
                          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-3 py-2 text-center">
                            <p className="text-xs font-bold text-slate-500">
                              + {dia.tareas.length - 2} tarea
                              {dia.tareas.length - 2 === 1 ? "" : "s"} más
                            </p>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <aside className="grid h-fit gap-5">
            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                  <Clock3 className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Hoy</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Tareas de hoy
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {metricas.tareasHoyLista.length === 0 ? (
                  <div className={theme.card.empty}>
                    <ListTodo className="mx-auto mb-3 h-6 w-6 text-slate-400" />

                    <p className="text-sm font-bold text-slate-950">
                      Sin tareas para hoy
                    </p>
                  </div>
                ) : (
                  metricas.tareasHoyLista.map((tarea) => (
                    <TareaMiniCard key={tarea.id} tarea={tarea} />
                  ))
                )}
              </div>
            </Card>

            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                  <Bell className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Alertas</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Recordatorios
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {metricas.recordatoriosLista.length === 0 ? (
                  <div className={theme.card.empty}>
                    <Bell className="mx-auto mb-3 h-6 w-6 text-slate-400" />

                    <p className="text-sm font-bold text-slate-950">
                      Sin recordatorios próximos
                    </p>
                  </div>
                ) : (
                  metricas.recordatoriosLista.slice(0, 5).map((tarea) => (
                    <div
                      key={tarea.id}
                      className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <p className="text-sm font-black text-slate-950">
                        {tarea.titulo}
                      </p>

                      <p className="mt-2 text-xs font-bold text-slate-500">
                        Recordatorio: {formatFecha(tarea.recordatorio)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <Target className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Uso recomendado</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Planifica por tareas
                  </h2>
                </div>
              </div>

              <p className={`${theme.card.inner} mt-5 text-sm font-medium leading-6`}>
                Para que algo aparezca aquí, crea tareas con fecha de inicio,
                fecha límite o recordatorio.
              </p>
            </Card>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}