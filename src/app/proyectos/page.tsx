"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FolderKanban,
  LayoutGrid,
  Lightbulb,
  ListTodo,
  Plus,
  RefreshCcw,
  Search,
  Target,
} from "lucide-react";

import { crearProyecto } from "@/features/proyectos/actions";
import {
  getProyectos,
  type ProyectoResumen,
} from "@/features/proyectos/queries";
import { theme } from "@/config/theme";
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

type FiltroEstado = "todos" | ProyectoResumen["estado"];

const coloresProyecto: { value: ColorProyecto; label: string }[] = [
  { value: "slate", label: "Slate" },
  { value: "amber", label: "Ámbar" },
  { value: "sky", label: "Azul" },
  { value: "emerald", label: "Verde" },
  { value: "violet", label: "Violeta" },
  { value: "rose", label: "Rosa" },
  { value: "indigo", label: "Índigo" },
];

const colorStyles: Record<ColorProyecto, string> = {
  slate: theme.badge.slate,
  amber: theme.badge.amber,
  sky: theme.badge.sky,
  emerald: theme.badge.emerald,
  violet: theme.badge.violet,
  rose: theme.badge.rose,
  indigo: theme.badge.violet,
};

const estadoStyles: Record<ProyectoResumen["estado"], string> = {
  activo: theme.states.proyecto.activo,
  pausado: theme.states.proyecto.pausado,
  completado: theme.states.proyecto.completado,
  archivado: theme.states.proyecto.archivado,
};

const filtros: { value: FiltroEstado; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "activo", label: "Activos" },
  { value: "pausado", label: "Pausados" },
  { value: "completado", label: "Completados" },
  { value: "archivado", label: "Archivados" },
];

function formatFecha(value: string) {
  const fecha = new Date(`${value}T00:00:00`);

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

function capitalizar(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function ProyectosPage() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [color, setColor] = useState<ColorProyecto>("slate");
  const [proyectos, setProyectos] = useState<ProyectoResumen[]>([]);
  const [loadingProyectos, setLoadingProyectos] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<FiltroEstado>("todos");
  const [isPending, startTransition] = useTransition();

  const loadProyectos = useCallback(async () => {
    setLoadingProyectos(true);
    setError("");

    try {
      const data = await getProyectos();
      setProyectos(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudieron cargar los proyectos.";

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

  function resetForm() {
    setNombre("");
    setDescripcion("");
    setColor("slate");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    startTransition(() => {
      void (async () => {
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
      })();
    });
  }

  const metricas = useMemo(() => {
    return {
      total: proyectos.length,
      activos: proyectos.filter((proyecto) => proyecto.estado === "activo")
        .length,
      pausados: proyectos.filter((proyecto) => proyecto.estado === "pausado")
        .length,
      completados: proyectos.filter(
        (proyecto) => proyecto.estado === "completado"
      ).length,
      archivados: proyectos.filter((proyecto) => proyecto.estado === "archivado")
        .length,
    };
  }, [proyectos]);

  const proyectosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();

    return proyectos.filter((proyecto) => {
      const coincideEstado =
        estadoFiltro === "todos" || proyecto.estado === estadoFiltro;

      const coincideBusqueda =
        !term ||
        proyecto.nombre.toLowerCase().includes(term) ||
        proyecto.estado.toLowerCase().includes(term) ||
        proyecto.color.toLowerCase().includes(term) ||
        (proyecto.descripcion?.toLowerCase().includes(term) ?? false);

      return coincideEstado && coincideBusqueda;
    });
  }, [estadoFiltro, proyectos, search]);

  return (
    <AppShell
      title="Proyectos"
      description="Crea espacios reales para organizar ideas, objetivos, tareas, fechas y recordatorios."
    >
      <div className="space-y-5">
        {message ? (
          <div className={`flex items-center gap-2 ${theme.alerts.success}`}>
            <CheckCircle2 className="h-4 w-4" />
            {message}
          </div>
        ) : null}

        {error ? <div className={theme.alerts.error}>{error}</div> : null}

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className={theme.card.hero}>
            <div className={theme.hero.wrapper}>
              <div className={theme.hero.glow} />

              <div className={theme.hero.content}>
                <div className={theme.hero.badge}>
                  <FolderKanban className="h-4 w-4" />
                  Centro de proyectos
                </div>

                <h2 className={theme.hero.title}>
                  Cada idea importante necesita un lugar donde crecer.
                </h2>

                <p className={theme.hero.description}>
                  Un proyecto agrupa intención: ideas, objetivos, tareas, fechas
                  y recordatorios. Desde aquí puedes crear espacios y entrar a
                  trabajar cada uno.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      label: "Total",
                      value: metricas.total,
                      className: "text-slate-600",
                    },
                    {
                      label: "Activos",
                      value: metricas.activos,
                      className: "text-emerald-700",
                    },
                    {
                      label: "Pausados",
                      value: metricas.pausados,
                      className: "text-amber-700",
                    },
                    {
                      label: "Completados",
                      value: metricas.completados,
                      className: "text-sky-700",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-sm"
                    >
                      <p className="text-3xl font-black text-slate-950">
                        {item.value}
                      </p>
                      <p
                        className={`mt-1 text-xs font-bold uppercase tracking-[0.18em] ${item.className}`}
                      >
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card className={theme.card.base}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={theme.text.kicker}>Nuevo proyecto</p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Crea un espacio
                </h2>

                <p className={`${theme.text.body} mt-2`}>
                  Úsalo para agrupar ideas, objetivos y tareas de un mismo tema.
                </p>
              </div>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                <Plus className="h-5 w-5" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid gap-2">
                <label
                  htmlFor="nombre"
                  className="text-sm font-black text-slate-700"
                >
                  Nombre
                </label>

                <Input
                  id="nombre"
                  name="nombre"
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                  placeholder="Ej: App Impulso, Negocio, Permacultura..."
                  className={theme.input.base}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="descripcion"
                  className="text-sm font-black text-slate-700"
                >
                  Descripción opcional
                </label>

                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={descripcion}
                  onChange={(event) => setDescripcion(event.target.value)}
                  placeholder="Describe para qué existe este proyecto..."
                  className={theme.input.textarea}
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="color"
                  className="text-sm font-black text-slate-700"
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
                  className={theme.input.select}
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
                className="h-12 w-full rounded-2xl bg-blue-600 text-sm font-black text-white hover:bg-blue-700"
                disabled={isPending}
              >
                <Plus className="mr-2 h-5 w-5" />
                {isPending ? "Creando..." : "Crear proyecto"}
              </Button>
            </form>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            {
              title: "Ideas",
              description: "Puntos de partida",
              icon: Lightbulb,
              iconClass: "bg-violet-50 text-violet-700 ring-violet-100",
            },
            {
              title: "Objetivos",
              description: "Dirección clara",
              icon: Target,
              iconClass: "bg-emerald-50 text-emerald-700 ring-emerald-100",
            },
            {
              title: "Tareas",
              description: "Acciones concretas",
              icon: ListTodo,
              iconClass: "bg-sky-50 text-sky-700 ring-sky-100",
            },
            {
              title: "Fechas",
              description: "Recordatorios",
              icon: Clock3,
              iconClass: "bg-amber-50 text-amber-700 ring-amber-100",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.title} className={theme.card.base}>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ${item.iconClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-950">
                      {item.title}
                    </p>
                    <p className="text-xs font-medium text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </section>

        <Card className={theme.card.base}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className={theme.text.kicker}>Proyectos reales</p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Lista de proyectos
              </h2>

              <p className={`${theme.text.body} mt-2 max-w-2xl`}>
                Entra a un proyecto para ver sus objetivos, tareas y avance.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className={theme.button.secondary}
              onClick={() => void loadProyectos()}
              disabled={loadingProyectos}
            >
              <RefreshCcw
                className={`mr-2 h-4 w-4 ${loadingProyectos ? "animate-spin" : ""
                  }`}
              />
              {loadingProyectos ? "Actualizando" : "Actualizar"}
            </Button>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nombre, descripción, estado o color..."
                className={theme.input.search}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {filtros.map((filtro) => {
                const active = estadoFiltro === filtro.value;

                return (
                  <button
                    key={filtro.value}
                    type="button"
                    onClick={() => setEstadoFiltro(filtro.value)}
                    className={`h-12 rounded-2xl px-4 text-sm font-black transition ${active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-950"
                      }`}
                  >
                    {filtro.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            {loadingProyectos ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="h-52 animate-pulse rounded-[1.5rem] border border-slate-200 bg-slate-100"
                  />
                ))}
              </div>
            ) : proyectos.length === 0 ? (
              <div className={theme.card.empty}>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                  <FolderKanban className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-xl font-black text-slate-950">
                  Todavía no hay proyectos creados
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-600">
                  Crea tu primer proyecto desde el formulario superior.
                </p>
              </div>
            ) : proyectosFiltrados.length === 0 ? (
              <div className={theme.card.empty}>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                  <Search className="h-6 w-6" />
                </div>

                <h3 className="mt-4 text-xl font-black text-slate-950">
                  No se encontraron proyectos
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-600">
                  Cambia el texto de búsqueda o selecciona otro filtro.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {proyectosFiltrados.map((proyecto) => (
                  <Link
                    key={proyecto.id}
                    href={`/proyectos/${proyecto.id}`}
                    className="group rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                        <LayoutGrid className="h-5 w-5" />
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        <span
                          className={`${theme.badge.base} ${estadoStyles[proyecto.estado]
                            }`}
                        >
                          {capitalizar(proyecto.estado)}
                        </span>

                        <span
                          className={`${theme.badge.base} ${colorStyles[proyecto.color]
                            }`}
                        >
                          {proyecto.color}
                        </span>
                      </div>
                    </div>

                    <h3 className="mt-5 text-xl font-black text-slate-950">
                      {proyecto.nombre}
                    </h3>

                    <p className="mt-2 min-h-12 text-sm font-medium leading-6 text-slate-600">
                      {proyecto.descripcion || "Sin descripción"}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                      <span className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <Clock3 className="h-4 w-4" />
                        {formatFecha(proyecto.created_at)}
                      </span>

                      <span className="flex items-center gap-2 text-sm font-black text-blue-700">
                        Abrir
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}