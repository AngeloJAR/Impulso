"use client";

import Link from "next/link";
import {
  Suspense,
  type ElementType,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Filter,
  FolderKanban,
  ListTodo,
  PauseCircle,
  Plus,
  RefreshCcw,
  Search,
  Target,
  XCircle,
} from "lucide-react";

import { crearObjetivo, type EstadoObjetivo } from "@/features/objetivos/actions";
import {
  getObjetivosParaSelector,
  type ObjetivoSelector,
} from "@/features/objetivos/queries";
import { getProyectos, type ProyectoResumen } from "@/features/proyectos/queries";
import { theme } from "@/config/theme";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ObjetivoUI = ObjetivoSelector & {
  descripcion?: string | null;
  estado?: EstadoObjetivo;
  fecha_inicio?: string | null;
  fecha_limite?: string | null;
  progreso?: number | null;
  proyecto?: {
    id: string;
    nombre: string;
  } | null;
};

type FiltroEstado = "todos" | EstadoObjetivo;

const estadosObjetivo: {
  key: EstadoObjetivo;
  title: string;
  description: string;
  icon: ElementType;
}[] = [
  {
    key: "activo",
    title: "Activo",
    description: "En ejecución.",
    icon: Target,
  },
  {
    key: "pausado",
    title: "Pausado",
    description: "Detenido temporalmente.",
    icon: PauseCircle,
  },
  {
    key: "completado",
    title: "Completado",
    description: "Meta finalizada.",
    icon: CheckCircle2,
  },
  {
    key: "abandonado",
    title: "Abandonado",
    description: "Objetivo descartado.",
    icon: XCircle,
  },
];

const filtrosEstado: { value: FiltroEstado; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "activo", label: "Activos" },
  { value: "pausado", label: "Pausados" },
  { value: "completado", label: "Completados" },
  { value: "abandonado", label: "Abandonados" },
];

const estadoStyles: Record<EstadoObjetivo, string> = {
  activo: theme.states.objetivo.activo,
  pausado: theme.states.objetivo.pausado,
  completado: theme.states.objetivo.completado,
  abandonado: theme.states.objetivo.abandonado,
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
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getEstadoObjetivo(objetivo: ObjetivoUI): EstadoObjetivo {
  return objetivo.estado ?? "activo";
}

function clampProgreso(value?: number | null) {
  const progreso = Number(value ?? 0);

  if (!Number.isFinite(progreso)) return 0;
  if (progreso < 0) return 0;
  if (progreso > 100) return 100;

  return progreso;
}

function ObjetivosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const proyectoIdFromUrl = searchParams.get("proyectoId") ?? "";

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [proyectoId, setProyectoId] = useState(proyectoIdFromUrl);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [estado, setEstado] = useState<EstadoObjetivo>("activo");

  const [search, setSearch] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<FiltroEstado>("todos");

  const [objetivos, setObjetivos] = useState<ObjetivoUI[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoResumen[]>([]);

  const [loadingObjetivos, setLoadingObjetivos] = useState(true);
  const [loadingProyectos, setLoadingProyectos] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [isPending, startTransition] = useTransition();

  const fechasInvalidas = Boolean(
    fechaInicio && fechaLimite && fechaInicio > fechaLimite
  );

  const loadObjetivos = useCallback(async () => {
    setLoadingObjetivos(true);
    setError("");

    try {
      const data = await getObjetivosParaSelector();
      setObjetivos((data ?? []) as ObjetivoUI[]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudieron cargar los objetivos.";

      setError(message);
    } finally {
      setLoadingObjetivos(false);
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

useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void loadObjetivos();
    void loadProyectos();
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [loadObjetivos, loadProyectos]);

  const proyectoSeleccionado = useMemo(() => {
    return proyectos.find((proyecto) => proyecto.id === proyectoId) ?? null;
  }, [proyectos, proyectoId]);

  const objetivosFiltrados = useMemo(() => {
    const term = search.trim().toLowerCase();

    return objetivos.filter((objetivo) => {
      const objetivoEstado = getEstadoObjetivo(objetivo);

      const coincideProyecto = proyectoId
        ? objetivo.proyecto_id === proyectoId
        : true;

      const coincideEstado =
        estadoFiltro === "todos" || objetivoEstado === estadoFiltro;

      const coincideBusqueda =
        !term ||
        objetivo.titulo.toLowerCase().includes(term) ||
        objetivo.descripcion?.toLowerCase().includes(term) ||
        objetivoEstado.toLowerCase().includes(term) ||
        objetivo.proyecto?.nombre.toLowerCase().includes(term);

      return coincideProyecto && coincideEstado && coincideBusqueda;
    });
  }, [estadoFiltro, objetivos, proyectoId, search]);

  const objetivosPorEstado = useMemo(() => {
    return estadosObjetivo.reduce<Record<EstadoObjetivo, ObjetivoUI[]>>(
      (acc, estadoItem) => {
        acc[estadoItem.key] = objetivosFiltrados.filter(
          (objetivo) => getEstadoObjetivo(objetivo) === estadoItem.key
        );

        return acc;
      },
      {
        activo: [],
        pausado: [],
        completado: [],
        abandonado: [],
      }
    );
  }, [objetivosFiltrados]);

  const metricas = useMemo(() => {
    return {
      total: objetivosFiltrados.length,
      activos: objetivosPorEstado.activo.length,
      pausados: objetivosPorEstado.pausado.length,
      completados: objetivosPorEstado.completado.length,
      abandonados: objetivosPorEstado.abandonado.length,
    };
  }, [objetivosFiltrados.length, objetivosPorEstado]);

  function resetForm() {
    setTitulo("");
    setDescripcion("");

    if (!proyectoIdFromUrl) {
      setProyectoId("");
    }

    setFechaInicio("");
    setFechaLimite("");
    setEstado("activo");
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

          const objetivo = await crearObjetivo({
            titulo,
            descripcion,
            proyectoId,
            fechaInicio,
            fechaLimite,
            estado,
          });

          setMessage("Objetivo creado correctamente.");
          await loadObjetivos();

          if (objetivo?.id) {
            router.push(
              `/tareas?proyectoId=${proyectoId}&objetivoId=${objetivo.id}#crear-tarea`
            );
            return;
          }

          resetForm();
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "No se pudo crear el objetivo.";

          setError(message);
        }
      })();
    });
  }

  return (
    <AppShell
      title="Objetivos"
      description="Define metas claras para tus proyectos y conviértelas en tareas ejecutables."
    >
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
                  <Target className="h-4 w-4" />
                  Centro de objetivos
                </div>

                <h2 className={theme.hero.title}>
                  Convierte proyectos en metas concretas.
                </h2>

                <p className={theme.hero.description}>
                  Un objetivo te dice hacia dónde avanzar. Luego cada objetivo se
                  rompe en tareas pequeñas para no perder el ritmo.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Button
                    className={theme.button.primaryLarge}
                    onClick={() => {
                      document
                        .getElementById("crear-objetivo")
                        ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo objetivo
                  </Button>

                  <Button
                    variant="outline"
                    className={theme.button.secondaryLarge}
                    onClick={() => void loadObjetivos()}
                    disabled={loadingObjetivos}
                  >
                    <RefreshCcw
                      className={`mr-2 h-4 w-4 ${
                        loadingObjetivos ? "animate-spin" : ""
                      }`}
                    />
                    {loadingObjetivos ? "Actualizando" : "Actualizar"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          <Card className={theme.card.base}>
            <p className={theme.text.kicker}>Flujo correcto</p>

            <div className="mt-5 grid gap-3">
              {[
                { label: "Proyecto", icon: FolderKanban },
                { label: "Objetivo", icon: Target },
                { label: "Tarea", icon: ListTodo },
                { label: "Calendario", icon: CalendarDays },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                        <Icon className="h-4 w-4" />
                      </span>

                      <div>
                        <p className="text-sm font-black text-slate-950">
                          {item.label}
                        </p>

                        <p className="text-xs font-medium text-slate-500">
                          Paso {index + 1}
                        </p>
                      </div>
                    </div>

                    {index < 3 ? (
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {estadosObjetivo.map((item) => {
            const Icon = item.icon;
            const total = objetivosPorEstado[item.key]?.length ?? 0;

            return (
              <Card key={item.key} className={theme.card.base}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-3xl font-black text-slate-950">{total}</p>

                    <h3 className="mt-2 text-sm font-black text-slate-950">
                      {item.title}
                    </h3>

                    <p className="mt-1 text-xs font-medium leading-5 text-slate-500">
                      {item.description}
                    </p>
                  </div>

                  <div
                    className={`rounded-2xl p-3 ring-1 ${
                      estadoStyles[item.key]
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
          <Card className={theme.card.base}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className={theme.text.kicker}>Lista de objetivos</p>

                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Objetivos registrados
                </h2>

                <p className={`${theme.text.body} mt-2 max-w-2xl`}>
                  Filtra por proyecto, estado o nombre. Entra a un objetivo para
                  revisar o crear tareas.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Mostrando
                </p>
                <p className="mt-1 text-2xl font-black text-slate-950">
                  {metricas.total}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 xl:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar objetivo, descripción, estado o proyecto..."
                  className={theme.input.search}
                />
              </div>

              <div className="relative">
                <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  value={proyectoId}
                  onChange={(event) => setProyectoId(event.target.value)}
                  disabled={loadingProyectos || Boolean(proyectoIdFromUrl)}
                  className={`${theme.input.select} w-full pl-11 xl:w-[260px]`}
                >
                  <option value="">
                    {loadingProyectos ? "Cargando proyectos..." : "Todos los proyectos"}
                  </option>

                  {proyectos.map((proyecto) => (
                    <option key={proyecto.id} value={proyecto.id}>
                      {proyecto.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {filtrosEstado.map((filtro) => {
                const active = estadoFiltro === filtro.value;

                return (
                  <button
                    key={filtro.value}
                    type="button"
                    onClick={() => setEstadoFiltro(filtro.value)}
                    className={`h-11 rounded-2xl px-4 text-sm font-black transition ${
                      active
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
              {loadingObjetivos ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="h-64 animate-pulse rounded-[1.5rem] border border-slate-200 bg-slate-100"
                    />
                  ))}
                </div>
              ) : objetivosFiltrados.length === 0 ? (
                <div className={theme.card.empty}>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                    <Target className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 text-xl font-black text-slate-950">
                    No hay objetivos para mostrar
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-600">
                    Crea un objetivo nuevo o cambia los filtros actuales.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {objetivosFiltrados.map((objetivo) => {
                    const objetivoEstado = getEstadoObjetivo(objetivo);
                    const progreso = clampProgreso(objetivo.progreso);

                    return (
                      <Link
                        key={objetivo.id}
                        href={`/objetivos/${objetivo.id}`}
                        className="group rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                            <Target className="h-5 w-5" />
                          </div>

                          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition group-hover:bg-blue-600 group-hover:text-white">
                            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span
                            className={`${theme.badge.base} ${estadoStyles[objetivoEstado]}`}
                          >
                            {capitalizar(objetivoEstado)}
                          </span>

                          {objetivo.proyecto ? (
                            <span className={`${theme.badge.base} ${theme.badge.sky} inline-flex items-center gap-1`}>
                              <FolderKanban className="h-3.5 w-3.5" />
                              {objetivo.proyecto.nombre}
                            </span>
                          ) : objetivo.proyecto_id ? (
                            <span className={`${theme.badge.base} ${theme.badge.slate} inline-flex items-center gap-1`}>
                              <FolderKanban className="h-3.5 w-3.5" />
                              Proyecto asociado
                            </span>
                          ) : (
                            <span className={`${theme.badge.base} ${theme.badge.slate}`}>
                              Sin proyecto
                            </span>
                          )}
                        </div>

                        <h3 className="mt-4 text-lg font-black leading-6 text-slate-950">
                          {objetivo.titulo}
                        </h3>

                        <p className="mt-2 min-h-12 text-sm font-medium leading-6 text-slate-600">
                          {objetivo.descripcion || "Sin descripción"}
                        </p>

                        <div className="mt-4 grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-500">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Inicio: {formatFecha(objetivo.fecha_inicio)}
                          </div>

                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-3.5 w-3.5" />
                            Fin: {formatFecha(objetivo.fecha_limite)}
                          </div>
                        </div>

                        <div className="mt-5">
                          <div className="mb-2 flex items-center justify-between text-xs font-black">
                            <span className="text-slate-500">Progreso</span>
                            <span className="text-slate-950">{progreso}%</span>
                          </div>

                          <div className={theme.progress.trackSmall}>
                            <div
                              className={theme.progress.barSmall}
                              style={{ width: `${progreso}%` }}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          <div className="grid h-fit gap-5">
            <Card id="crear-objetivo" className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                  <Plus className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Crear</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Nuevo objetivo
                  </h2>

                  <p className={`${theme.text.body} mt-1`}>
                    Crea una meta y luego conviértela en tareas.
                  </p>
                </div>
              </div>

              {proyectoSeleccionado ? (
                <div className="mt-5 rounded-[1.5rem] border border-sky-100 bg-sky-50 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-700">
                    Proyecto seleccionado
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-950">
                    {proyectoSeleccionado.nombre}
                  </p>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} className="mt-5 grid gap-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="titulo"
                    className="text-sm font-black text-slate-700"
                  >
                    Título
                  </label>

                  <Input
                    id="titulo"
                    value={titulo}
                    onChange={(event) => setTitulo(event.target.value)}
                    placeholder="Ej: Lanzar sistema semanal de contenido"
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
                    value={descripcion}
                    onChange={(event) => setDescripcion(event.target.value)}
                    placeholder="Define qué significa completar este objetivo..."
                    className={theme.input.textarea}
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="proyectoId"
                    className="text-sm font-black text-slate-700"
                  >
                    Proyecto opcional
                  </label>

                  <select
                    id="proyectoId"
                    value={proyectoId}
                    onChange={(event) => setProyectoId(event.target.value)}
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

                  <p className={theme.text.smallMuted}>
                    {proyectoSeleccionado
                      ? `Se asociará a: ${proyectoSeleccionado.nombre}`
                      : "Puedes crear el objetivo sin proyecto y organizarlo después."}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label
                      htmlFor="fechaInicio"
                      className="text-sm font-black text-slate-700"
                    >
                      Inicio opcional
                    </label>

                    <Input
                      id="fechaInicio"
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
                      Fin opcional
                    </label>

                    <Input
                      id="fechaLimite"
                      type="date"
                      value={fechaLimite}
                      onChange={(event) => setFechaLimite(event.target.value)}
                      className={theme.input.base}
                    />
                  </div>
                </div>

                {fechasInvalidas ? (
                  <div className={theme.alerts.warning}>
                    La fecha de inicio no puede ser mayor que la fecha límite.
                  </div>
                ) : null}

                <div className="grid gap-2">
                  <label
                    htmlFor="estado"
                    className="text-sm font-black text-slate-700"
                  >
                    Estado
                  </label>

                  <select
                    id="estado"
                    value={estado}
                    onChange={(event) =>
                      setEstado(event.target.value as EstadoObjetivo)
                    }
                    className={theme.input.select}
                  >
                    {estadosObjetivo.map((item) => (
                      <option key={item.key} value={item.key}>
                        {item.title}
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className={theme.button.primaryLarge}
                  disabled={isPending || fechasInvalidas}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  {isPending ? "Creando..." : "Crear objetivo"}
                </Button>
              </form>
            </Card>

            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <ClipboardList className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Recomendación</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Objetivo útil
                  </h2>
                </div>
              </div>

              <p className={`${theme.card.inner} mt-5 text-sm font-medium leading-6`}>
                Escribe objetivos como resultados concretos. Luego crea tareas
                pequeñas para avanzar sin sentir que todo el proyecto pesa.
              </p>
            </Card>

            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                  <ListTodo className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Próximo paso</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Crear tareas
                  </h2>
                </div>
              </div>

              <p className={`${theme.text.body} mt-5`}>
                Después de crear el objetivo, Impulso te lleva directo al
                formulario de tareas con el objetivo ya seleccionado.
              </p>
            </Card>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function ObjetivosPage() {
  return (
    <Suspense
      fallback={
        <AppShell
          title="Objetivos"
          description="Define metas claras para tus proyectos y conviértelas en tareas ejecutables."
        >
          <div className={theme.card.base}>
            <p className={theme.text.muted}>Cargando objetivos...</p>
          </div>
        </AppShell>
      }
    >
      <ObjetivosContent />
    </Suspense>
  );
}