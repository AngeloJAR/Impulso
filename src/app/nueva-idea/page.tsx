"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Lightbulb,
  ListTodo,
  Plus,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";

import { crearIdeaRapida } from "@/features/inbox/actions";
import { crearProyecto } from "@/features/proyectos/actions";
import { getProyectos, type ProyectoResumen } from "@/features/proyectos/queries";
import { crearObjetivo, type EstadoObjetivo } from "@/features/objetivos/actions";
import { crearTarea } from "@/features/tareas/actions";
import { type EstadoTarea, type PrioridadTarea } from "@/features/tareas/queries";
import { theme } from "@/config/theme";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ModoProyecto = "existente" | "nuevo";

type TareaDraft = {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: PrioridadTarea;
  estado: EstadoTarea;
  fechaInicio: string;
  fechaLimite: string;
  recordatorio: string;
};

const coloresProyecto = [
  { value: "slate", label: "Slate" },
  { value: "amber", label: "Ámbar" },
  { value: "sky", label: "Azul" },
  { value: "emerald", label: "Verde" },
  { value: "violet", label: "Violeta" },
  { value: "rose", label: "Rosa" },
  { value: "indigo", label: "Índigo" },
] as const;

const prioridadStyles: Record<PrioridadTarea, string> = {
  baja: theme.states.prioridad.baja,
  media: theme.states.prioridad.media,
  alta: theme.states.prioridad.alta,
};

const estadoTareaStyles: Record<EstadoTarea, string> = {
  pendiente: theme.states.tarea.pendiente,
  hoy: theme.states.tarea.hoy,
  en_proceso: theme.states.tarea.en_proceso,
  bloqueada: theme.states.tarea.bloqueada,
  terminada: theme.states.tarea.terminada,
};

function crearTareaVacia(id: string): TareaDraft {
  return {
    id,
    titulo: "",
    descripcion: "",
    prioridad: "media",
    estado: "pendiente",
    fechaInicio: "",
    fechaLimite: "",
    recordatorio: "",
  };
}

function capitalizar(value: string) {
  const clean = value.replaceAll("_", " ");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

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

export default function NuevaIdeaPage() {
  const router = useRouter();

  const [ideaTitulo, setIdeaTitulo] = useState("");
  const [ideaDescripcion, setIdeaDescripcion] = useState("");

  const [modoProyecto, setModoProyecto] = useState<ModoProyecto>("existente");
  const [proyectoId, setProyectoId] = useState("");

  const [nuevoProyectoNombre, setNuevoProyectoNombre] = useState("");
  const [nuevoProyectoDescripcion, setNuevoProyectoDescripcion] = useState("");
  const [nuevoProyectoColor, setNuevoProyectoColor] =
    useState<(typeof coloresProyecto)[number]["value"]>("slate");

  const [objetivoTitulo, setObjetivoTitulo] = useState("");
  const [objetivoDescripcion, setObjetivoDescripcion] = useState("");
  const [objetivoFechaInicio, setObjetivoFechaInicio] = useState("");
  const [objetivoFechaLimite, setObjetivoFechaLimite] = useState("");
  const [objetivoEstado, setObjetivoEstado] = useState<EstadoObjetivo>("activo");

  const [tareas, setTareas] = useState<TareaDraft[]>([
    crearTareaVacia("tarea-inicial"),
  ]);

  const [proyectos, setProyectos] = useState<ProyectoResumen[]>([]);
  const [loadingProyectos, setLoadingProyectos] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [isPending, startTransition] = useTransition();

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
    void loadProyectos();
  }, 0);

  return () => {
    window.clearTimeout(timeoutId);
  };
}, [loadProyectos]);

  const proyectoSeleccionado = useMemo(() => {
    return proyectos.find((proyecto) => proyecto.id === proyectoId) ?? null;
  }, [proyectos, proyectoId]);

  const tareasValidas = useMemo(() => {
    return tareas.filter((tarea) => tarea.titulo.trim());
  }, [tareas]);

  const fechasObjetivoInvalidas = Boolean(
    objetivoFechaInicio &&
      objetivoFechaLimite &&
      objetivoFechaInicio > objetivoFechaLimite
  );

  const tareasConFechasInvalidas = useMemo(() => {
    return tareas.filter((tarea) => {
      return tarea.fechaInicio && tarea.fechaLimite && tarea.fechaInicio > tarea.fechaLimite;
    });
  }, [tareas]);

  const puedeGuardar = useMemo(() => {
    if (!ideaTitulo.trim()) return false;
    if (modoProyecto === "existente" && !proyectoId) return false;
    if (modoProyecto === "nuevo" && !nuevoProyectoNombre.trim()) return false;
    if (!objetivoTitulo.trim()) return false;
    if (tareasValidas.length === 0) return false;
    if (fechasObjetivoInvalidas) return false;
    if (tareasConFechasInvalidas.length > 0) return false;

    return true;
  }, [
    fechasObjetivoInvalidas,
    ideaTitulo,
    modoProyecto,
    nuevoProyectoNombre,
    objetivoTitulo,
    proyectoId,
    tareasConFechasInvalidas.length,
    tareasValidas.length,
  ]);

  function handleIdeaTituloChange(value: string) {
    setIdeaTitulo(value);

    if (!objetivoTitulo.trim() && value.trim()) {
      setObjetivoTitulo(value.trim());
    }
  }

  function handleIdeaDescripcionChange(value: string) {
    setIdeaDescripcion(value);

    if (!objetivoDescripcion.trim() && value.trim()) {
      setObjetivoDescripcion(value.trim());
    }
  }

  function actualizarTarea(
    tareaId: string,
    field: keyof Omit<TareaDraft, "id">,
    value: string
  ) {
    setTareas((current) =>
      current.map((tarea) =>
        tarea.id === tareaId
          ? {
              ...tarea,
              [field]: value,
            }
          : tarea
      )
    );
  }

  function agregarTarea() {
    setTareas((current) => [
      ...current,
      crearTareaVacia(`tarea-${Date.now()}-${current.length + 1}`),
    ]);
  }

  function quitarTarea(tareaId: string) {
    setTareas((current) => {
      if (current.length === 1) return current;

      return current.filter((tarea) => tarea.id !== tareaId);
    });
  }

  function validarFormulario() {
    if (!ideaTitulo.trim()) {
      throw new Error("Escribe la idea principal.");
    }

    if (modoProyecto === "existente" && !proyectoId) {
      throw new Error("Selecciona un proyecto existente o crea uno nuevo.");
    }

    if (modoProyecto === "nuevo" && !nuevoProyectoNombre.trim()) {
      throw new Error("Escribe el nombre del nuevo proyecto.");
    }

    if (!objetivoTitulo.trim()) {
      throw new Error("Escribe el objetivo que nace de esta idea.");
    }

    if (fechasObjetivoInvalidas) {
      throw new Error("La fecha de inicio del objetivo no puede ser mayor que la fecha límite.");
    }

    if (tareasValidas.length === 0) {
      throw new Error("Agrega al menos una tarea para que la idea avance.");
    }

    const tareaConFechasInvertidas = tareasValidas.find(
      (tarea) => tarea.fechaInicio && tarea.fechaLimite && tarea.fechaInicio > tarea.fechaLimite
    );

    if (tareaConFechasInvertidas) {
      throw new Error(
        `La tarea "${tareaConFechasInvertidas.titulo}" tiene fecha de inicio mayor que fecha límite.`
      );
    }

    return tareasValidas;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    startTransition(() => {
      void (async () => {
        try {
          const tareasValidas = validarFormulario();

          let proyectoFinalId = proyectoId;

          if (modoProyecto === "nuevo") {
            const proyecto = await crearProyecto({
              nombre: nuevoProyectoNombre,
              descripcion: nuevoProyectoDescripcion,
              color: nuevoProyectoColor,
            });

            proyectoFinalId = proyecto.id;
          }

          const idea = await crearIdeaRapida({
            titulo: ideaTitulo,
            descripcion: ideaDescripcion,
            proyectoId: proyectoFinalId,
            prioridad: "media",
            fechaRecordatorio: "",
          });

          const objetivo = await crearObjetivo({
            titulo: objetivoTitulo,
            descripcion: objetivoDescripcion,
            proyectoId: proyectoFinalId,
            fechaInicio: objetivoFechaInicio,
            fechaLimite: objetivoFechaLimite,
            estado: objetivoEstado,
          });

          for (const [index, tarea] of tareasValidas.entries()) {
            await crearTarea({
              titulo: tarea.titulo,
              descripcion: tarea.descripcion,
              proyectoId: proyectoFinalId,
              objetivoId: objetivo.id,
              prioridad: tarea.prioridad,
              estado: tarea.estado,
              fecha: tarea.fechaInicio,
              fechaInicio: tarea.fechaInicio,
              fechaLimite: tarea.fechaLimite,
              recordatorio: tarea.recordatorio,
              ideaId: index === 0 ? idea.id : undefined,
            });
          }

          setMessage("Flujo creado correctamente: idea, proyecto, objetivo y tareas.");
          router.push(`/proyectos/${proyectoFinalId}`);
          router.refresh();
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "No se pudo completar el flujo.";

          setError(message);
        }
      })();
    });
  }

  return (
    <AppShell
      title="Nueva idea"
      description="Convierte una idea en proyecto, objetivo y tareas desde un solo flujo."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
                  <Sparkles className="h-4 w-4" />
                  Captura inteligente
                </div>

                <h2 className={theme.hero.title}>
                  No guardes ideas sueltas. Dales dirección desde el inicio.
                </h2>

                <p className={theme.hero.description}>
                  Este flujo crea una idea, la conecta con un proyecto, genera un
                  objetivo y deja listas las primeras tareas para avanzar.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-4">
                  {[
                    { label: "Idea", icon: Lightbulb },
                    { label: "Proyecto", icon: FolderKanban },
                    { label: "Objetivo", icon: Target },
                    { label: "Tareas", icon: ListTodo },
                  ].map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.label}
                        className="rounded-[1.4rem] border border-slate-200 bg-white/80 p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                            <Icon className="h-4 w-4" />
                          </div>

                          <span className="text-xs font-black text-slate-500">
                            {index + 1}
                          </span>
                        </div>

                        <p className="mt-3 text-sm font-black text-slate-950">
                          {item.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          <Card className={theme.card.base}>
            <p className={theme.text.kicker}>Resumen</p>

            <h3 className="mt-3 text-2xl font-black text-slate-950">
              Lo que se va a crear
            </h3>

            <div className="mt-5 grid gap-3">
              {[
                {
                  icon: Lightbulb,
                  label: "Idea",
                  value: ideaTitulo.trim() || "Sin título",
                },
                {
                  icon: FolderKanban,
                  label: "Proyecto",
                  value:
                    modoProyecto === "nuevo"
                      ? nuevoProyectoNombre.trim() || "Proyecto nuevo sin nombre"
                      : proyectoSeleccionado?.nombre || "Sin proyecto seleccionado",
                },
                {
                  icon: Target,
                  label: "Objetivo",
                  value: objetivoTitulo.trim() || "Sin objetivo",
                },
                {
                  icon: ListTodo,
                  label: "Tareas",
                  value: `${tareasValidas.length} tarea(s) listas`,
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-700 shadow-sm ring-1 ring-slate-200">
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                          {item.label}
                        </p>

                        <p className="mt-1 line-clamp-2 text-sm font-black text-slate-950">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              type="submit"
              size="lg"
              className={`${theme.button.primaryLarge} mt-5 w-full`}
              disabled={isPending || !puedeGuardar}
            >
              {isPending ? "Creando flujo..." : "Crear flujo completo"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            {!puedeGuardar ? (
              <p className="mt-3 text-xs font-medium leading-5 text-slate-500">
                Completa idea, proyecto, objetivo y al menos una tarea para guardar.
              </p>
            ) : null}
          </Card>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <div className="grid gap-5">
            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                  <Lightbulb className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Paso 1</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Captura la idea
                  </h2>

                  <p className={`${theme.text.body} mt-1`}>
                    Escribe lo que tienes en mente. Luego se convertirá en objetivo
                    y tareas.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="ideaTitulo"
                    className="text-sm font-black text-slate-700"
                  >
                    Idea principal
                  </label>

                  <Input
                    id="ideaTitulo"
                    value={ideaTitulo}
                    onChange={(event) => handleIdeaTituloChange(event.target.value)}
                    placeholder="Ej: Crear sistema de contenido para marketing"
                    className={theme.input.base}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="ideaDescripcion"
                    className="text-sm font-black text-slate-700"
                  >
                    Descripción
                  </label>

                  <Textarea
                    id="ideaDescripcion"
                    value={ideaDescripcion}
                    onChange={(event) =>
                      handleIdeaDescripcionChange(event.target.value)
                    }
                    placeholder="Explica qué quieres lograr, por qué importa o qué contexto tiene..."
                    className={theme.input.textarea}
                  />
                </div>
              </div>
            </Card>

            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 ring-1 ring-sky-100">
                  <FolderKanban className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Paso 2</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Define el proyecto
                  </h2>

                  <p className={`${theme.text.body} mt-1`}>
                    Decide si la idea entra en un proyecto existente o crea uno nuevo.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setModoProyecto("existente")}
                  className={`rounded-[1.5rem] border p-4 text-left transition ${
                    modoProyecto === "existente"
                      ? "border-blue-200 bg-blue-50 text-blue-950 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                  }`}
                >
                  <p className="font-black">Proyecto existente</p>

                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    Usar un proyecto actual.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setModoProyecto("nuevo")}
                  className={`rounded-[1.5rem] border p-4 text-left transition ${
                    modoProyecto === "nuevo"
                      ? "border-blue-200 bg-blue-50 text-blue-950 shadow-sm"
                      : "border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                  }`}
                >
                  <p className="font-black">Nuevo proyecto</p>

                  <p className="mt-1 text-sm leading-5 text-slate-600">
                    Crear un espacio nuevo.
                  </p>
                </button>
              </div>

              {modoProyecto === "existente" ? (
                <div className="mt-5 grid gap-2">
                  <label
                    htmlFor="proyectoId"
                    className="text-sm font-black text-slate-700"
                  >
                    Selecciona proyecto
                  </label>

                  <select
                    id="proyectoId"
                    value={proyectoId}
                    onChange={(event) => setProyectoId(event.target.value)}
                    disabled={loadingProyectos}
                    className={theme.input.select}
                  >
                    <option value="">
                      {loadingProyectos ? "Cargando proyectos..." : "Selecciona un proyecto"}
                    </option>

                    {proyectos.map((proyecto) => (
                      <option key={proyecto.id} value={proyecto.id}>
                        {proyecto.nombre}
                      </option>
                    ))}
                  </select>

                  <p className={theme.text.smallMuted}>
                    {proyectoSeleccionado
                      ? `La idea se conectará con: ${proyectoSeleccionado.nombre}`
                      : "El objetivo y las tareas quedarán dentro del proyecto seleccionado."}
                  </p>
                </div>
              ) : (
                <div className="mt-5 grid gap-4">
                  <div className="grid gap-2">
                    <label
                      htmlFor="nuevoProyectoNombre"
                      className="text-sm font-black text-slate-700"
                    >
                      Nombre del proyecto
                    </label>

                    <Input
                      id="nuevoProyectoNombre"
                      value={nuevoProyectoNombre}
                      onChange={(event) => setNuevoProyectoNombre(event.target.value)}
                      placeholder="Ej: Marketing"
                      className={theme.input.base}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label
                      htmlFor="nuevoProyectoDescripcion"
                      className="text-sm font-black text-slate-700"
                    >
                      Descripción
                    </label>

                    <Textarea
                      id="nuevoProyectoDescripcion"
                      value={nuevoProyectoDescripcion}
                      onChange={(event) =>
                        setNuevoProyectoDescripcion(event.target.value)
                      }
                      placeholder="¿Para qué existe este proyecto?"
                      className={theme.input.textarea}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label
                      htmlFor="nuevoProyectoColor"
                      className="text-sm font-black text-slate-700"
                    >
                      Color
                    </label>

                    <select
                      id="nuevoProyectoColor"
                      value={nuevoProyectoColor}
                      onChange={(event) =>
                        setNuevoProyectoColor(
                          event.target.value as (typeof coloresProyecto)[number]["value"]
                        )
                      }
                      className={theme.input.select}
                    >
                      {coloresProyecto.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </Card>

            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <Target className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Paso 3</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Crea el objetivo
                  </h2>

                  <p className={`${theme.text.body} mt-1`}>
                    Convierte la idea en una meta clara.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="objetivoTitulo"
                    className="text-sm font-black text-slate-700"
                  >
                    Título del objetivo
                  </label>

                  <Input
                    id="objetivoTitulo"
                    value={objetivoTitulo}
                    onChange={(event) => setObjetivoTitulo(event.target.value)}
                    placeholder="Ej: Lanzar sistema semanal de contenido"
                    className={theme.input.base}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="objetivoDescripcion"
                    className="text-sm font-black text-slate-700"
                  >
                    Descripción del objetivo
                  </label>

                  <Textarea
                    id="objetivoDescripcion"
                    value={objetivoDescripcion}
                    onChange={(event) => setObjetivoDescripcion(event.target.value)}
                    placeholder="Define qué significa completar este objetivo..."
                    className={theme.input.textarea}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <label
                      htmlFor="objetivoFechaInicio"
                      className="text-sm font-black text-slate-700"
                    >
                      Inicio
                    </label>

                    <Input
                      id="objetivoFechaInicio"
                      type="date"
                      value={objetivoFechaInicio}
                      onChange={(event) => setObjetivoFechaInicio(event.target.value)}
                      className={theme.input.base}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label
                      htmlFor="objetivoFechaLimite"
                      className="text-sm font-black text-slate-700"
                    >
                      Fin
                    </label>

                    <Input
                      id="objetivoFechaLimite"
                      type="date"
                      value={objetivoFechaLimite}
                      onChange={(event) => setObjetivoFechaLimite(event.target.value)}
                      className={theme.input.base}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label
                      htmlFor="objetivoEstado"
                      className="text-sm font-black text-slate-700"
                    >
                      Estado
                    </label>

                    <select
                      id="objetivoEstado"
                      value={objetivoEstado}
                      onChange={(event) =>
                        setObjetivoEstado(event.target.value as EstadoObjetivo)
                      }
                      className={theme.input.select}
                    >
                      <option value="activo">Activo</option>
                      <option value="pausado">Pausado</option>
                      <option value="completado">Completado</option>
                      <option value="abandonado">Abandonado</option>
                    </select>
                  </div>
                </div>

                {fechasObjetivoInvalidas ? (
                  <div className={theme.alerts.warning}>
                    La fecha de inicio del objetivo no puede ser mayor que la fecha límite.
                  </div>
                ) : null}
              </div>
            </Card>

            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-violet-100">
                  <ListTodo className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Paso 4</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Tareas iniciales
                  </h2>

                  <p className={`${theme.text.body} mt-1`}>
                    Agrega las primeras acciones. Con fechas, aparecerán en calendario.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4">
                {tareas.map((tarea, index) => {
                  const fechasInvalidas = Boolean(
                    tarea.fechaInicio &&
                      tarea.fechaLimite &&
                      tarea.fechaInicio > tarea.fechaLimite
                  );

                  return (
                    <div
                      key={tarea.id}
                      className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-black text-slate-950">
                            Tarea {index + 1}
                          </h3>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span
                              className={`${theme.badge.base} ${
                                prioridadStyles[tarea.prioridad]
                              }`}
                            >
                              {capitalizar(tarea.prioridad)}
                            </span>

                            <span
                              className={`${theme.badge.base} ${
                                estadoTareaStyles[tarea.estado]
                              }`}
                            >
                              {capitalizar(tarea.estado)}
                            </span>
                          </div>
                        </div>

                        {tareas.length > 1 ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 rounded-2xl border-rose-100 bg-white px-3 text-rose-700 hover:bg-rose-50"
                            onClick={() => quitarTarea(tarea.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>

                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <label
                            htmlFor={`tarea-${tarea.id}-titulo`}
                            className="text-sm font-black text-slate-700"
                          >
                            Título
                          </label>

                          <Input
                            id={`tarea-${tarea.id}-titulo`}
                            value={tarea.titulo}
                            onChange={(event) =>
                              actualizarTarea(tarea.id, "titulo", event.target.value)
                            }
                            placeholder="Ej: Definir 5 ideas de contenido"
                            className={theme.input.base}
                          />
                        </div>

                        <div className="grid gap-2">
                          <label
                            htmlFor={`tarea-${tarea.id}-descripcion`}
                            className="text-sm font-black text-slate-700"
                          >
                            Descripción
                          </label>

                          <Textarea
                            id={`tarea-${tarea.id}-descripcion`}
                            value={tarea.descripcion}
                            onChange={(event) =>
                              actualizarTarea(
                                tarea.id,
                                "descripcion",
                                event.target.value
                              )
                            }
                            placeholder="Detalles de esta tarea..."
                            className={theme.input.textarea}
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                          <div className="grid gap-2">
                            <label
                              htmlFor={`tarea-${tarea.id}-prioridad`}
                              className="text-sm font-black text-slate-700"
                            >
                              Prioridad
                            </label>

                            <select
                              id={`tarea-${tarea.id}-prioridad`}
                              value={tarea.prioridad}
                              onChange={(event) =>
                                actualizarTarea(
                                  tarea.id,
                                  "prioridad",
                                  event.target.value
                                )
                              }
                              className={theme.input.select}
                            >
                              <option value="baja">Baja</option>
                              <option value="media">Media</option>
                              <option value="alta">Alta</option>
                            </select>
                          </div>

                          <div className="grid gap-2">
                            <label
                              htmlFor={`tarea-${tarea.id}-estado`}
                              className="text-sm font-black text-slate-700"
                            >
                              Estado
                            </label>

                            <select
                              id={`tarea-${tarea.id}-estado`}
                              value={tarea.estado}
                              onChange={(event) =>
                                actualizarTarea(tarea.id, "estado", event.target.value)
                              }
                              className={theme.input.select}
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="hoy">Hoy</option>
                              <option value="en_proceso">En proceso</option>
                              <option value="bloqueada">Bloqueada</option>
                              <option value="terminada">Terminada</option>
                            </select>
                          </div>

                          <div className="grid gap-2">
                            <label
                              htmlFor={`tarea-${tarea.id}-inicio`}
                              className="text-sm font-black text-slate-700"
                            >
                              Inicio
                            </label>

                            <Input
                              id={`tarea-${tarea.id}-inicio`}
                              type="date"
                              value={tarea.fechaInicio}
                              onChange={(event) =>
                                actualizarTarea(
                                  tarea.id,
                                  "fechaInicio",
                                  event.target.value
                                )
                              }
                              className={theme.input.base}
                            />
                          </div>

                          <div className="grid gap-2">
                            <label
                              htmlFor={`tarea-${tarea.id}-fin`}
                              className="text-sm font-black text-slate-700"
                            >
                              Fin
                            </label>

                            <Input
                              id={`tarea-${tarea.id}-fin`}
                              type="date"
                              value={tarea.fechaLimite}
                              onChange={(event) =>
                                actualizarTarea(
                                  tarea.id,
                                  "fechaLimite",
                                  event.target.value
                                )
                              }
                              className={theme.input.base}
                            />
                          </div>

                          <div className="grid gap-2">
                            <label
                              htmlFor={`tarea-${tarea.id}-recordatorio`}
                              className="text-sm font-black text-slate-700"
                            >
                              Recordatorio
                            </label>

                            <Input
                              id={`tarea-${tarea.id}-recordatorio`}
                              type="date"
                              value={tarea.recordatorio}
                              onChange={(event) =>
                                actualizarTarea(
                                  tarea.id,
                                  "recordatorio",
                                  event.target.value
                                )
                              }
                              className={theme.input.base}
                            />
                          </div>
                        </div>

                        {fechasInvalidas ? (
                          <div className={theme.alerts.warning}>
                            La fecha de inicio no puede ser mayor que la fecha límite.
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}

                <Button
                  type="button"
                  variant="outline"
                  className={theme.button.secondaryLarge}
                  onClick={agregarTarea}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar otra tarea
                </Button>
              </div>
            </Card>
          </div>

          <aside className="grid h-fit gap-5">
            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Checklist</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Estado del flujo
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {[
                  {
                    label: "Idea escrita",
                    done: Boolean(ideaTitulo.trim()),
                  },
                  {
                    label:
                      modoProyecto === "nuevo"
                        ? "Proyecto nuevo definido"
                        : "Proyecto seleccionado",
                    done:
                      modoProyecto === "nuevo"
                        ? Boolean(nuevoProyectoNombre.trim())
                        : Boolean(proyectoId),
                  },
                  {
                    label: "Objetivo escrito",
                    done: Boolean(objetivoTitulo.trim()),
                  },
                  {
                    label: "Al menos una tarea",
                    done: tareasValidas.length > 0,
                  },
                  {
                    label: "Fechas válidas",
                    done:
                      !fechasObjetivoInvalidas &&
                      tareasConFechasInvalidas.length === 0,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                        item.done
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                          : "bg-white text-slate-400 ring-1 ring-slate-200"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </div>

                    <p className="text-sm font-bold text-slate-700">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className={theme.card.base}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                  <Clock3 className="h-5 w-5" />
                </div>

                <div>
                  <p className={theme.text.kicker}>Vista previa</p>

                  <h2 className="mt-2 text-xl font-black text-slate-950">
                    Fechas principales
                  </h2>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                    <Target className="h-4 w-4" />
                    Objetivo
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-600">
                    {formatFecha(objetivoFechaInicio)} →{" "}
                    {formatFecha(objetivoFechaLimite)}
                  </p>
                </div>

                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                    <CalendarDays className="h-4 w-4" />
                    Primera tarea
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-600">
                    {formatFecha(tareas[0]?.fechaInicio)} →{" "}
                    {formatFecha(tareas[0]?.fechaLimite)}
                  </p>
                </div>
              </div>
            </Card>

            <Card className={theme.card.base}>
              <p className={theme.text.kicker}>Al guardar</p>

              <div className="mt-5 grid gap-3">
                {[
                  "Se guarda la idea",
                  modoProyecto === "nuevo"
                    ? "Se crea un proyecto nuevo"
                    : "Se usa el proyecto seleccionado",
                  "Se crea un objetivo",
                  "Se crean las tareas",
                  "Se abre el proyecto creado o seleccionado",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <p className="text-sm font-bold text-slate-700">{item}</p>
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                size="lg"
                className={`${theme.button.primaryLarge} mt-5 w-full`}
                disabled={isPending || !puedeGuardar}
              >
                {isPending ? "Creando flujo..." : "Crear flujo completo"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Card>
          </aside>
        </section>
      </form>
    </AppShell>
  );
}