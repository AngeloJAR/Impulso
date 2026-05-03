"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  Lightbulb,
  Plus,
  RefreshCcw,
  Search,
  Target,
} from "lucide-react";

import { crearProyecto } from "@/features/proyectos/actions";
import { getProyectos, type ProyectoResumen } from "@/features/proyectos/queries";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ColorProyecto = "slate" | "amber" | "sky" | "emerald" | "violet" | "rose" | "indigo";

const colorStyles: Record<ColorProyecto, string> = {
  slate: "bg-slate-200/20 text-slate-100 ring-white/10",
  amber: "bg-amber-300/20 text-amber-100 ring-amber-200/20",
  sky: "bg-sky-300/20 text-sky-100 ring-sky-200/20",
  emerald: "bg-emerald-300/20 text-emerald-100 ring-emerald-200/20",
  violet: "bg-violet-300/20 text-violet-100 ring-violet-200/20",
  rose: "bg-rose-300/20 text-rose-100 ring-rose-200/20",
  indigo: "bg-indigo-300/20 text-indigo-100 ring-indigo-200/20",
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

const inputClassName =
  "rounded-2xl border-white/10 bg-white/10 text-white placeholder:text-slate-400 shadow-sm backdrop-blur-xl focus:border-white/30 focus:ring-4 focus:ring-white/10";

const textareaClassName =
  "min-h-28 rounded-2xl border-white/10 bg-white/10 text-white placeholder:text-slate-400 shadow-sm backdrop-blur-xl focus:border-white/30 focus:ring-4 focus:ring-white/10";

const selectClassName =
  "h-10 rounded-2xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white shadow-sm outline-none transition focus:border-white/30 focus:ring-4 focus:ring-white/10";

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

export default function ProyectosPage() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [color, setColor] = useState<ColorProyecto>("slate");
  const [search, setSearch] = useState("");

  const [proyectos, setProyectos] = useState<ProyectoResumen[]>([]);
  const [loadingProyectos, setLoadingProyectos] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [isPending, startTransition] = useTransition();

  const loadProyectos = useCallback(async () => {
    setLoadingProyectos(true);
    setError("");

    try {
      const data = await getProyectos();
      setProyectos(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron cargar los proyectos.";

      setError(message);
    } finally {
      setLoadingProyectos(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProyectos();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadProyectos]);

  const proyectosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return proyectos;

    return proyectos.filter((proyecto) => {
      const nombreProyecto = proyecto.nombre.toLowerCase();
      const descripcionProyecto = proyecto.descripcion?.toLowerCase() ?? "";
      const estadoProyecto = proyecto.estado.toLowerCase();

      return (
        nombreProyecto.includes(term) ||
        descripcionProyecto.includes(term) ||
        estadoProyecto.includes(term)
      );
    });
  }, [proyectos, search]);

  const proyectosActivos = useMemo(() => {
    return proyectos.filter((proyecto) => proyecto.estado === "activo").length;
  }, [proyectos]);

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
        const proyecto = await crearProyecto({
          nombre,
          descripcion,
          color,
        });

        resetForm();
        setMessage("Proyecto creado correctamente.");
        await loadProyectos();

        if (proyecto?.id) {
          router.push(`/proyectos/${proyecto.id}`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudo crear el proyecto.";

        setError(message);
      }
    });
  }

  return (
    <AppShell
      title="Proyectos"
      description="Crea espacios para organizar ideas, objetivos, tareas y fechas."
    >
      <div className="grid gap-6 text-white">
        {error ? (
          <div className="rounded-2xl border border-red-300/30 bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100 backdrop-blur-xl">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-2xl border border-emerald-300/30 bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-100 backdrop-blur-xl">
            {message}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/48 shadow-[0_24px_90px_rgba(2,6,23,0.35)] backdrop-blur-2xl">
          <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_340px] md:p-8">
            <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-sky-400/20 blur-3xl" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-bold text-slate-100 shadow-sm backdrop-blur-xl">
                <FolderKanban className="h-4 w-4 text-sky-200" />
                Centro de proyectos
              </div>

              <h1 className="max-w-3xl text-3xl font-black tracking-tight text-white drop-shadow-sm md:text-5xl">
                Cada idea importante necesita un lugar donde crecer.
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
                Un proyecto agrupa ideas, objetivos, tareas, fechas y recordatorios. Desde aquí
                entras al detalle del proyecto para trabajar el flujo completo.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  className="rounded-2xl bg-white text-slate-950 shadow-sm hover:bg-slate-100"
                  onClick={() => {
                    document
                      .getElementById("crear-proyecto")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo proyecto
                </Button>

                <Button
                  variant="outline"
                  className="rounded-2xl border-white/15 bg-white/10 text-white shadow-sm backdrop-blur-xl hover:bg-white/15"
                  onClick={() => void loadProyectos()}
                  disabled={loadingProyectos}
                >
                  <RefreshCcw
                    className={`mr-2 h-4 w-4 ${loadingProyectos ? "animate-spin" : ""}`}
                  />
                  {loadingProyectos ? "Actualizando..." : "Actualizar"}
                </Button>
              </div>
            </div>

            <Card className="relative rounded-[2rem] border-white/10 bg-slate-950/72 p-6 text-white shadow-[0_18px_70px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <p className="text-sm font-semibold text-slate-300">Flujo dentro de un proyecto</p>

              <div className="mt-5 grid gap-3">
                {["Proyecto", "Objetivos", "Tareas", "Calendario"].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-xs font-black text-slate-950 shadow-sm">
                        {index + 1}
                      </span>

                      <span className="text-sm font-semibold text-white">{item}</span>
                    </div>

                    {index < 3 ? <ArrowRight className="h-4 w-4 text-slate-300" /> : null}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              value: proyectosActivos,
              title: "Proyectos activos",
              description: "Espacios donde organizar ideas y tareas.",
              icon: FolderKanban,
            },
            {
              value: proyectos.length,
              title: "Total proyectos",
              description: "Todos los espacios creados.",
              icon: CheckCircle2,
            },
            {
              value: 0,
              title: "Objetivos",
              description: "Metas agrupadas por proyecto.",
              icon: Target,
            },
            {
              value: 0,
              title: "Ideas asociadas",
              description: "Ideas conectadas a proyectos.",
              icon: Lightbulb,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Card
                key={item.title}
                className="rounded-[1.75rem] border-white/10 bg-white/10 p-5 text-white shadow-[0_18px_70px_rgba(2,6,23,0.18)] backdrop-blur-2xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-3xl font-black text-white">{item.value}</p>

                    <h3 className="mt-2 text-sm font-bold text-slate-100">{item.title}</h3>

                    <p className="mt-1 text-xs leading-5 text-slate-300">{item.description}</p>
                  </div>

                  <div className="rounded-2xl bg-white/15 p-3 text-slate-100 ring-1 ring-white/10">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
          <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-white">Proyectos reales</h2>

                <p className="mt-1 text-sm text-slate-300">
                  Entra a un proyecto para crear objetivos y tareas.
                </p>
              </div>

              <div className="relative w-full sm:w-[300px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar proyecto..."
                  className="h-10 w-full rounded-2xl border border-white/10 bg-white/10 pl-10 pr-4 text-sm font-semibold text-white outline-none backdrop-blur-xl transition placeholder:text-slate-300 focus:border-white/30 focus:bg-white/15 focus:ring-4 focus:ring-white/10"
                />
              </div>
            </div>

            {loadingProyectos ? (
              <div className="rounded-3xl border border-dashed border-white/20 bg-white/10 p-6 text-center backdrop-blur-xl">
                <p className="text-sm font-medium text-slate-200">Cargando proyectos...</p>
              </div>
            ) : proyectos.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/20 bg-white/10 p-6 text-center backdrop-blur-xl">
                <FolderKanban className="mx-auto mb-3 h-8 w-8 text-slate-300" />

                <p className="font-semibold text-white">Todavía no hay proyectos creados</p>

                <p className="mt-1 text-sm text-slate-300">
                  Crea tu primer proyecto desde el formulario de la derecha.
                </p>
              </div>
            ) : proyectosFiltrados.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/20 bg-white/10 p-6 text-center backdrop-blur-xl">
                <Search className="mx-auto mb-3 h-8 w-8 text-slate-300" />

                <p className="font-semibold text-white">No se encontraron proyectos</p>

                <p className="mt-1 text-sm text-slate-300">Prueba con otro nombre o estado.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {proyectosFiltrados.map((proyecto) => (
                  <Link
                    key={proyecto.id}
                    href={`/proyectos/${proyecto.id}`}
                    className="group rounded-3xl border border-white/10 bg-white/10 p-5 text-white shadow-[0_18px_70px_rgba(2,6,23,0.18)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/15 hover:shadow-[0_24px_90px_rgba(2,6,23,0.26)]"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div
                        className={`rounded-2xl p-3 ring-1 ${
                          colorStyles[proyecto.color as ColorProyecto] ?? colorStyles.slate
                        }`}
                      >
                        <FolderKanban className="h-5 w-5" />
                      </div>

                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 text-slate-200 shadow-sm ring-1 ring-white/10 transition group-hover:bg-white group-hover:text-slate-950">
                        <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>

                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold capitalize text-slate-100 shadow-sm backdrop-blur-xl">
                        {proyecto.estado}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-slate-200 shadow-sm backdrop-blur-xl">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatFecha(proyecto.created_at)}
                      </span>
                    </div>

                    <h3 className="line-clamp-2 text-lg font-black leading-6 text-white">
                      {proyecto.nombre}
                    </h3>

                    {proyecto.descripcion ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-200">
                        {proyecto.descripcion}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-slate-300">Sin descripción</p>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-bold text-slate-300">
                      <span>Entrar al proyecto</span>

                      <span className="text-slate-400 transition group-hover:text-white">
                        Objetivos y tareas
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <aside className="grid gap-6">
            <Card
              id="crear-proyecto"
              className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-slate-950 shadow-sm">
                  <Plus className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">Nuevo proyecto</h2>

                  <p className="text-sm text-slate-300">
                    Crea un espacio para organizar ideas, objetivos y tareas.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="nombre" className="text-sm font-semibold text-slate-100">
                    Nombre
                  </label>

                  <Input
                    id="nombre"
                    name="nombre"
                    value={nombre}
                    onChange={(event) => setNombre(event.target.value)}
                    className={inputClassName}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="descripcion" className="text-sm font-semibold text-slate-100">
                    Descripción opcional
                  </label>

                  <Textarea
                    id="descripcion"
                    name="descripcion"
                    value={descripcion}
                    onChange={(event) => setDescripcion(event.target.value)}
                    className={textareaClassName}
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="color" className="text-sm font-semibold text-slate-100">
                    Color
                  </label>

                  <select
                    id="color"
                    name="color"
                    value={color}
                    onChange={(event) => setColor(event.target.value as ColorProyecto)}
                    className={selectClassName}
                  >
                    {coloresProyecto.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100"
                  disabled={isPending}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  {isPending ? "Creando..." : "Crear proyecto"}
                </Button>
              </form>
            </Card>

            <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <h2 className="text-lg font-black text-white">Estructura de un proyecto</h2>

              <div className="mt-5 grid gap-3">
                {[
                  "Ideas asociadas",
                  "Objetivos activos",
                  "Tareas pendientes",
                  "Fechas y recordatorios",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-white text-sm font-bold text-slate-950 shadow-sm ring-1 ring-white/20">
                      {index + 1}
                    </span>

                    <p className="text-sm font-semibold text-slate-100">{item}</p>
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