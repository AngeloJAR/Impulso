"use client";

import { useEffect, useState, useTransition } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  Lightbulb,
  Plus,
  Target,
} from "lucide-react";

import { crearProyecto } from "@/features/proyectos/actions";
import {
  getProyectos,
  type ProyectoResumen,
} from "@/features/proyectos/queries";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ColorProyecto =
  | "slate"
  | "amber"
  | "sky"
  | "emerald"
  | "violet"
  | "rose"
  | "indigo";

const resumenProyectos = [
  {
    title: "Proyectos activos",
    value: "0",
    description: "Espacios donde organizar ideas y tareas",
    icon: FolderKanban,
  },
  {
    title: "Ideas asociadas",
    value: "0",
    description: "Ideas conectadas a proyectos",
    icon: Lightbulb,
  },
  {
    title: "Objetivos",
    value: "0",
    description: "Metas agrupadas por proyecto",
    icon: Target,
  },
  {
    title: "Tareas",
    value: "0",
    description: "Acciones concretas vinculadas",
    icon: CheckCircle2,
  },
];

const colorStyles: Record<ColorProyecto, string> = {
  slate: "bg-slate-100 text-slate-700",
  amber: "bg-amber-100 text-amber-700",
  sky: "bg-sky-100 text-sky-700",
  emerald: "bg-emerald-100 text-emerald-700",
  violet: "bg-violet-100 text-violet-700",
  rose: "bg-rose-100 text-rose-700",
  indigo: "bg-indigo-100 text-indigo-700",
};

const coloresProyecto: { value: ColorProyecto; label: string }[] = [
  { value: "slate", label: "Slate" },
  { value: "amber", label: "Ámbar" },
  { value: "sky", label: "Azul" },
  { value: "emerald", label: "Verde" },
  { value: "violet", label: "Violeta" },
  { value: "rose", label: "Rosa" },
  { value: "indigo", label: "Índigo" },
];

function formatFecha(value: string) {
  const fecha = new Date(value);

  if (Number.isNaN(fecha.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-EC", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Guayaquil",
  }).format(fecha);
}

export default function ProyectosPage() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [color, setColor] = useState<ColorProyecto>("slate");

  const [proyectos, setProyectos] = useState<ProyectoResumen[]>([]);
  const [loadingProyectos, setLoadingProyectos] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isPending, startTransition] = useTransition();

  async function loadProyectos() {
    setLoadingProyectos(true);

    try {
      const data = await getProyectos();
      setProyectos(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los proyectos.";

      setError(message);
    } finally {
      setLoadingProyectos(false);
    }
  }

  useEffect(() => {
    loadProyectos();
  }, []);

  function resetForm() {
    setNombre("");
    setDescripcion("");
    setColor("slate");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    startTransition(async () => {
      try {
        await crearProyecto({
          nombre,
          descripcion,
          color,
        });

        resetForm();
        setMessage("Proyecto creado correctamente.");
        await loadProyectos();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo crear el proyecto.";

        setError(message);
      }
    });
  }

  const resumenConValores = resumenProyectos.map((item) => {
    if (item.title === "Proyectos activos") {
      return {
        ...item,
        value: String(
          proyectos.filter((proyecto) => proyecto.estado === "activo").length
        ),
      };
    }

    return item;
  });

  return (
    <AppShell
      title="Proyectos"
      description="Organiza tus ideas, objetivos y tareas dentro de espacios claros."
    >
      <div className="grid gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_360px] md:p-8">
            <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-sky-100 blur-3xl" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                <FolderKanban className="h-4 w-4" />
                Centro de proyectos
              </div>

              <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                Cada idea importante necesita un lugar donde crecer.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                Los proyectos evitan que tus ideas queden sueltas. Aquí puedes
                crear espacios reales para agrupar ideas, objetivos, tareas,
                fechas y recordatorios.
              </p>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-600">
                  Ya estamos conectados con Supabase. Los proyectos que crees
                  aquí se guardan con tu usuario autenticado.
                </p>
              </div>
            </div>

            <Card className="relative rounded-[2rem] border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
              <p className="text-sm font-medium text-slate-400">
                Regla del módulo
              </p>
              <h3 className="mt-2 text-2xl font-semibold">
                Un proyecto no es una lista.
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Un proyecto agrupa intención: ideas, objetivos, tareas, fechas y
                recordatorios.
              </p>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm leading-6 text-slate-300">
                  Después usaremos estos proyectos en el Inbox para asociar
                  ideas sin escribir UUIDs manuales.
                </p>
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {resumenConValores.map((item) => {
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

        <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-950">
                Proyectos reales
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Estos proyectos vienen desde Supabase y pertenecen a tu usuario.
              </p>
            </div>

            {loadingProyectos ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-sm font-medium text-slate-500">
                  Cargando proyectos...
                </p>
              </div>
            ) : proyectos.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <p className="font-semibold text-slate-800">
                  Todavía no hay proyectos creados
                </p>
                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                  Crea tu primer proyecto desde el formulario de la derecha.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {proyectos.map((proyecto) => (
                  <div
                    key={proyecto.id}
                    className="group rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div
                        className={`rounded-2xl p-3 ${
                          colorStyles[proyecto.color]
                        }`}
                      >
                        <FolderKanban className="h-5 w-5" />
                      </div>

                      <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-700" />
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">
                        {proyecto.estado}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">
                        {formatFecha(proyecto.created_at)}
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-950">
                      {proyecto.nombre}
                    </h3>

                    {proyecto.descripcion ? (
                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                        {proyecto.descripcion}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-slate-400">
                        Sin descripción
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          <aside className="grid gap-6">
            <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-950">
                  Nuevo proyecto
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Crea un espacio para organizar ideas, objetivos y tareas.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="nombre"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Nombre
                  </label>
                  <Input
                    id="nombre"
                    name="nombre"
                    placeholder="Ej: Marketing"
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                    className="rounded-2xl"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="descripcion"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Descripción opcional
                  </label>
                  <Textarea
                    id="descripcion"
                    name="descripcion"
                    placeholder="¿Para qué existe este proyecto?"
                    value={descripcion}
                    onChange={(event) => setDescripcion(event.target.value)}
                    className="min-h-28 rounded-2xl"
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="color"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Color
                  </label>
                  <select
                    id="color"
                    name="color"
                    value={color}
                    onChange={(event) =>
                      setColor(event.target.value as ColorProyecto)
                    }
                    className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs outline-none transition focus:border-slate-400"
                  >
                    {coloresProyecto.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {message ? (
                  <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    {message}
                  </div>
                ) : null}

                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                  </div>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  className="rounded-2xl"
                  disabled={isPending}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  {isPending ? "Creando..." : "Crear proyecto"}
                </Button>
              </form>
            </Card>

            <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-950">
                Estructura de un proyecto
              </h2>

              <div className="mt-5 grid gap-3">
                {[
                  "Ideas asociadas",
                  "Objetivos activos",
                  "Tareas pendientes",
                  "Fechas y recordatorios",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200">
                      {index + 1}
                    </span>
                    <p className="text-sm font-medium text-slate-700">
                      {item}
                    </p>
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