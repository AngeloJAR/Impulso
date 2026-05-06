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
  Plus,
  Target,
} from "lucide-react";

import { crearObjetivo, type EstadoObjetivo } from "@/features/objetivos/actions";
import {
  getProyectoDetalle,
  type ProyectoDetalle,
} from "@/features/proyectos/project-detail-queries";
import { theme } from "@/config/theme";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const estadosObjetivo: {
  value: EstadoObjetivo;
  label: string;
  description: string;
}[] = [
  {
    value: "activo",
    label: "Activo",
    description: "El objetivo está en marcha.",
  },
  {
    value: "pausado",
    label: "Pausado",
    description: "Existe, pero no se trabaja ahora.",
  },
  {
    value: "completado",
    label: "Completado",
    description: "Ya fue terminado.",
  },
  {
    value: "abandonado",
    label: "Abandonado",
    description: "Ya no se continuará.",
  },
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

export default function NuevoObjetivoProyectoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const proyectoId = params.id;

  const [proyecto, setProyecto] = useState<ProyectoDetalle | null>(null);
  const [loadingProyecto, setLoadingProyecto] = useState(true);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [estado, setEstado] = useState<EstadoObjetivo>("activo");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [isPending, startTransition] = useTransition();

  const estadoSeleccionado = useMemo(() => {
    return estadosObjetivo.find((item) => item.value === estado);
  }, [estado]);

  const fechasInvalidas = useMemo(() => {
    return Boolean(fechaInicio && fechaLimite && fechaInicio > fechaLimite);
  }, [fechaInicio, fechaLimite]);

  const loadProyecto = useCallback(async () => {
    setLoadingProyecto(true);
    setError("");

    try {
      const data = await getProyectoDetalle(proyectoId);
      setProyecto(data.proyecto);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo cargar el proyecto.";

      setError(message);
    } finally {
      setLoadingProyecto(false);
    }
  }, [proyectoId]);

useEffect(() => {
  const timeoutId = window.setTimeout(() => {
    void loadProyecto();
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [loadProyecto]);

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

          if (objetivo?.id) {
            router.push(
              `/tareas?proyectoId=${proyectoId}&objetivoId=${objetivo.id}#crear-tarea`
            );
            router.refresh();
            return;
          }

          router.push(`/proyectos/${proyectoId}`);
          router.refresh();
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
      title="Nuevo objetivo"
      description="Crea un objetivo dentro del proyecto seleccionado y continúa directo con sus tareas."
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href={`/proyectos/${proyectoId}`}>
            <Button variant="outline" className={theme.button.secondary}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al proyecto
            </Button>
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm">
            Flujo: Proyecto → Objetivo → Tarea
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
                      <Target className="h-4 w-4" />
                      Objetivo nuevo
                    </div>

                    <h2 className={theme.hero.title}>
                      Define qué quieres lograr dentro de este proyecto.
                    </h2>

                    <p className={theme.hero.description}>
                      Un objetivo debe ser claro, accionable y fácil de convertir
                      en tareas. Después de crearlo, Impulso te llevará directo a
                      crear la primera tarea.
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
                      Título del objetivo
                    </label>

                    <Input
                      id="titulo"
                      value={titulo}
                      onChange={(event) => setTitulo(event.target.value)}
                      placeholder="Ej: Lanzar primera versión pública de Impulso"
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
                      placeholder="Describe qué debe pasar para considerar este objetivo como completado..."
                      className={theme.input.textarea}
                    />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-3">
                    <div className="grid gap-2">
                      <label
                        htmlFor="fechaInicio"
                        className="text-sm font-black text-slate-700"
                      >
                        Fecha de inicio
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
                        Fecha límite
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
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {fechasInvalidas ? (
                    <div className={theme.alerts.warning}>
                      La fecha de inicio no puede ser mayor que la fecha límite.
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium leading-6 text-slate-600">
                      Al crear el objetivo, irás directo al formulario para crear
                      una tarea conectada.
                    </p>

                    <Button
                      type="submit"
                      size="lg"
                      className={theme.button.primaryLarge}
                      disabled={isPending || fechasInvalidas}
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      {isPending ? "Creando..." : "Crear objetivo"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </Card>

          <aside className="grid h-fit gap-5">
            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                  <FolderKanban className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Proyecto actual</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Donde se guardará
                  </h2>
                </div>
              </div>

              <div className="mt-5">
                {loadingProyecto ? (
                  <div className="space-y-3">
                    <div className="h-5 w-2/3 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                  </div>
                ) : proyecto ? (
                  <div className={theme.card.inner}>
                    <p className="text-lg font-black text-slate-950">
                      {proyecto.nombre}
                    </p>

                    <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                      {proyecto.descripcion || "Sin descripción"}
                    </p>
                  </div>
                ) : (
                  <p className={`${theme.card.inner} text-sm font-medium text-slate-600`}>
                    Proyecto no encontrado.
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
                    Rango del objetivo
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
                    Límite
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-600">
                    {formatFecha(fechaLimite)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <Info className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Recomendación</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Hazlo accionable
                  </h2>
                </div>
              </div>

              <div className={`${theme.card.inner} mt-5`}>
                <p className="text-sm font-medium leading-6 text-slate-600">
                  Escribe el objetivo como un resultado concreto. Luego crea
                  tareas pequeñas que puedas completar sin pensar demasiado.
                </p>
              </div>
            </Card>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}