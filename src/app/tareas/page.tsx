"use client";

import {
  Suspense,
  type ElementType,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Filter,
  FolderKanban,
  ListTodo,
  PlayCircle,
  Plus,
  RefreshCcw,
  Search,
  Target,
} from "lucide-react";

import { cambiarEstadoTarea, crearTarea } from "@/features/tareas/actions";
import {
  getTareas,
  type EstadoTarea,
  type PrioridadTarea,
  type TareaResumen,
} from "@/features/tareas/queries";
import { getProyectos, type ProyectoResumen } from "@/features/proyectos/queries";
import {
  getObjetivosParaSelector,
  type ObjetivoSelector,
} from "@/features/objetivos/queries";

import { theme } from "@/config/theme";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FiltroEstado = "todos" | EstadoTarea;
type FiltroPrioridad = "todas" | PrioridadTarea;

const estadosTarea: {
  key: EstadoTarea;
  title: string;
  description: string;
  icon: ElementType;
}[] = [
    {
      key: "pendiente",
      title: "Pendiente",
      description: "Acciones que todavía no empiezan.",
      icon: CircleDashed,
    },
    {
      key: "hoy",
      title: "Hoy",
      description: "Necesitan atención hoy.",
      icon: CalendarDays,
    },
    {
      key: "en_proceso",
      title: "En proceso",
      description: "Acciones en movimiento.",
      icon: PlayCircle,
    },
    {
      key: "bloqueada",
      title: "Bloqueada",
      description: "Detenidas por un problema.",
      icon: AlertCircle,
    },
    {
      key: "terminada",
      title: "Terminada",
      description: "Acciones completadas.",
      icon: CheckCircle2,
    },
  ];

const filtrosEstado: { value: FiltroEstado; label: string }[] = [
  { value: "todos", label: "Todas" },
  { value: "pendiente", label: "Pendientes" },
  { value: "hoy", label: "Hoy" },
  { value: "en_proceso", label: "En proceso" },
  { value: "bloqueada", label: "Bloqueadas" },
  { value: "terminada", label: "Terminadas" },
];

const filtrosPrioridad: { value: FiltroPrioridad; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "baja", label: "Baja" },
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
];

const prioridadStyles: Record<PrioridadTarea, string> = {
  baja: theme.states.prioridad.baja,
  media: theme.states.prioridad.media,
  alta: theme.states.prioridad.alta,
};

const estadoStyles: Record<EstadoTarea, string> = {
  pendiente: theme.states.tarea.pendiente,
  hoy: theme.states.tarea.hoy,
  en_proceso: theme.states.tarea.en_proceso,
  bloqueada: theme.states.tarea.bloqueada,
  terminada: theme.states.tarea.terminada,
};

function formatFecha(value?: string | null) {
  if (!value) return "Sin fecha";

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

function capitalizar(value: string) {
  const clean = value.replaceAll("_", " ");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function getEstadoLabel(estado: EstadoTarea) {
  return estadosTarea.find((item) => item.key === estado)?.title ?? estado;
}

function TareasContent() {
  const searchParams = useSearchParams();

  const proyectoIdFromUrl = searchParams.get("proyectoId") ?? "";
  const objetivoIdFromUrl = searchParams.get("objetivoId") ?? "";

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [proyectoId, setProyectoId] = useState(proyectoIdFromUrl);
  const [objetivoId, setObjetivoId] = useState(objetivoIdFromUrl);
  const [prioridad, setPrioridad] = useState<PrioridadTarea>("media");
  const [estado, setEstado] = useState<EstadoTarea>("pendiente");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [recordatorio, setRecordatorio] = useState("");

  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<FiltroEstado>("todos");
  const [prioridadFiltro, setPrioridadFiltro] =
    useState<FiltroPrioridad>("todas");

  const [tareas, setTareas] = useState<TareaResumen[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoResumen[]>([]);
  const [objetivos, setObjetivos] = useState<ObjetivoSelector[]>([]);

  const [loadingTareas, setLoadingTareas] = useState(true);
  const [loadingProyectos, setLoadingProyectos] = useState(true);
  const [loadingObjetivos, setLoadingObjetivos] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingTareaId, setUpdatingTareaId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const fechasInvalidas = Boolean(
    fechaInicio && fechaLimite && fechaInicio > fechaLimite
  );

  const loadTareas = useCallback(async () => {
    setLoadingTareas(true);
    setError("");

    try {
      const data = await getTareas();
      setTareas(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudieron cargar las tareas.";

      setError(message);
    } finally {
      setLoadingTareas(false);
    }
  }, []);

  const loadProyectos = useCallback(async () => {
    setLoadingProyectos(true);

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

  const loadObjetivos = useCallback(async () => {
    setLoadingObjetivos(true);

    try {
      const data = await getObjetivosParaSelector();
      setObjetivos(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudieron cargar los objetivos.";

      setError(message);
    } finally {
      setLoadingObjetivos(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTareas();
      void loadProyectos();
      void loadObjetivos();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadTareas, loadProyectos, loadObjetivos]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (proyectoIdFromUrl) setProyectoId(proyectoIdFromUrl);
      if (objetivoIdFromUrl) setObjetivoId(objetivoIdFromUrl);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [objetivoIdFromUrl, proyectoIdFromUrl]);

  const proyectoSeleccionado = useMemo(() => {
    return proyectos.find((proyecto) => proyecto.id === proyectoId) ?? null;
  }, [proyectos, proyectoId]);

  const objetivosFiltrados = useMemo(() => {
    return proyectoId
      ? objetivos.filter((objetivo) => objetivo.proyecto_id === proyectoId)
      : objetivos;
  }, [objetivos, proyectoId]);

  const objetivoSeleccionado = useMemo(() => {
    return objetivos.find((objetivo) => objetivo.id === objetivoId) ?? null;
  }, [objetivos, objetivoId]);

  const tareasFiltradas = useMemo(() => {
    const term = search.trim().toLowerCase();

    return tareas.filter((tarea) => {
      const coincideTexto =
        !term ||
        tarea.titulo.toLowerCase().includes(term) ||
        tarea.descripcion?.toLowerCase().includes(term) ||
        tarea.estado.toLowerCase().includes(term) ||
        tarea.prioridad.toLowerCase().includes(term) ||
        tarea.proyecto?.nombre.toLowerCase().includes(term) ||
        tarea.objetivo?.titulo.toLowerCase().includes(term);

      const coincideEstado =
        estadoFiltro === "todos" || tarea.estado === estadoFiltro;

      const coincidePrioridad =
        prioridadFiltro === "todas" || tarea.prioridad === prioridadFiltro;

      const coincideProyecto = proyectoId ? tarea.proyecto?.id === proyectoId : true;
      const coincideObjetivo = objetivoId ? tarea.objetivo?.id === objetivoId : true;

      return (
        coincideTexto &&
        coincideEstado &&
        coincidePrioridad &&
        coincideProyecto &&
        coincideObjetivo
      );
    });
  }, [estadoFiltro, objetivoId, prioridadFiltro, proyectoId, search, tareas]);

  const tareasPorEstado = useMemo(() => {
    return estadosTarea.reduce<Record<EstadoTarea, TareaResumen[]>>(
      (acc, estadoItem) => {
        acc[estadoItem.key] = tareasFiltradas.filter(
          (tarea) => tarea.estado === estadoItem.key
        );

        return acc;
      },
      {
        pendiente: [],
        hoy: [],
        en_proceso: [],
        bloqueada: [],
        terminada: [],
      }
    );
  }, [tareasFiltradas]);

  const metricas = useMemo(() => {
    return {
      total: tareasFiltradas.length,
      pendientes: tareasPorEstado.pendiente.length,
      hoy: tareasPorEstado.hoy.length,
      enProceso: tareasPorEstado.en_proceso.length,
      bloqueadas: tareasPorEstado.bloqueada.length,
      terminadas: tareasPorEstado.terminada.length,
    };
  }, [tareasFiltradas.length, tareasPorEstado]);

  function resetForm() {
    setTitulo("");
    setDescripcion("");

    if (!proyectoIdFromUrl) {
      setProyectoId("");
    }

    if (!objetivoIdFromUrl) {
      setObjetivoId("");
    }

    setPrioridad("media");
    setEstado("pendiente");
    setFechaInicio("");
    setFechaLimite("");
    setRecordatorio("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    startTransition(() => {
      void (async () => {
        try {
          if (fechasInvalidas) {
            throw new Error(
              "La fecha de inicio no puede ser mayor que la fecha límite."
            );
          }

          await crearTarea({
            titulo,
            descripcion,
            proyectoId,
            objetivoId,
            prioridad,
            estado,
            fecha: fechaInicio,
            fechaInicio,
            fechaLimite,
            recordatorio,
          });

          resetForm();
          setMessage("Tarea creada correctamente.");
          await loadTareas();
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "No se pudo crear la tarea.";

          setError(message);
        }
      })();
    });
  }

  function handleCambiarEstadoTarea(tareaId: string, nuevoEstado: EstadoTarea) {
    setError("");
    setMessage("");
    setUpdatingTareaId(tareaId);

    startTransition(() => {
      void (async () => {
        try {
          await cambiarEstadoTarea(tareaId, nuevoEstado);
          setMessage("Estado de tarea actualizado correctamente.");
          await loadTareas();
        } catch (err) {
          const message =
            err instanceof Error
              ? err.message
              : "No se pudo actualizar el estado de la tarea.";

          setError(message);
        } finally {
          setUpdatingTareaId(null);
        }
      })();
    });
  }

  return (
    <AppShell
      title="Tareas"
      description="Crea, filtra y actualiza tus tareas desde una vista compacta."
    >
      <div className="space-y-5">
        {error ? <div className={theme.alerts.error}>{error}</div> : null}

        {message ? (
          <div className={`flex items-center gap-2 ${theme.alerts.success}`}>
            <CheckCircle2 className="h-4 w-4" />
            {message}
          </div>
        ) : null}

        <Card id="crear-tarea" className={theme.card.base}>
          <div className="mb-5 flex flex-col gap-2">
            <p className={theme.text.kicker}>Nueva tarea</p>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  Crear tarea rápida
                </h2>

                <p className={`${theme.text.body} mt-1 max-w-2xl`}>
                  Registra una acción concreta. Puedes asociarla a un proyecto, objetivo,
                  prioridad, estado y fechas.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                className={theme.button.secondaryLarge}
                onClick={() => void loadTareas()}
                disabled={loadingTareas}
              >
                <RefreshCcw
                  className={`mr-2 h-4 w-4 ${loadingTareas ? "animate-spin" : ""}`}
                />
                {loadingTareas ? "Actualizando" : "Actualizar"}
              </Button>
            </div>
          </div>

          {proyectoSeleccionado || objetivoSeleccionado ? (
            <div className="mb-5 grid gap-3 md:grid-cols-2">
              {proyectoSeleccionado ? (
                <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">
                    Proyecto
                  </p>

                  <p className="mt-1 truncate text-sm font-black text-slate-950">
                    {proyectoSeleccionado.nombre}
                  </p>
                </div>
              ) : null}

              {objetivoSeleccionado ? (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                    Objetivo
                  </p>

                  <p className="mt-1 truncate text-sm font-black text-slate-950">
                    {objetivoSeleccionado.titulo}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-2">
                <label htmlFor="titulo" className="text-sm font-black text-slate-700">
                  Título
                </label>

                <Input
                  id="titulo"
                  name="titulo"
                  placeholder="Ej: Revisar tareas pendientes del proyecto"
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
                  className={theme.input.base}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="estado" className="text-sm font-black text-slate-700">
                  Estado inicial
                </label>

                <select
                  id="estado"
                  name="estado"
                  value={estado}
                  onChange={(event) => setEstado(event.target.value as EstadoTarea)}
                  className={theme.input.select}
                >
                  {estadosTarea.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.title}
                    </option>
                  ))}
                </select>
              </div>
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
                placeholder="Detalles, contexto o pasos necesarios..."
                value={descripcion}
                onChange={(event) => setDescripcion(event.target.value)}
                className={`${theme.input.textarea} min-h-24`}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <label
                  htmlFor="proyectoId"
                  className="text-sm font-black text-slate-700"
                >
                  Proyecto
                </label>

                <select
                  id="proyectoId"
                  name="proyectoId"
                  value={proyectoId}
                  onChange={(event) => {
                    setProyectoId(event.target.value);
                    setObjetivoId("");
                  }}
                  disabled={loadingProyectos || Boolean(proyectoIdFromUrl)}
                  className={theme.input.select}
                >
                  <option value="">
                    {loadingProyectos ? "Cargando proyectos..." : "Sin proyecto"}
                  </option>

                  {proyectos.map((proyecto) => (
                    <option key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="objetivoId"
                  className="text-sm font-black text-slate-700"
                >
                  Objetivo
                </label>

                <select
                  id="objetivoId"
                  name="objetivoId"
                  value={objetivoId}
                  onChange={(event) => setObjetivoId(event.target.value)}
                  disabled={loadingObjetivos || Boolean(objetivoIdFromUrl)}
                  className={theme.input.select}
                >
                  <option value="">
                    {loadingObjetivos ? "Cargando objetivos..." : "Sin objetivo"}
                  </option>

                  {objetivosFiltrados.map((objetivo) => (
                    <option key={objetivo.id} value={objetivo.id}>
                      {objetivo.titulo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="prioridad"
                  className="text-sm font-black text-slate-700"
                >
                  Prioridad
                </label>

                <select
                  id="prioridad"
                  name="prioridad"
                  value={prioridad}
                  onChange={(event) =>
                    setPrioridad(event.target.value as PrioridadTarea)
                  }
                  className={theme.input.select}
                >
                  <option value="baja">Baja</option>
                  <option value="media">Media</option>
                  <option value="alta">Alta</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <label
                  htmlFor="fechaInicio"
                  className="text-sm font-black text-slate-700"
                >
                  Inicio
                </label>

                <Input
                  id="fechaInicio"
                  name="fechaInicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(event) => setFechaInicio(event.target.value)}
                  className={theme.input.base}
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="fechaLimite"
                  className="text-sm font-black text-slate-700"
                >
                  Fin
                </label>

                <Input
                  id="fechaLimite"
                  name="fechaLimite"
                  type="date"
                  value={fechaLimite}
                  onChange={(event) => setFechaLimite(event.target.value)}
                  className={theme.input.base}
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="recordatorio"
                  className="text-sm font-black text-slate-700"
                >
                  Recordatorio
                </label>

                <Input
                  id="recordatorio"
                  name="recordatorio"
                  type="date"
                  value={recordatorio}
                  onChange={(event) => setRecordatorio(event.target.value)}
                  className={theme.input.base}
                />
              </div>
            </div>

            {fechasInvalidas ? (
              <div className={theme.alerts.warning}>
                La fecha de inicio no puede ser mayor que la fecha límite.
              </div>
            ) : null}

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-slate-500">
                La tarea aparecerá en la tabla inferior y en el calendario si tiene fecha.
              </p>

              <Button
                type="submit"
                size="lg"
                className={theme.button.primaryLarge}
                disabled={isPending || fechasInvalidas}
              >
                <Plus className="mr-2 h-5 w-5" />
                {isPending ? "Creando..." : "Crear tarea"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className={theme.card.base}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className={theme.text.kicker}>Lista de tareas</p>

              <h2 className="mt-2 text-2xl font-black text-slate-950">
                Todas las tareas
              </h2>

              <p className={`${theme.text.body} mt-2 max-w-2xl`}>
                Mostrando {metricas.total} tarea{metricas.total === 1 ? "" : "s"} según los filtros actuales.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Total
              </p>
              <p className="mt-1 text-2xl font-black text-slate-950">
                {metricas.total}
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-[1fr_190px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar tarea, proyecto, objetivo, estado..."
                className={theme.input.search}
              />
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <select
                value={prioridadFiltro}
                onChange={(event) =>
                  setPrioridadFiltro(event.target.value as FiltroPrioridad)
                }
                className={`${theme.input.select} w-full pl-11`}
              >
                {filtrosPrioridad.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              variant="outline"
              className={theme.button.secondaryLarge}
              onClick={() => {
                setSearch("");
                setEstadoFiltro("todos");
                setPrioridadFiltro("todas");

                if (!proyectoIdFromUrl) setProyectoId("");
                if (!objetivoIdFromUrl) setObjetivoId("");
              }}
            >
              Limpiar filtros
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {filtrosEstado.map((filtro) => {
              const active = estadoFiltro === filtro.value;

              return (
                <button
                  key={filtro.value}
                  type="button"
                  onClick={() => setEstadoFiltro(filtro.value)}
                  className={`h-10 rounded-2xl px-4 text-sm font-black transition ${active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 hover:text-slate-950"
                    }`}
                >
                  {filtro.label}
                </button>
              );
            })}
          </div>

          <div className="mt-5">
            {loadingTareas ? (
              <div className="grid gap-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div
                    key={item}
                    className="h-14 animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}
              </div>
            ) : tareas.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <ListTodo className="mx-auto h-8 w-8 text-slate-400" />

                <h3 className="mt-4 text-xl font-black text-slate-950">
                  Todavía no hay tareas
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
                  Crea tu primera tarea desde el formulario superior.
                </p>
              </div>
            ) : tareasFiltradas.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <Search className="mx-auto h-8 w-8 text-slate-400" />

                <h3 className="mt-4 text-xl font-black text-slate-950">
                  No se encontraron tareas
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-500">
                  Cambia los filtros para ver otras tareas.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200 text-left">
                      <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                        Tarea
                      </th>
                      <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                        Proyecto
                      </th>
                      <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                        Objetivo
                      </th>
                      <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                        Prioridad
                      </th>
                      <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                        Inicio
                      </th>
                      <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                        Fin
                      </th>
                      <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                        Estado
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {tareasFiltradas.map((tarea) => {
                      const isUpdating = isPending && updatingTareaId === tarea.id;

                      return (
                        <tr
                          key={tarea.id}
                          className="border-b border-slate-100 transition last:border-b-0 hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 align-top">
                            <p className="line-clamp-1 text-sm font-black text-slate-950">
                              {tarea.titulo}
                            </p>

                            <p className="mt-1 line-clamp-1 text-xs font-medium text-slate-500">
                              {tarea.descripcion || "Sin descripción"}
                            </p>
                          </td>

                          <td className="px-4 py-3 align-top">
                            {tarea.proyecto ? (
                              <span className="inline-flex max-w-[180px] items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                                <FolderKanban className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{tarea.proyecto.nombre}</span>
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                                Sin proyecto
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 align-top">
                            {tarea.objetivo ? (
                              <span className="inline-flex max-w-[180px] items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                                <Target className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{tarea.objetivo.titulo}</span>
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">
                                Sin objetivo
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3 align-top">
                            <span
                              className={`${theme.badge.base} ${prioridadStyles[tarea.prioridad]}`}
                            >
                              {capitalizar(tarea.prioridad)}
                            </span>
                          </td>

                          <td className="px-4 py-3 align-top text-xs font-bold text-slate-500">
                            {formatFecha(tarea.fecha_inicio || tarea.fecha)}
                          </td>

                          <td className="px-4 py-3 align-top text-xs font-bold text-slate-500">
                            {formatFecha(tarea.fecha_limite || tarea.fecha)}
                          </td>

                          <td className="px-4 py-3 align-top">
                            <select
                              value={tarea.estado}
                              disabled={isUpdating}
                              onChange={(event) =>
                                handleCambiarEstadoTarea(
                                  tarea.id,
                                  event.target.value as EstadoTarea
                                )
                              }
                              className="h-10 min-w-[145px] rounded-2xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {estadosTarea.map((estadoItem) => (
                                <option key={estadoItem.key} value={estadoItem.key}>
                                  {estadoItem.title}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

export default function TareasPage() {
  return (
    <Suspense
      fallback={
        <AppShell
          title="Tareas"
          description="Acciones concretas con estado, prioridad, fecha y recordatorio."
        >
          <div className={theme.card.base}>
            <p className={theme.text.muted}>Cargando tareas...</p>
          </div>
        </AppShell>
      }
    >
      <TareasContent />
    </Suspense>
  );
}