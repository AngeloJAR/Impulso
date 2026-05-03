"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Lightbulb,
  Plus,
  RefreshCcw,
  Search,
} from "lucide-react";

import {
  getIdeas,
  type EstadoIdea,
  type IdeaResumen,
  type PrioridadIdea,
} from "@/features/ideas/queries";
import { cambiarEstadoIdea } from "@/features/inbox/actions";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const estadosIdea: {
  key: EstadoIdea;
  title: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    key: "nueva",
    title: "Nueva",
    description: "Ideas recién capturadas.",
    icon: Lightbulb,
  },
  {
    key: "revisar",
    title: "Revisar",
    description: "Necesitan contexto o decisión.",
    icon: RefreshCcw,
  },
  {
    key: "convertir_en_tarea",
    title: "Para tarea",
    description: "Listas para convertirse.",
    icon: ArrowRight,
  },
  {
    key: "convertida",
    title: "Convertida",
    description: "Ya son tareas.",
    icon: CheckCircle2,
  },
  {
    key: "archivada",
    title: "Archivada",
    description: "Fuera del foco actual.",
    icon: Archive,
  },
];

const prioridadStyles: Record<PrioridadIdea, string> = {
  baja: "bg-slate-100 text-slate-600 ring-slate-200",
  media: "bg-amber-100 text-amber-700 ring-amber-200",
  alta: "bg-rose-100 text-rose-700 ring-rose-200",
};

const estadoStyles: Record<EstadoIdea, string> = {
  nueva: "bg-amber-50 text-amber-700 ring-amber-100",
  revisar: "bg-sky-50 text-sky-700 ring-sky-100",
  convertir_en_tarea: "bg-violet-50 text-violet-700 ring-violet-100",
  convertida: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  archivada: "bg-slate-100 text-slate-500 ring-slate-200",
};

function formatFecha(value?: string | null) {
  if (!value) return "Sin recordatorio";

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

function getEstadoLabel(estado: EstadoIdea) {
  return estadosIdea.find((item) => item.key === estado)?.title ?? estado;
}

function IdeaCard({
  idea,
  isPending,
  updatingIdeaId,
  onCambiarEstado,
}: {
  idea: IdeaResumen;
  isPending: boolean;
  updatingIdeaId: string | null;
  onCambiarEstado: (ideaId: string, estado: EstadoIdea) => void;
}) {
  const isUpdating = isPending && updatingIdeaId === idea.id;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${
            prioridadStyles[idea.prioridad]
          }`}
        >
          {idea.prioridad}
        </span>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${
            estadoStyles[idea.estado]
          }`}
        >
          {getEstadoLabel(idea.estado)}
        </span>
      </div>

      <h4 className="line-clamp-2 text-base font-black leading-6 text-slate-950">
        {idea.titulo}
      </h4>

      {idea.descripcion ? (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
          {idea.descripcion}
        </p>
      ) : (
        <p className="mt-2 text-sm text-slate-400">Sin descripción</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {idea.proyecto ? (
          <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 ring-1 ring-sky-100">
            <FolderKanban className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{idea.proyecto.nombre}</span>
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-400 ring-1 ring-slate-200">
            Sin proyecto
          </span>
        )}

        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-400 ring-1 ring-slate-200">
          <Clock3 className="h-3.5 w-3.5" />
          {formatFecha(idea.fecha_recordatorio)}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        <label
          htmlFor={`estado-${idea.id}`}
          className="text-xs font-bold text-slate-500"
        >
          Cambiar estado
        </label>

        <select
          id={`estado-${idea.id}`}
          value={idea.estado}
          disabled={isUpdating}
          onChange={(event) =>
            onCambiarEstado(idea.id, event.target.value as EstadoIdea)
          }
          className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {estadosIdea.map((estado) => (
            <option key={estado.key} value={estado.key}>
              {estado.title}
            </option>
          ))}
        </select>

        {idea.estado === "convertir_en_tarea" ? (
          <Link href="/tareas#crear-tarea">
            <Button
              type="button"
              size="sm"
              className="h-10 w-full rounded-2xl font-bold"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Crear tarea
            </Button>
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<IdeaResumen[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [estadoActivo, setEstadoActivo] = useState<EstadoIdea | "todas">(
    "todas"
  );
  const [updatingIdeaId, setUpdatingIdeaId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  async function loadIdeas() {
    setLoadingIdeas(true);
    setError("");
    setMessage("");

    try {
      const data = await getIdeas();
      setIdeas(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudieron cargar las ideas.";

      setError(message);
    } finally {
      setLoadingIdeas(false);
    }
  }

  useEffect(() => {
    loadIdeas();
  }, []);

  function handleCambiarEstadoIdea(ideaId: string, estado: EstadoIdea) {
    setError("");
    setMessage("");
    setUpdatingIdeaId(ideaId);

    startTransition(async () => {
      try {
        await cambiarEstadoIdea(ideaId, estado);
        setMessage("Estado de idea actualizado correctamente.");
        await loadIdeas();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el estado de la idea.";

        setError(message);
      } finally {
        setUpdatingIdeaId(null);
      }
    });
  }

  const ideasPorEstado = useMemo(() => {
    return estadosIdea.reduce<Record<EstadoIdea, IdeaResumen[]>>(
      (acc, estado) => {
        acc[estado.key] = ideas.filter((idea) => idea.estado === estado.key);
        return acc;
      },
      {
        nueva: [],
        revisar: [],
        convertir_en_tarea: [],
        convertida: [],
        archivada: [],
      }
    );
  }, [ideas]);

  const ideasFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase();

    return ideas.filter((idea) => {
      const matchEstado =
        estadoActivo === "todas" || idea.estado === estadoActivo;

      const matchSearch =
        !term ||
        idea.titulo.toLowerCase().includes(term) ||
        (idea.descripcion?.toLowerCase() ?? "").includes(term) ||
        (idea.proyecto?.nombre.toLowerCase() ?? "").includes(term) ||
        idea.prioridad.toLowerCase().includes(term) ||
        idea.estado.toLowerCase().includes(term);

      return matchEstado && matchSearch;
    });
  }, [ideas, search, estadoActivo]);

  return (
    <AppShell
      title="Ideas"
      description="Pensamientos capturados que todavía no son tareas."
    >
      <div className="grid gap-4">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </div>
        ) : null}

        <section className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                <Lightbulb className="h-5 w-5" />
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-xl font-black tracking-tight text-slate-950 md:text-2xl">
                    Panel de ideas
                  </h2>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                    {loadingIdeas
                      ? "Cargando..."
                      : `${ideas.length} idea${ideas.length === 1 ? "" : "s"}`}
                  </span>
                </div>

                <p className="mt-1 text-sm leading-5 text-slate-500">
                  Revisa, filtra y convierte ideas en tareas cuando ya estén
                  claras.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row md:w-auto md:items-center">
              <div className="relative w-full md:w-[320px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar idea..."
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <Link href="/nueva-idea">
                <Button className="h-10 w-full rounded-2xl px-4 font-bold shadow-sm sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva idea
                </Button>
              </Link>

              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-2xl border-slate-200 bg-white px-4 font-bold shadow-sm"
                onClick={loadIdeas}
                disabled={loadingIdeas}
              >
                <RefreshCcw
                  className={`mr-2 h-4 w-4 ${
                    loadingIdeas ? "animate-spin" : ""
                  }`}
                />
                {loadingIdeas ? "Actualizando" : "Actualizar"}
              </Button>
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-5 md:p-6">
            {estadosIdea.map((item) => {
              const Icon = item.icon;
              const total = ideasPorEstado[item.key]?.length ?? 0;
              const active = estadoActivo === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setEstadoActivo(active ? "todas" : item.key)}
                  className={`rounded-3xl border p-4 text-left transition ${
                    active
                      ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-950 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div
                      className={`rounded-2xl p-3 ${
                        active
                          ? "bg-white/10 text-white"
                          : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        active
                          ? "bg-white/10 text-white"
                          : "bg-white text-slate-500 ring-1 ring-slate-200"
                      }`}
                    >
                      {total}
                    </span>
                  </div>

                  <h3 className="font-black">{item.title}</h3>
                  <p
                    className={`mt-1 text-sm leading-5 ${
                      active ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                {estadoActivo === "todas"
                  ? "Todas las ideas"
                  : `Ideas: ${getEstadoLabel(estadoActivo)}`}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {loadingIdeas
                  ? "Cargando ideas..."
                  : `${ideasFiltradas.length} resultado${
                      ideasFiltradas.length === 1 ? "" : "s"
                    }`}
              </p>
            </div>

            {estadoActivo !== "todas" ? (
              <button
                type="button"
                onClick={() => setEstadoActivo("todas")}
                className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 transition hover:bg-slate-200"
              >
                Limpiar filtro
              </button>
            ) : null}
          </div>

          {loadingIdeas ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-60 animate-pulse rounded-3xl border border-slate-200 bg-slate-50"
                />
              ))}
            </div>
          ) : ideas.length === 0 ? (
            <Card className="rounded-3xl border-dashed border-slate-300 bg-slate-50 p-8 text-center shadow-none">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                <Lightbulb className="h-6 w-6" />
              </div>

              <p className="text-lg font-black text-slate-900">
                Todavía no hay ideas
              </p>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Crea una nueva idea para verla aquí y decidir si se convierte en
                tarea.
              </p>

              <Link href="/nueva-idea">
                <Button className="mt-5 rounded-2xl font-bold">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear idea
                </Button>
              </Link>
            </Card>
          ) : ideasFiltradas.length === 0 ? (
            <Card className="rounded-3xl border-dashed border-slate-300 bg-slate-50 p-8 text-center shadow-none">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                <Search className="h-6 w-6" />
              </div>

              <p className="text-lg font-black text-slate-900">
                No se encontraron ideas
              </p>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Prueba con otro texto o cambia el filtro de estado.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {ideasFiltradas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  isPending={isPending}
                  updatingIdeaId={updatingIdeaId}
                  onCambiarEstado={handleCambiarEstadoIdea}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}