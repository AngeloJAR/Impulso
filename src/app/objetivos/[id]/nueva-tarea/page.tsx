"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Info,
  ListTodo,
  Plus,
  Target,
} from "lucide-react";

import { crearTarea } from "@/features/tareas/actions";
import {
  getObjetivoDetalle,
  type ObjetivoDetalle,
} from "@/features/objetivos/objective-detail-queries";
import { type EstadoTarea, type PrioridadTarea } from "@/features/tareas/queries";
import { theme } from "@/config/theme";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const estadosTarea: {
  value: EstadoTarea;
  label: string;
  description: string;
}[] = [
  {
    value: "pendiente",
    label: "Pendiente",
    description: "La tarea todavía no empieza.",
  },
  {
    value: "hoy",
    label: "Hoy",
    description: "Necesita atención durante el día.",
  },
  {
    value: "en_proceso",
    label: "En proceso",
    description: "Ya estás trabajando en ella.",
  },
  {
    value: "bloqueada",
    label: "Bloqueada",
    description: "Está detenida por algún problema.",
  },
  {
    value: "terminada",
    label: "Terminada",
    description: "La acción ya fue completada.",
  },
];

const prioridadesTarea: {
  value: PrioridadTarea;
  label: string;
  description: string;
}[] = [
  {
    value: "baja",
    label: "Baja",
    description: "Puede esperar.",
  },
  {
    value: "media",
    label: "Media",
    description: "Importante, pero no urgente.",
  },
  {
    value: "alta",
    label: "Alta",
    description: "Debe atenderse pronto.",
  },
];

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

export default function NuevaTareaObjetivoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const objetivoId = params.id;

  const [objetivo, setObjetivo] = useState<ObjetivoDetalle | null>(null);
  const [loadingObjetivo, setLoadingObjetivo] = useState(true);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState<PrioridadTarea>("media");
  const [estado, setEstado] = useState<EstadoTarea>("pendiente");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [recordatorio, setRecordatorio] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [isPending, startTransition] = useTransition();

  const estadoSeleccionado = useMemo(() => {
    return estadosTarea.find((item) => item.value === estado);
  }, [estado]);

  const prioridadSeleccionada = useMemo(() => {
    return prioridadesTarea.find((item) => item.value === prioridad);
  }, [prioridad]);

  const fechasInvalidas = useMemo(() => {
    return Boolean(fechaInicio && fechaLimite && fechaInicio > fechaLimite);
  }, [fechaInicio, fechaLimite]);

  const loadObjetivo = useCallback(async () => {
    setLoadingObjetivo(true);
    setError("");

    try {
      const data = await getObjetivoDetalle(objetivoId);
      setObjetivo(data.objetivo);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar el objetivo.";

      setError(message);
    } finally {
      setLoadingObjetivo(false);
    }
  }, [objetivoId]);

  useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void loadObjetivo();
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [loadObjetivo]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    startTransition(() => {
      void (async () => {
        try {
          if (!objetivo) {
            throw new Error("No se encontró el objetivo para asociar la tarea.");
          }

          if (!objetivo.proyecto_id) {
            throw new Error(
              "Este objetivo no tiene proyecto asociado. Primero asígnalo a un proyecto."
            );
          }

          if (fechasInvalidas) {
            throw new Error("La fecha de inicio no puede ser mayor que la fecha límite.");
          }

          await crearTarea({
            titulo,
            descripcion,
            proyectoId: objetivo.proyecto_id,
            objetivoId: objetivo.id,
            prioridad,
            estado,
            fecha: fechaInicio,
            fechaInicio,
            fechaLimite,
            recordatorio,
          });

          setMessage("Tarea creada correctamente.");

          if (fechaInicio || fechaLimite || recordatorio) {
            router.push("/calendario");
            router.refresh();
            return;
          }

          router.push(`/objetivos/${objetivoId}`);
          router.refresh();
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "No se pudo crear la tarea.";

          setError(message);
        }
      })();
    });
  }

  return (
    <AppShell
      title="Nueva tarea"
      description="Crea una tarea dentro del objetivo seleccionado."
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href={`/objetivos/${objetivoId}`}>
            <Button variant="outline" className={theme.button.secondary}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al objetivo
            </Button>
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm">
            Flujo: Objetivo → Tarea → Calendario
          </div>
        </div>

        {error ? <div className={theme.alerts.error}>{error}</div> : null}

        {message ? (
          <div className={`flex items-center gap-2 ${theme.alerts.success}`}>
            <CheckCircle2 className="h-4 w-4" />
            {message}
          </div>
        ) : null}

        <section className="grid gap-5 xl:grid-cols-[1.1fr_0.75fr]">
          <Card className={theme.card.hero}>
            <div className={theme.hero.wrapper}>
              <div className={theme.hero.glow} />

              <div className={theme.hero.content}>
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className={theme.hero.badge}>
                      <ListTodo className="h-4 w-4" />
                      Tarea nueva
                    </div>

                    <h2 className={theme.hero.title}>
                      Convierte el objetivo en una acción concreta.
                    </h2>

                    <p className={theme.hero.description}>
                      Una buena tarea debe ser clara, ejecutable y pequeña. Al
                      agregar fechas o recordatorio, también aparecerá dentro del
                      calendario.
                    </p>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-4 shadow-sm">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                      Estado inicial
                    </p>

                    <span
                      className={`${theme.badge.base} ${
                        estadoStyles[estado]
                      } mt-3 inline-flex`}
                    >
                      {estadoSeleccionado?.label}
                    </span>

                    <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
                      {estadoSeleccionado?.description}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-7 grid gap-5">
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
                      placeholder="Ej: Diseñar calendario de publicaciones"
                      className={theme.input.base}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <label
                      htmlFor="descripcion"
                      className="text-sm font-black text-slate-700"
                    >
                      Descripción
                    </label>

                    <Textarea
                      id="descripcion"
                      value={descripcion}
                      onChange={(event) => setDescripcion(event.target.value)}
                      placeholder="Detalles, pasos o contexto de esta tarea..."
                      className={theme.input.textarea}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <label
                        htmlFor="prioridad"
                        className="text-sm font-black text-slate-700"
                      >
                        Prioridad
                      </label>

                      <select
                        id="prioridad"
                        value={prioridad}
                        onChange={(event) =>
                          setPrioridad(event.target.value as PrioridadTarea)
                        }
                        className={theme.input.select}
                      >
                        {prioridadesTarea.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>

                      <p className={theme.text.smallMuted}>
                        {prioridadSeleccionada?.description}
                      </p>
                    </div>

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
                          setEstado(event.target.value as EstadoTarea)
                        }
                        className={theme.input.select}
                      >
                        {estadosTarea.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>

                      <p className={theme.text.smallMuted}>
                        {estadoSeleccionado?.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="grid gap-2">
                      <label
                        htmlFor="fechaInicio"
                        className="text-sm font-black text-slate-700"
                      >
                        Inicio
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
                        Fin
                      </label>

                      <Input
                        id="fechaLimite"
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
                    <p className="text-sm font-medium leading-6 text-slate-600">
                      Si agregas fechas o recordatorio, al crear la tarea irás al
                      calendario.
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
              </div>
            </div>
          </Card>

          <aside className="grid h-fit gap-5">
            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <Target className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Objetivo</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    La tarea se creará aquí
                  </h2>
                </div>
              </div>

              <div className="mt-5">
                {loadingObjetivo ? (
                  <div className="space-y-3">
                    <div className="h-5 w-2/3 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                  </div>
                ) : objetivo ? (
                  <div className={theme.card.inner}>
                    <p className="text-lg font-black text-slate-950">
                      {objetivo.titulo}
                    </p>

                    <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                      {objetivo.descripcion || "Sin descripción"}
                    </p>

                    {objetivo.proyecto ? (
                      <div
                        className={`${theme.badge.base} ${theme.badge.sky} mt-4 inline-flex items-center gap-1.5 normal-case tracking-normal`}
                      >
                        <FolderKanban className="h-3.5 w-3.5" />
                        {objetivo.proyecto.nombre}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className={`${theme.card.inner} text-sm font-medium text-slate-600`}>
                    Objetivo no encontrado.
                  </p>
                )}
              </div>
            </Card>

            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Fechas</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Vista previa
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <div className={theme.card.inner}>
                  <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                    <Clock3 className="h-4 w-4" />
                    Inicio
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-600">
                    {formatFecha(fechaInicio)}
                  </p>
                </div>

                <div className={theme.card.inner}>
                  <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                    <CalendarDays className="h-4 w-4" />
                    Fin
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-600">
                    {formatFecha(fechaLimite)}
                  </p>
                </div>

                <div className={theme.card.inner}>
                  <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                    <Clock3 className="h-4 w-4" />
                    Recordatorio
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-600">
                    {formatFecha(recordatorio)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                  <Info className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Regla de fechas</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Evitar tareas cruzadas
                  </h2>
                </div>
              </div>

              <p className={`${theme.card.inner} mt-5 text-sm font-medium leading-6`}>
                Si ya existe una tarea activa dentro de este objetivo con un
                rango cruzado, el sistema bloqueará la creación.
              </p>
            </Card>

            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Después de crear</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Destino automático
                  </h2>
                </div>
              </div>

              <p className={`${theme.card.inner} mt-5 text-sm font-medium leading-6`}>
                La tarea aparecerá en el detalle del objetivo. Si tiene fechas o
                recordatorio, también irás al calendario para verla programada.
              </p>
            </Card>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}