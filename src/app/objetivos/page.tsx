"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  ArrowRight,
  CheckCircle2,
  CirclePause,
  Flag,
  FolderKanban,
  ListTodo,
  Plus,
  Target,
  TrendingUp,
  XCircle,
} from "lucide-react";

import {
  cambiarEstadoObjetivo,
  crearObjetivo,
} from "@/features/objetivos/actions";
import {
  getObjetivos,
  type EstadoObjetivo,
  type ObjetivoResumen,
} from "@/features/objetivos/queries";
import {
  getProyectos,
  type ProyectoResumen,
} from "@/features/proyectos/queries";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const estadosObjetivo: {
  key: EstadoObjetivo;
  title: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    key: "activo",
    title: "Activo",
    description: "Objetivos que siguen en movimiento.",
    icon: Target,
  },
  {
    key: "pausado",
    title: "Pausado",
    description: "Metas detenidas temporalmente.",
    icon: CirclePause,
  },
  {
    key: "completado",
    title: "Completado",
    description: "Objetivos terminados con éxito.",
    icon: CheckCircle2,
  },
  {
    key: "abandonado",
    title: "Abandonado",
    description: "Objetivos que ya no valen el foco actual.",
    icon: XCircle,
  },
];

const estadoStyles: Record<EstadoObjetivo, string> = {
  activo: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  pausado: "bg-amber-50 text-amber-700 ring-amber-100",
  completado: "bg-sky-50 text-sky-700 ring-sky-100",
  abandonado: "bg-slate-100 text-slate-500 ring-slate-200",
};

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

function getEstadoLabel(estado: EstadoObjetivo) {
  return estadosObjetivo.find((item) => item.key === estado)?.title ?? estado;
}

export default function ObjetivosPage() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [proyectoId, setProyectoId] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [estado, setEstado] = useState<EstadoObjetivo>("activo");

  const [objetivos, setObjetivos] = useState<ObjetivoResumen[]>([]);
  const [proyectos, setProyectos] = useState<ProyectoResumen[]>([]);

  const [loadingObjetivos, setLoadingObjetivos] = useState(true);
  const [loadingProyectos, setLoadingProyectos] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingObjetivoId, setUpdatingObjetivoId] = useState<string | null>(
    null
  );

  const [isPending, startTransition] = useTransition();

  async function loadObjetivos() {
    setLoadingObjetivos(true);
    setError("");

    try {
      const data = await getObjetivos();
      setObjetivos(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar los objetivos.";

      setError(message);
    } finally {
      setLoadingObjetivos(false);
    }
  }

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
    loadObjetivos();
    loadProyectos();
  }, []);

  const objetivosPorEstado = useMemo(() => {
    return estadosObjetivo.reduce<Record<EstadoObjetivo, ObjetivoResumen[]>>(
      (acc, estadoItem) => {
        acc[estadoItem.key] = objetivos.filter(
          (objetivo) => objetivo.estado === estadoItem.key
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
  }, [objetivos]);

  function resetForm() {
    setTitulo("");
    setDescripcion("");
    setProyectoId("");
    setFechaInicio("");
    setFechaLimite("");
    setEstado("activo");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    startTransition(async () => {
      try {
        await crearObjetivo({
          titulo,
          descripcion,
          proyectoId,
          fechaInicio,
          fechaLimite,
          estado,
        });

        resetForm();
        setMessage("Objetivo creado correctamente.");
        await loadObjetivos();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "No se pudo crear el objetivo.";

        setError(message);
      }
    });
  }

  function handleCambiarEstadoObjetivo(
    objetivoId: string,
    nuevoEstado: EstadoObjetivo
  ) {
    setError("");
    setMessage("");
    setUpdatingObjetivoId(objetivoId);

    startTransition(async () => {
      try {
        await cambiarEstadoObjetivo(objetivoId, nuevoEstado);
        setMessage("Estado de objetivo actualizado correctamente.");
        await loadObjetivos();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "No se pudo actualizar el estado del objetivo.";

        setError(message);
      } finally {
        setUpdatingObjetivoId(null);
      }
    });
  }

  const proyectoSeleccionado = proyectos.find(
    (proyecto) => proyecto.id === proyectoId
  );

  return (
    <AppShell
      title="Objetivos"
      description="Metas grandes que agrupan tareas, fechas y progreso real."
    >
      <div className="grid gap-6">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_340px] md:p-8">
            <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-emerald-100 blur-3xl" />

            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                <Target className="h-4 w-4" />
                Dirección y progreso
              </div>

              <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                Un objetivo convierte muchas tareas en una dirección clara.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                Los objetivos sirven para agrupar acciones relacionadas, medir
                avance y evitar que tus proyectos se llenen de tareas sueltas
                sin propósito.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  className="rounded-2xl"
                  onClick={() => {
                    document
                      .getElementById("crear-objetivo")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Nuevo objetivo
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-2xl"
                  onClick={loadObjetivos}
                  disabled={loadingObjetivos}
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  {loadingObjetivos ? "Actualizando..." : "Actualizar"}
                </Button>
              </div>
            </div>

            <Card className="relative rounded-[2rem] border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
              <p className="text-sm font-medium text-slate-400">
                Regla del módulo
              </p>
              <h3 className="mt-2 text-2xl font-semibold">
                Si no agrupa tareas, quizá no es objetivo.
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Una idea inspira. Una tarea se ejecuta. Un objetivo marca una
                meta que necesita varias acciones para completarse.
              </p>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm leading-6 text-slate-300">
                  Por ahora el progreso se actualiza manualmente por estado:
                  completado equivale a 100%.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {message}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {estadosObjetivo.map((item) => {
            const Icon = item.icon;
            const total = objetivosPorEstado[item.key]?.length ?? 0;

            return (
              <Card
                key={item.key}
                className="rounded-[1.75rem] border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                    {total}
                  </span>
                </div>

                <h3 className="font-bold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm leading-5 text-slate-500">
                  {item.description}
                </p>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-950">
                Objetivos por estado
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Vista real de tus objetivos guardados en Supabase.
              </p>
            </div>

            {loadingObjetivos ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <p className="text-sm font-medium text-slate-500">
                  Cargando objetivos...
                </p>
              </div>
            ) : objetivos.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                  <Flag className="h-6 w-6" />
                </div>

                <p className="font-semibold text-slate-800">
                  Todavía no hay objetivos creados
                </p>
                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                  Crea tu primer objetivo desde el formulario de la derecha.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {estadosObjetivo.map((estadoItem) => {
                  const items = objetivosPorEstado[estadoItem.key] ?? [];

                  return (
                    <div
                      key={estadoItem.key}
                      className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {estadoItem.title}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {items.length} objetivos
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                            estadoStyles[estadoItem.key]
                          }`}
                        >
                          {getEstadoLabel(estadoItem.key)}
                        </span>
                      </div>

                      {items.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-center">
                          <p className="text-xs leading-5 text-slate-500">
                            Sin objetivos en este estado.
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {items.map((objetivo) => (
                            <div
                              key={objetivo.id}
                              className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                            >
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                {objetivo.proyecto ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
                                    <FolderKanban className="h-3.5 w-3.5" />
                                    {objetivo.proyecto.nombre}
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-400">
                                    Sin proyecto
                                  </span>
                                )}

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                                    estadoStyles[objetivo.estado]
                                  }`}
                                >
                                  {getEstadoLabel(objetivo.estado)}
                                </span>
                              </div>

                              <h4 className="font-bold text-slate-950">
                                {objetivo.titulo}
                              </h4>

                              {objetivo.descripcion ? (
                                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                                  {objetivo.descripcion}
                                </p>
                              ) : (
                                <p className="mt-1 text-sm text-slate-400">
                                  Sin descripción
                                </p>
                              )}

                              <div className="mt-4">
                                <div className="mb-2 flex items-center justify-between text-xs font-medium">
                                  <span className="text-slate-500">
                                    Progreso
                                  </span>
                                  <span className="font-bold text-slate-950">
                                    {objetivo.progreso}%
                                  </span>
                                </div>
                                <div className="h-3 rounded-full bg-slate-100">
                                  <div
                                    className="h-3 rounded-full bg-slate-950"
                                    style={{
                                      width: `${objetivo.progreso}%`,
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="mt-4 grid gap-2 text-xs font-medium text-slate-400">
                                <div>
                                  Inicio: {formatFecha(objetivo.fecha_inicio)}
                                </div>
                                <div>
                                  Límite: {formatFecha(objetivo.fecha_limite)}
                                </div>
                              </div>

                              <div className="mt-4 grid gap-1.5">
                                <label
                                  htmlFor={`estado-objetivo-${objetivo.id}`}
                                  className="text-xs font-semibold text-slate-500"
                                >
                                  Cambiar estado
                                </label>

                                <select
                                  id={`estado-objetivo-${objetivo.id}`}
                                  value={objetivo.estado}
                                  disabled={
                                    isPending &&
                                    updatingObjetivoId === objetivo.id
                                  }
                                  onChange={(event) =>
                                    handleCambiarEstadoObjetivo(
                                      objetivo.id,
                                      event.target.value as EstadoObjetivo
                                    )
                                  }
                                  className="h-9 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-xs outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {estadosObjetivo.map((item) => (
                                    <option key={item.key} value={item.key}>
                                      {item.title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <div className="grid gap-6">
            <Card
              id="crear-objetivo"
              className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5">
                <h2 className="text-lg font-bold text-slate-950">
                  Nuevo objetivo
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Crea una meta grande y asígnala a un proyecto si aplica.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="titulo"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Título
                  </label>
                  <Input
                    id="titulo"
                    name="titulo"
                    placeholder="Ej: Lanzar sistema semanal de contenido"
                    value={titulo}
                    onChange={(event) => setTitulo(event.target.value)}
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
                    placeholder="¿Qué significa completar este objetivo?"
                    value={descripcion}
                    onChange={(event) => setDescripcion(event.target.value)}
                    className="min-h-28 rounded-2xl"
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="proyectoId"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Proyecto opcional
                  </label>
                  <select
                    id="proyectoId"
                    name="proyectoId"
                    value={proyectoId}
                    onChange={(event) => setProyectoId(event.target.value)}
                    disabled={loadingProyectos}
                    className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {loadingProyectos
                        ? "Cargando proyectos..."
                        : "Sin proyecto"}
                    </option>

                    {proyectos.map((proyecto) => (
                      <option key={proyecto.id} value={proyecto.id}>
                        {proyecto.nombre}
                      </option>
                    ))}
                  </select>

                  <p className="text-xs leading-5 text-slate-400">
                    {proyectoSeleccionado
                      ? `Se asociará a: ${proyectoSeleccionado.nombre}`
                      : "Puedes crear el objetivo sin proyecto y organizarlo después."}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label
                      htmlFor="fechaInicio"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Fecha de inicio
                    </label>
                    <Input
                      id="fechaInicio"
                      name="fechaInicio"
                      type="date"
                      value={fechaInicio}
                      onChange={(event) => setFechaInicio(event.target.value)}
                      className="rounded-2xl"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label
                      htmlFor="fechaLimite"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Fecha límite
                    </label>
                    <Input
                      id="fechaLimite"
                      name="fechaLimite"
                      type="date"
                      value={fechaLimite}
                      onChange={(event) => setFechaLimite(event.target.value)}
                      className="rounded-2xl"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="estado"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Estado
                  </label>
                  <select
                    id="estado"
                    name="estado"
                    value={estado}
                    onChange={(event) =>
                      setEstado(event.target.value as EstadoObjetivo)
                    }
                    className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs outline-none transition focus:border-slate-400"
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
                  className="rounded-2xl"
                  disabled={isPending}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  {isPending ? "Creando..." : "Crear objetivo"}
                </Button>
              </form>
            </Card>

            <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Funciones actuales
                  </h2>
                  <p className="text-sm text-slate-500">
                    Lo que ya tiene Objetivos.
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  "Crear objetivos reales",
                  "Asociar objetivos a proyectos",
                  "Cambiar estado",
                  "Mostrar progreso",
                  "Ver fechas de inicio y límite",
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

            <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
                  <ListTodo className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Próximo paso
                  </h2>
                  <p className="text-sm text-slate-500">
                    Asociar tareas reales a objetivos.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5">
                <p className="text-sm leading-6 text-slate-500">
                  Luego haremos que las tareas puedan seleccionar un objetivo y
                  que el progreso se calcule según tareas terminadas.
                </p>
              </div>
            </Card>
          </div>
        </section>
      </div>
    </AppShell>
  );
}