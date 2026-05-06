"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
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
import { theme } from "@/config/theme";
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
  baja: theme.states.prioridad.baja,
  media: theme.states.prioridad.media,
  alta: theme.states.prioridad.alta,
};

const estadoStyles: Record<EstadoIdea, string> = {
  nueva: "bg-amber-50 text-amber-700 ring-amber-100",
  revisar: "bg-sky-50 text-sky-700 ring-sky-100",
  convertir_en_tarea: "bg-violet-50 text-violet-700 ring-violet-100",
  convertida: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  archivada: "bg-slate-100 text-slate-600 ring-slate-200",
};

function formatFecha(value?: string | null) {
  if (!value) return "Sin recordatorio";

  const fecha = new Date(`${value}T00:00:00`);

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
    <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/30">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`${theme.badge.base} ${prioridadStyles[idea.prioridad]}`}>
          {idea.prioridad}
        </span>

        <span className={`${theme.badge.base} ${estadoStyles[idea.estado]}`}>
          {getEstadoLabel(idea.estado)}
        </span>
      </div>

      <h4 className="line-clamp-2 text-base font-black leading-6 text-slate-950">
        {idea.titulo}
      </h4>

      {idea.descripcion ? (
        <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-slate-600">
          {idea.descripcion}
        </p>
      ) : (
        <p className="mt-2 text-sm font-medium text-slate-400">Sin descripción</p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {idea.proyecto ? (
          <span
            className={`${theme.badge.base} ${theme.badge.sky} inline-flex max-w-full items-center gap-1.5 normal-case tracking-normal`}
          >
            <FolderKanban className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{idea.proyecto.nombre}</span>
          </span>
        ) : (
          <span className={`${theme.badge.base} bg-slate-100 text-slate-500 ring-slate-200`}>
            Sin proyecto
          </span>
        )}

        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
          <Clock3 className="h-3.5 w-3.5" />
          {formatFecha(idea.fecha_recordatorio)}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        <label htmlFor={`estado-${idea.id}`} className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">
          Cambiar estado
        </label>

        <select
          id={`estado-${idea.id}`}
          value={idea.estado}
          disabled={isUpdating}
          onChange={(event) => onCambiarEstado(idea.id, event.target.value as EstadoIdea)}
          className={theme.input.select}
        >
          {estadosIdea.map((estado) => (
            <option key={estado.key} value={estado.key}>
              {estado.title}
            </option>
          ))}
        </select>

        {idea.estado === "convertir_en_tarea" ? (
          <Link href="/tareas#crear-tarea">
            <Button type="button" size="sm" className="h-10 w-full rounded-2xl bg-blue-600 font-bold text-white hover:bg-blue-700">
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
  const [estadoActivo, setEstadoActivo] = useState<EstadoIdea | "todas">("todas");
  const [updatingIdeaId, setUpdatingIdeaId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const loadIdeas = useCallback(async () => {
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
  }, []);

useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void loadIdeas();
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [loadIdeas]);

  function handleCambiarEstadoIdea(ideaId: string, estado: EstadoIdea) {
    setError("");
    setMessage("");
    setUpdatingIdeaId(ideaId);

    startTransition(() => {
      void (async () => {
        try {
          await cambiarEstadoIdea(ideaId, estado);
          setMessage("Estado de idea actualizado correctamente.");
          await loadIdeas();
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "No se pudo actualizar el estado de la idea.";

          setError(message);
        } finally {
          setUpdatingIdeaId(null);
        }
      })();
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
      const matchEstado = estadoActivo === "todas" || idea.estado === estadoActivo;

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
    <AppShell title="Ideas" description="Pensamientos capturados que todavía no son tareas.">
      <div className="space-y-5">
        {error ? <div className={theme.alerts.error}>{error}</div> : null}

        {message ? (
          <div className={`flex items-center gap-2 ${theme.alerts.success}`}>
            <CheckCircle2 className="h-4 w-4" />
            {message}
          </div>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <Card className={theme.card.hero}>
            <div className={theme.hero.wrapper}>
              <div className={theme.hero.glow} />

              <div className={theme.hero.content}>
                <div className={theme.hero.badge}>
                  <Lightbulb className="h-4 w-4" />
                  Panel de ideas
                </div>

                <h2 className={theme.hero.title}>
                  Captura ideas y decide cuándo convertirlas en acción.
                </h2>

                <p className={theme.hero.description}>
                  Aquí puedes revisar tus ideas, filtrarlas por estado y moverlas
                  hacia tareas cuando ya estén listas para ejecutarse.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/nueva-idea">
                    <Button className={theme.button.primaryLarge}>
                      <Plus className="mr-2 h-4 w-4" />
                      Nueva idea
                    </Button>
                  </Link>

                  <Button
                    type="button"
                    variant="outline"
                    className={theme.button.secondaryLarge}
                    onClick={() => void loadIdeas()}
                    disabled={loadingIdeas}
                  >
                    <RefreshCcw
                      className={`mr-2 h-4 w-4 ${loadingIdeas ? "animate-spin" : ""}`}
                    />
                    {loadingIdeas ? "Actualizando" : "Actualizar"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className={theme.card.base}>
            <p className={theme.text.kicker}>Resumen</p>

            <div className="mt-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-5xl font-black text-slate-950">
                  {loadingIdeas ? "..." : ideas.length}
                </p>

                <p className={`${theme.text.body} mt-2`}>
                  Idea{ideas.length === 1 ? "" : "s"} capturada{ideas.length === 1 ? "" : "s"}.
                </p>
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                <Lightbulb className="h-6 w-6" />
              </div>
            </div>

            <div className="relative mt-5">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar idea..."
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {estadosIdea.map((item) => {
            const Icon = item.icon;
            const total = ideasPorEstado[item.key]?.length ?? 0;
            const active = estadoActivo === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setEstadoActivo(active ? "todas" : item.key)}
                className={`rounded-[1.7rem] border p-5 text-left transition ${
                  active
                    ? "border-blue-200 bg-blue-50 text-blue-950 shadow-sm"
                    : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-200 hover:bg-blue-50/40"
                }`}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div
                    className={`rounded-2xl p-3 ring-1 ${
                      active
                        ? "bg-blue-600 text-white ring-blue-600"
                        : "bg-slate-50 text-slate-600 ring-slate-200"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      active
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {total}
                  </span>
                </div>

                <h3 className="font-black">{item.title}</h3>

                <p className="mt-1 text-sm leading-5 text-slate-600">
                  {item.description}
                </p>
              </button>
            );
          })}
        </section>

        <section className={theme.card.base}>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className={theme.text.kicker}>
                {estadoActivo === "todas"
                  ? "Todas las ideas"
                  : `Ideas: ${getEstadoLabel(estadoActivo)}`}
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Ideas registradas
              </h2>

              <p className={`${theme.text.body} mt-1`}>
                {loadingIdeas
                  ? "Cargando ideas..."
                  : `${ideasFiltradas.length} resultado${ideasFiltradas.length === 1 ? "" : "s"}`}
              </p>
            </div>

            {estadoActivo !== "todas" ? (
              <button
                type="button"
                onClick={() => setEstadoActivo("todas")}
                className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"
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
                  className="h-60 animate-pulse rounded-[1.7rem] border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          ) : ideas.length === 0 ? (
            <Card className={theme.card.empty}>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                <Lightbulb className="h-6 w-6" />
              </div>

              <p className="text-lg font-black text-slate-950">Todavía no hay ideas</p>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Crea una nueva idea para verla aquí y decidir si se convierte en tarea.
              </p>

              <Link href="/nueva-idea">
                <Button className={`${theme.button.primary} mt-5`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear idea
                </Button>
              </Link>
            </Card>
          ) : ideasFiltradas.length === 0 ? (
            <Card className={theme.card.empty}>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-100 text-slate-500 ring-1 ring-slate-200">
                <Search className="h-6 w-6" />
              </div>

              <p className="text-lg font-black text-slate-950">No se encontraron ideas</p>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
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