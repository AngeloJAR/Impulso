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
  baja: "bg-slate-300/15 text-slate-200 ring-white/10",
  media: "bg-amber-300/20 text-amber-100 ring-amber-200/20",
  alta: "bg-rose-300/20 text-rose-100 ring-rose-200/20",
};

const estadoStyles: Record<CalendarioTarea["estado"], string> = {
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
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white shadow-sm backdrop-blur-xl transition hover:border-white/25 hover:bg-white/15">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ${
            prioridadStyles[tarea.prioridad]
          }`}
        >
          {tarea.prioridad}
        </span>

        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ${
            estadoStyles[tarea.estado]
          }`}
        >
          {tarea.estado}
        </span>
      </div>

      <p className="line-clamp-2 text-sm font-black leading-5 text-white">{tarea.titulo}</p>

      {tarea.proyecto ? (
        <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-sky-200/20 bg-sky-300/15 px-2.5 py-1 text-[11px] font-bold text-sky-100 backdrop-blur-xl">
          <FolderKanban className="h-3 w-3 shrink-0" />
          <span className="truncate">{tarea.proyecto.nombre}</span>
        </div>
      ) : null}

      <div className="mt-3 grid gap-1 text-[11px] font-semibold text-slate-300">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-3 w-3 shrink-0" />
          <span className="truncate">Inicio: {formatFecha(getFechaInicioTarea(tarea))}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-3 w-3 shrink-0" />
          <span className="truncate">Fin: {formatFecha(getFechaFinTarea(tarea))}</span>
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
      const message = err instanceof Error ? err.message : "No se pudo cargar el calendario.";

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
      tareas: metricas.tareasSemana.filter((tarea) => tareaOcurreEnDia(tarea, dia.date)),
    }));
  }, [metricas.tareasSemana, semanaActual]);

  const resumenCalendario = [
    {
      title: "Hoy",
      value: String(metricas.tareasHoy),
      description: "Tareas para este día",
      icon: ListTodo,
    },
    {
      title: "Próximas",
      value: String(metricas.tareasProximas),
      description: "En los próximos 7 días",
      icon: CalendarDays,
    },
    {
      title: "Recordatorios",
      value: String(metricas.recordatoriosProximos),
      description: "Alertas configuradas",
      icon: Bell,
    },
    {
      title: "Terminadas",
      value: String(metricas.tareasTerminadas),
      description: "Acciones completadas",
      icon: CheckCircle2,
    },
  ];

  return (
    <AppShell
      title="Calendario"
      description="Vista temporal para tareas, recordatorios y fechas importantes."
    >
      <div className="grid gap-4 text-white">
        {error ? (
          <div className="rounded-2xl border border-red-300/30 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100 backdrop-blur-xl">
            {error}
          </div>
        ) : null}

        <section className="rounded-[1.75rem] border border-white/10 bg-slate-950/44 shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
          <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm">
                <CalendarDays className="h-5 w-5" />
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-xl font-black tracking-tight text-white md:text-2xl">
                    Panel de calendario
                  </h2>

                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-slate-200 backdrop-blur-xl">
                    {loading ? "Cargando..." : "Semana actual"}
                  </span>
                </div>

                <p className="mt-1 text-sm leading-5 text-slate-300">
                  Revisa tareas de hoy, próximos días y recordatorios.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-2xl border-white/15 bg-white/10 px-4 font-bold text-white shadow-sm backdrop-blur-xl hover:bg-white/15"
              onClick={() => void loadCalendario()}
              disabled={loading}
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Actualizando" : "Actualizar"}
            </Button>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2 md:p-6 xl:grid-cols-4">
            {resumenCalendario.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.title}
                  className="rounded-3xl border-white/10 bg-white/10 p-4 text-white shadow-none backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-300">{item.title}</p>

                      <p className="mt-2 text-3xl font-black text-white">
                        {loading ? "..." : item.value}
                      </p>

                      <p className="mt-1 text-sm leading-5 text-slate-300">{item.description}</p>
                    </div>

                    <div className="rounded-2xl bg-white/15 p-3 text-slate-100 shadow-sm ring-1 ring-white/10">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="rounded-[1.75rem] border-white/10 bg-slate-950/44 p-5 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl md:p-6">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Semana actual</h2>

                <p className="mt-1 text-sm text-slate-300">
                  Tareas distribuidas durante los próximos 7 días.
                </p>
              </div>

              <span className="w-fit rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-slate-200 backdrop-blur-xl">
                {metricas.tareasSemana.length} tareas en semana
              </span>
            </div>

            <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {tareasPorDia.map((dia) => {
                const tieneTareas = dia.tareas.length > 0;

                return (
                  <div
                    key={dia.date}
                    className={`rounded-3xl border p-4 transition ${
                      tieneTareas
                        ? "border-white/20 bg-white/10 shadow-sm backdrop-blur-xl"
                        : "border-white/10 bg-white/5 backdrop-blur-xl"
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-white">{dia.label}</h3>

                          {tieneTareas ? (
                            <span className="rounded-full border border-emerald-200/20 bg-emerald-300/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-100">
                              Activo
                            </span>
                          ) : null}
                        </div>

                        <p className="mt-0.5 text-xs font-semibold text-slate-300">
                          {formatFecha(dia.date)}
                        </p>
                      </div>

                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-black shadow-sm ring-1 ${
                          tieneTareas
                            ? "bg-white text-slate-950 ring-white"
                            : "bg-white/10 text-slate-300 ring-white/10"
                        }`}
                      >
                        {dia.tareas.length}
                      </span>
                    </div>

                    {dia.tareas.length === 0 ? (
                      <div className="flex min-h-[96px] items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/10 backdrop-blur-xl">
                        <p className="text-xs font-bold text-slate-300">Sin tareas programadas</p>
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {dia.tareas.slice(0, 2).map((tarea) => (
                          <TareaMiniCard key={tarea.id} tarea={tarea} />
                        ))}

                        {dia.tareas.length > 2 ? (
                          <div className="rounded-2xl border border-dashed border-white/20 bg-white/10 px-3 py-2 text-center backdrop-blur-xl">
                            <p className="text-xs font-bold text-slate-300">
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

          <aside className="grid gap-4">
            <Card className="rounded-[1.75rem] border-white/10 bg-slate-950/44 p-5 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-amber-300/20 p-3 text-amber-100 ring-1 ring-amber-200/20">
                  <Clock3 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">Tareas de hoy</h2>

                  <p className="text-sm text-slate-300">Acciones que requieren atención.</p>
                </div>
              </div>

              {metricas.tareasHoyLista.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/20 bg-white/10 p-5 text-center backdrop-blur-xl">
                  <ListTodo className="mx-auto mb-3 h-6 w-6 text-slate-300" />

                  <p className="text-sm font-bold text-white">Sin tareas para hoy</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {metricas.tareasHoyLista.map((tarea) => (
                    <TareaMiniCard key={tarea.id} tarea={tarea} />
                  ))}
                </div>
              )}
            </Card>

            <Card className="rounded-[1.75rem] border-white/10 bg-slate-950/44 p-5 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-sky-300/20 p-3 text-sky-100 ring-1 ring-sky-200/20">
                  <Bell className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">Recordatorios</h2>

                  <p className="text-sm text-slate-300">Tareas con aviso configurado.</p>
                </div>
              </div>

              {metricas.recordatoriosLista.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/20 bg-white/10 p-5 text-center backdrop-blur-xl">
                  <Bell className="mx-auto mb-3 h-6 w-6 text-slate-300" />

                  <p className="text-sm font-bold text-white">Sin recordatorios próximos</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {metricas.recordatoriosLista.slice(0, 5).map((tarea) => (
                    <div
                      key={tarea.id}
                      className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white backdrop-blur-xl"
                    >
                      <p className="line-clamp-2 text-sm font-black text-white">{tarea.titulo}</p>

                      <p className="mt-1 text-xs font-semibold text-slate-300">
                        Recordatorio: {formatFecha(tarea.recordatorio)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="rounded-[1.75rem] border-white/10 bg-slate-950/44 p-5 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-300/20 p-3 text-emerald-100 ring-1 ring-emerald-200/20">
                  <Target className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">Próximo paso</h2>

                  <p className="text-sm text-slate-300">Objetivos con fecha límite.</p>
                </div>
              </div>

              <div className="rounded-3xl border border-dashed border-white/20 bg-white/10 p-5 backdrop-blur-xl">
                <p className="text-sm leading-6 text-slate-300">
                  Luego conectaremos objetivos reales para mostrar fechas límite y progreso dentro
                  del calendario.
                </p>
              </div>
            </Card>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}