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

import { theme } from "@/config/theme";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const estadosRecordatorio = [
  {
    title: "Pendiente",
    description: "Avisos que necesitan atención.",
    icon: Bell,
    value: 0,
    iconClass: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  {
    title: "Atendido",
    description: "Ya fueron revisados.",
    icon: CheckCircle2,
    value: 0,
    iconClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  {
    title: "Pospuesto",
    description: "Movidos para otra fecha.",
    icon: PauseCircle,
    value: 0,
    iconClass: "bg-sky-50 text-sky-700 ring-sky-100",
  },
  {
    title: "Cancelado",
    description: "Ya no aplican.",
    icon: XCircle,
    value: 0,
    iconClass: "bg-rose-50 text-rose-700 ring-rose-100",
  },
];

const tiposRecordatorio = [
  {
    title: "Ideas",
    description: "Pensamientos que quieres revisar después.",
    icon: Lightbulb,
    iconClass: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  {
    title: "Tareas",
    description: "Acciones concretas que no deben olvidarse.",
    icon: ListTodo,
    iconClass: "bg-violet-50 text-violet-700 ring-violet-100",
  },
  {
    title: "Objetivos",
    description: "Metas grandes que necesitan seguimiento.",
    icon: Target,
    iconClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
];

const funcionesRecordatorio = [
  "Crear recordatorio manual",
  "Conectar recordatorios con ideas",
  "Conectar recordatorios con tareas",
  "Conectar recordatorios con objetivos",
  "Posponer, cancelar o marcar como atendido",
];

export default function RecordatoriosPage() {
  return (
    <AppShell
      title="Recordatorios"
      description="Avisos para ideas, tareas y objetivos que necesitan atención futura."
    >
      <div className="space-y-5">
        <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <Card className={theme.card.hero}>
            <div className={theme.hero.wrapper}>
              <div className={theme.hero.glow} />

              <div className={theme.hero.content}>
                <div className={theme.hero.badge}>
                  <AlarmClock className="h-4 w-4" />
                  Memoria externa
                </div>

                <h2 className={theme.hero.title}>
                  Lo importante debe volver en el momento correcto.
                </h2>

                <p className={theme.hero.description}>
                  Los recordatorios evitan que las ideas, tareas y objetivos se
                  pierdan. No son ruido: son avisos para volver a prestar
                  atención.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button className={theme.button.primaryLarge}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo recordatorio
                  </Button>

                  <Button variant="outline" className={theme.button.secondaryLarge}>
                    <Clock3 className="mr-2 h-4 w-4" />
                    Ver próximos
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className={theme.card.base}>
            <p className={theme.text.kicker}>Regla del módulo</p>

            <h3 className="mt-3 text-2xl font-black text-slate-950">
              Recordar no es llenar de alarmas.
            </h3>

            <p className={`${theme.text.body} mt-3`}>
              Un buen recordatorio debe traer de vuelta algo accionable:
              revisar una idea, ejecutar una tarea o evaluar un objetivo.
            </p>

            <div className={`${theme.card.inner} mt-5`}>
              <p className={theme.text.body}>
                Este módulo queda listo visualmente. Luego podemos conectarlo a
                Supabase para crear, posponer y cerrar recordatorios reales.
              </p>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {estadosRecordatorio.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className={theme.card.base}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={theme.text.kicker}>{item.title}</p>

                    <p className="mt-3 text-4xl font-black text-slate-950">
                      {item.value}
                    </p>

                    <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                      {item.description}
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
                <p className={theme.text.kicker}>Próximos avisos</p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Recordatorios pendientes
                </h2>

                <p className={`${theme.text.body} mt-2 max-w-2xl`}>
                  Aquí aparecerán los avisos ordenados por fecha cuando el módulo
                  esté conectado a la base de datos.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Pendientes
                </p>

                <p className="mt-1 text-2xl font-black text-slate-950">0</p>
              </div>
            </div>

            <div className={`${theme.card.empty} mt-5`}>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                <CalendarClock className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-xl font-black text-slate-950">
                No hay recordatorios pendientes
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-600">
                Cuando conectemos Supabase, esta sección mostrará recordatorios
                de ideas, tareas y objetivos.
              </p>
            </div>
          </Card>

          <aside className="grid h-fit gap-5">
            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                  <Bell className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Tipos</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Qué puede recordarse
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {tiposRecordatorio.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="mb-2 flex items-center gap-3">
                        <div className={`rounded-2xl p-2 ring-1 ${item.iconClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>

                        <p className="font-black text-slate-950">{item.title}</p>
                      </div>

                      <p className="text-sm font-medium leading-5 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Pendiente</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Funciones del módulo
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {funcionesRecordatorio.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                    <p className="text-sm font-bold text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
            </Card>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}