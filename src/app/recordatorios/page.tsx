import {
  AlarmClock,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Lightbulb,
  ListTodo,
  PauseCircle,
  Plus,
  Target,
  XCircle,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const estadosRecordatorio = [
  {
    title: "Pendiente",
    description: "Recordatorios que todavía necesitan atención.",
    icon: Bell,
  },
  {
    title: "Enviado",
    description: "Recordatorios que ya fueron atendidos o mostrados.",
    icon: CheckCircle2,
  },
  {
    title: "Pospuesto",
    description: "Avisos movidos para otra fecha.",
    icon: PauseCircle,
  },
  {
    title: "Cancelado",
    description: "Recordatorios que ya no aplican.",
    icon: XCircle,
  },
];

const tiposRecordatorio = [
  {
    title: "Ideas",
    description: "Pensamientos que quieres revisar después.",
    icon: Lightbulb,
  },
  {
    title: "Tareas",
    description: "Acciones concretas que no deben olvidarse.",
    icon: ListTodo,
  },
  {
    title: "Objetivos",
    description: "Metas grandes que necesitan seguimiento.",
    icon: Target,
  },
];

const funcionesRecordatorio = [
  "Crear recordatorio",
  "Posponer recordatorio",
  "Cancelar recordatorio",
  "Marcar como atendido",
];

export default function RecordatoriosPage() {
  return (
    <AppShell
      title="Recordatorios"
      description="Avisos para ideas, tareas y objetivos que necesitan atención futura."
    >
      <div className="grid gap-6 text-white">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/48 shadow-[0_24px_90px_rgba(2,6,23,0.35)] backdrop-blur-2xl">
          <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_340px] md:p-8">
            <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-amber-400/20 blur-3xl" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-300/15 px-4 py-2 text-sm font-semibold text-amber-100 shadow-sm backdrop-blur-xl">
                <AlarmClock className="h-4 w-4" />
                Sistema de memoria externa
              </div>

              <h2 className="max-w-2xl text-3xl font-black tracking-tight text-white drop-shadow-sm md:text-4xl">
                Lo que importa debe volver en el momento correcto.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
                Los recordatorios evitan que las ideas, tareas y objetivos se
                pierdan. No son una alarma saturada: son avisos de atención.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="rounded-2xl bg-white text-slate-950 shadow-sm hover:bg-slate-100"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Nuevo recordatorio
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-2xl border-white/15 bg-white/10 text-white shadow-sm backdrop-blur-xl hover:bg-white/15"
                >
                  <Clock3 className="mr-2 h-5 w-5" />
                  Ver próximos
                </Button>
              </div>
            </div>

            <Card className="relative rounded-[2rem] border-white/10 bg-slate-950/72 p-6 text-white shadow-[0_18px_70px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <p className="text-sm font-semibold text-slate-300">
                Regla del módulo
              </p>

              <h3 className="mt-2 text-2xl font-black text-white">
                Recordar no es llenar de ruido.
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Un buen recordatorio debe traer de vuelta algo accionable:
                revisar una idea, ejecutar una tarea o evaluar un objetivo.
              </p>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-sm leading-6 text-slate-300">
                  Más adelante conectaremos fechas reales, estados y relaciones
                  con ideas, tareas y objetivos.
                </p>
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {estadosRecordatorio.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.title}
                className="rounded-[1.75rem] border-white/10 bg-white/10 p-5 text-white shadow-[0_18px_70px_rgba(2,6,23,0.18)] backdrop-blur-2xl"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="rounded-2xl bg-white/15 p-3 text-slate-100 ring-1 ring-white/10">
                    <Icon className="h-5 w-5" />
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-slate-100 backdrop-blur-xl">
                    0
                  </span>
                </div>

                <h3 className="font-black text-white">{item.title}</h3>

                <p className="mt-2 text-sm leading-5 text-slate-300">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
            <div className="mb-5">
              <h2 className="text-xl font-black text-white">
                Recordatorios próximos
              </h2>

              <p className="mt-1 text-sm text-slate-300">
                Aquí aparecerán los avisos pendientes ordenados por fecha.
              </p>
            </div>

            <div className="rounded-3xl border border-dashed border-white/20 bg-white/10 p-6 text-center backdrop-blur-xl">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-slate-100 shadow-sm ring-1 ring-white/10">
                <CalendarClock className="h-6 w-6" />
              </div>

              <p className="font-semibold text-white">
                No hay recordatorios pendientes
              </p>

              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-300">
                Cuando conectemos Supabase, esta sección mostrará los próximos
                recordatorios de ideas, tareas y objetivos.
              </p>
            </div>
          </Card>

          <div className="grid gap-6">
            <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-sky-300/20 p-3 text-sky-100 ring-1 ring-sky-200/20">
                  <Bell className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">
                    Tipos de recordatorio
                  </h2>

                  <p className="text-sm text-slate-300">
                    Cada aviso puede estar asociado a una entidad.
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                {tiposRecordatorio.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                    >
                      <div className="mb-2 flex items-center gap-3">
                        <div className="rounded-2xl bg-white/15 p-2 text-slate-100 shadow-sm ring-1 ring-white/10">
                          <Icon className="h-4 w-4" />
                        </div>

                        <p className="font-semibold text-white">
                          {item.title}
                        </p>
                      </div>

                      <p className="text-sm leading-5 text-slate-300">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <h2 className="text-lg font-black text-white">
                Funciones del módulo
              </h2>

              <div className="mt-5 grid gap-3">
                {funcionesRecordatorio.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-100" />

                    <p className="text-sm font-semibold text-slate-100">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>
    </AppShell>
  );
}