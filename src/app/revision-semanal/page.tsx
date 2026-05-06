import {
  Archive,
  CheckCircle2,
  CircleHelp,
  FolderKanban,
  Lightbulb,
  ListTodo,
  RotateCcw,
  Target,
} from "lucide-react";

import { theme } from "@/config/theme";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const resumenRevision = [
  {
    title: "Ideas nuevas",
    value: "0",
    description: "Ideas capturadas para revisar",
    icon: Lightbulb,
    iconClass: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  {
    title: "Tareas terminadas",
    value: "0",
    description: "Acciones completadas esta semana",
    icon: CheckCircle2,
    iconClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  {
    title: "Objetivos activos",
    value: "0",
    description: "Metas que siguen en movimiento",
    icon: Target,
    iconClass: "bg-sky-50 text-sky-700 ring-sky-100",
  },
  {
    title: "Proyectos atentos",
    value: "0",
    description: "Espacios que necesitan decisión",
    icon: FolderKanban,
    iconClass: "bg-violet-50 text-violet-700 ring-violet-100",
  },
];

const preguntasGuia = [
  "¿Qué ideas nuevas capturaste?",
  "¿Qué tareas terminaste?",
  "¿Qué objetivo sigue activo?",
  "¿Qué estás postergando demasiado?",
  "¿Qué idea ya no vale la pena?",
];

const bloquesRevision = [
  {
    title: "Ideas por decidir",
    description: "Ideas que deberían convertirse, archivarse o seguir en revisión.",
    icon: Lightbulb,
    iconClass: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  {
    title: "Tareas postergadas",
    description: "Acciones que se han movido demasiado y necesitan decisión.",
    icon: ListTodo,
    iconClass: "bg-violet-50 text-violet-700 ring-violet-100",
  },
  {
    title: "Objetivos activos",
    description: "Metas abiertas que necesitan próximo paso.",
    icon: Target,
    iconClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  {
    title: "Proyectos quietos",
    description: "Proyectos sin movimiento reciente o sin foco claro.",
    icon: FolderKanban,
    iconClass: "bg-sky-50 text-sky-700 ring-sky-100",
  },
];

const resultadoEsperado = [
  "Ideas archivadas o convertidas",
  "Tareas postergadas revisadas",
  "Objetivos con próximo paso",
  "Proyectos con foco claro",
];

export default function RevisionSemanalPage() {
  return (
    <AppShell
      title="Revisión semanal"
      description="Una pantalla para limpiar, decidir y recuperar foco cada semana."
    >
      <div className="space-y-5">
        <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <Card className={theme.card.hero}>
            <div className={theme.hero.wrapper}>
              <div className={theme.hero.glow} />

              <div className={theme.hero.content}>
                <div className={theme.hero.badge}>
                  <RotateCcw className="h-4 w-4" />
                  Ritual de claridad
                </div>

                <h2 className={theme.hero.title}>
                  Revisar evita que tu sistema se vuelva otra lista olvidada.
                </h2>

                <p className={theme.hero.description}>
                  La revisión semanal sirve para decidir qué ideas avanzan, qué
                  tareas siguen importando, qué objetivos continúan activos y qué
                  proyectos necesitan atención.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button className={theme.button.primaryLarge}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Iniciar revisión
                  </Button>

                  <Button variant="outline" className={theme.button.secondaryLarge}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archivar pendientes
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className={theme.card.base}>
            <p className={theme.text.kicker}>Regla del módulo</p>

            <h3 className="mt-3 text-2xl font-black text-slate-950">
              Revisar es decidir, no acumular.
            </h3>

            <p className={`${theme.text.body} mt-3`}>
              Esta pantalla no debe ser un historial gigante. Debe mostrar lo
              que necesita una decisión concreta esta semana.
            </p>

            <div className={`${theme.card.inner} mt-5`}>
              <p className={theme.text.body}>
                Luego podemos conectarla a datos reales para detectar ideas
                nuevas, tareas postergadas y proyectos sin atención.
              </p>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {resumenRevision.map((item) => {
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
                <p className={theme.text.kicker}>Panel de decisión</p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Elementos para revisar
                </h2>

                <p className={`${theme.text.body} mt-2 max-w-2xl`}>
                  Aquí aparecerán los puntos que necesitan limpieza, decisión o
                  siguiente acción.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Pendientes
                </p>

                <p className="mt-1 text-2xl font-black text-slate-950">0</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {bloquesRevision.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className={`rounded-2xl p-3 ring-1 ${item.iconClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
                        0
                      </span>
                    </div>

                    <h3 className="font-black text-slate-950">{item.title}</h3>

                    <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                      {item.description}
                    </p>

                    <div className="mt-5 rounded-[1.4rem] border border-dashed border-slate-300 bg-white p-4 text-center">
                      <p className="text-xs font-medium leading-5 text-slate-500">
                        Sin elementos para revisar todavía.
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <aside className="grid h-fit gap-5">
            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-700 ring-1 ring-rose-100">
                  <CircleHelp className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Guía</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Preguntas clave
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {preguntasGuia.map((pregunta, index) => (
                  <div
                    key={pregunta}
                    className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-xs font-black text-white">
                        {index + 1}
                      </span>

                      <p className="text-sm font-black text-slate-950">
                        Pregunta {index + 1}
                      </p>
                    </div>

                    <p className="text-sm font-medium leading-6 text-slate-600">
                      {pregunta}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Resultado</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Al terminar
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {resultadoEsperado.map((item) => (
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