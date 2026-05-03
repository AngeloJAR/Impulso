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
      <div className="grid gap-6 text-white">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/48 shadow-[0_24px_90px_rgba(2,6,23,0.35)] backdrop-blur-2xl">
          <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_340px] md:p-8">
            <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-rose-400/20 blur-3xl" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-200/20 bg-rose-300/15 px-4 py-2 text-sm font-semibold text-rose-100 shadow-sm backdrop-blur-xl">
                <RotateCcw className="h-4 w-4" />
                Ritual de claridad
              </div>

              <h2 className="max-w-2xl text-3xl font-black tracking-tight text-white drop-shadow-sm md:text-4xl">
                Revisar evita que tu sistema se vuelva otra lista olvidada.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
                La revisión semanal sirve para decidir qué ideas avanzan, qué
                tareas siguen importando, qué objetivos continúan activos y qué
                proyectos necesitan atención.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="rounded-2xl bg-white text-slate-950 shadow-sm hover:bg-slate-100"
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Iniciar revisión
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-2xl border-white/15 bg-white/10 text-white shadow-sm backdrop-blur-xl hover:bg-white/15"
                >
                  <Archive className="mr-2 h-5 w-5" />
                  Archivar pendientes
                </Button>
              </div>
            </div>

            <Card className="relative rounded-[2rem] border-white/10 bg-slate-950/72 p-6 text-white shadow-[0_18px_70px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <p className="text-sm font-semibold text-slate-300">
                Regla del módulo
              </p>

              <h3 className="mt-2 text-2xl font-black text-white">
                Revisar es decidir, no acumular.
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Esta pantalla no será un historial gigante. Mostrará lo que
                necesita una decisión concreta esta semana.
              </p>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
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
                className="rounded-[1.75rem] border-white/10 bg-white/10 p-5 text-white shadow-[0_18px_70px_rgba(2,6,23,0.18)] backdrop-blur-2xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-300">
                      {item.title}
                    </p>

                    <div className="space-y-1">
                      <p className="text-4xl font-black text-white">
                        {item.value}
                      </p>

                      <p className="text-sm leading-5 text-slate-300">
                        {item.description}
                      </p>
                    </div>
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
                Panel de revisión
              </h2>

              <p className="mt-1 text-sm text-slate-300">
                Aquí aparecerán los elementos que necesitan decisión.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {bloquesRevision.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="rounded-2xl bg-white/15 p-3 text-slate-100 shadow-sm ring-1 ring-white/10">
                        <Icon className="h-5 w-5" />
                      </div>

                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-black text-slate-100 backdrop-blur-xl">
                        0
                      </span>
                    </div>

                    <h3 className="font-black text-white">{item.title}</h3>

                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {item.description}
                    </p>

                    <div className="mt-5 rounded-3xl border border-dashed border-white/20 bg-white/10 p-4 text-center backdrop-blur-xl">
                      <p className="text-xs leading-5 text-slate-300">
                        Sin elementos para revisar todavía.
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="grid gap-6">
            <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-rose-300/20 p-3 text-rose-100 ring-1 ring-rose-200/20">
                  <CircleHelp className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">
                    Preguntas guía
                  </h2>

                  <p className="text-sm text-slate-300">
                    Para revisar sin perderte.
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                {preguntasGuia.map((pregunta, index) => (
                  <div
                    key={pregunta}
                    className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-2xl bg-white text-xs font-black text-slate-950 shadow-sm ring-1 ring-white/20">
                        {index + 1}
                      </span>

                      <p className="text-sm font-semibold text-slate-100">
                        Pregunta {index + 1}
                      </p>
                    </div>

                    <p className="text-sm leading-6 text-slate-300">
                      {pregunta}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <h2 className="text-lg font-black text-white">
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