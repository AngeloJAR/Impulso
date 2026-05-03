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

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const resumenRevision = [
  {
    title: "Ideas nuevas",
    value: "0",
    description: "Ideas capturadas para revisar",
    icon: Lightbulb,
  },
  {
    title: "Tareas terminadas",
    value: "0",
    description: "Acciones completadas esta semana",
    icon: CheckCircle2,
  },
  {
    title: "Objetivos activos",
    value: "0",
    description: "Metas que siguen en movimiento",
    icon: Target,
  },
  {
    title: "Proyectos con atención",
    value: "0",
    description: "Espacios que necesitan decisión",
    icon: FolderKanban,
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
  },
  {
    title: "Tareas postergadas",
    description: "Acciones que se han movido demasiado y necesitan decisión.",
    icon: ListTodo,
  },
  {
    title: "Objetivos activos",
    description: "Metas que siguen abiertas y necesitan próximo paso.",
    icon: Target,
  },
  {
    title: "Proyectos quietos",
    description: "Proyectos sin movimiento reciente o sin foco claro.",
    icon: FolderKanban,
  },
];

export default function RevisionSemanalPage() {
  return (
    <AppShell
      title="Revisión semanal"
      description="Una pantalla para limpiar, decidir y recuperar foco cada semana."
    >
      <div className="grid gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_340px] md:p-8">
            <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-rose-100 blur-3xl" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700">
                <RotateCcw className="h-4 w-4" />
                Ritual de claridad
              </div>

              <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                Revisar evita que tu sistema se vuelva otra lista olvidada.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                La revisión semanal sirve para decidir qué ideas avanzan, qué
                tareas siguen importando, qué objetivos continúan activos y qué
                proyectos necesitan atención.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="rounded-2xl">
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Iniciar revisión
                </Button>

                <Button size="lg" variant="outline" className="rounded-2xl">
                  <Archive className="mr-2 h-5 w-5" />
                  Archivar pendientes
                </Button>
              </div>
            </div>

            <Card className="relative rounded-[2rem] border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
              <p className="text-sm font-medium text-slate-400">
                Regla del módulo
              </p>
              <h3 className="mt-2 text-2xl font-semibold">
                Revisar es decidir, no acumular.
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Esta pantalla no será un historial gigante. Mostrará lo que
                necesita una decisión concreta esta semana.
              </p>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm leading-6 text-slate-300">
                  Luego conectaremos datos reales para detectar ideas nuevas,
                  tareas postergadas y proyectos sin atención.
                </p>
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {resumenRevision.map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.title}
                className="rounded-[1.75rem] border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-slate-500">
                      {item.title}
                    </p>
                    <div className="space-y-1">
                      <p className="text-4xl font-bold text-slate-950">
                        {item.value}
                      </p>
                      <p className="text-sm leading-5 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-950">
                Panel de revisión
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Aquí aparecerán los elementos que necesitan decisión.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {bloquesRevision.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="rounded-2xl bg-white p-3 text-slate-700 shadow-sm ring-1 ring-slate-200">
                        <Icon className="h-5 w-5" />
                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">
                        0
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {item.description}
                    </p>

                    <div className="mt-5 rounded-3xl border border-dashed border-slate-300 bg-white p-4 text-center">
                      <p className="text-xs leading-5 text-slate-500">
                        Sin elementos para revisar todavía.
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="grid gap-6">
            <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
                  <CircleHelp className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Preguntas guía
                  </h2>
                  <p className="text-sm text-slate-500">
                    Para revisar sin perderte.
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                {preguntasGuia.map((pregunta, index) => (
                  <div
                    key={pregunta}
                    className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-2xl bg-white text-xs font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                        {index + 1}
                      </span>
                      <p className="text-sm font-semibold text-slate-800">
                        Pregunta {index + 1}
                      </p>
                    </div>
                    <p className="text-sm leading-6 text-slate-500">
                      {pregunta}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Resultado esperado
              </h2>

              <div className="mt-5 grid gap-3">
                {[
                  "Ideas archivadas o convertidas",
                  "Tareas postergadas revisadas",
                  "Objetivos con próximo paso",
                  "Proyectos con foco claro",
                ].map((item) => (
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