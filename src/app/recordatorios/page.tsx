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
      <div className="grid gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_340px] md:p-8">
            <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-amber-100 blur-3xl" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                <AlarmClock className="h-4 w-4" />
                Sistema de memoria externa
              </div>

              <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                Lo que importa debe volver en el momento correcto.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                Los recordatorios evitan que las ideas, tareas y objetivos se
                pierdan. No son una alarma saturada: son avisos de atención.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="rounded-2xl">
                  <Plus className="mr-2 h-5 w-5" />
                  Nuevo recordatorio
                </Button>

                <Button size="lg" variant="outline" className="rounded-2xl">
                  <Clock3 className="mr-2 h-5 w-5" />
                  Ver próximos
                </Button>
              </div>
            </div>

            <Card className="relative rounded-[2rem] border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
              <p className="text-sm font-medium text-slate-400">
                Regla del módulo
              </p>
              <h3 className="mt-2 text-2xl font-semibold">
                Recordar no es llenar de ruido.
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Un buen recordatorio debe traer de vuelta algo accionable:
                revisar una idea, ejecutar una tarea o evaluar un objetivo.
              </p>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
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
                className="rounded-[1.75rem] border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                    0
                  </span>
                </div>

                <h3 className="font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-5 text-slate-500">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-950">
                Recordatorios próximos
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Aquí aparecerán los avisos pendientes ordenados por fecha.
              </p>
            </div>

            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                <CalendarClock className="h-6 w-6" />
              </div>

              <p className="font-semibold text-slate-800">
                No hay recordatorios pendientes
              </p>
              <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                Cuando conectemos Supabase, esta sección mostrará los próximos
                recordatorios de ideas, tareas y objetivos.
              </p>
            </div>
          </Card>

          <div className="grid gap-6">
            <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
                  <Bell className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Tipos de recordatorio
                  </h2>
                  <p className="text-sm text-slate-500">
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
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="mb-2 flex items-center gap-3">
                        <div className="rounded-2xl bg-white p-2 text-slate-600 shadow-sm ring-1 ring-slate-200">
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="font-semibold text-slate-800">
                          {item.title}
                        </p>
                      </div>
                      <p className="text-sm leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Funciones del módulo
              </h2>

              <div className="mt-5 grid gap-3">
                {funcionesRecordatorio.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <CheckCircle2 className="h-4 w-4 text-slate-500" />
                    <p className="text-sm font-medium text-slate-700">
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