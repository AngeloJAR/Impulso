"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  FolderKanban,
  Lightbulb,
  ListTodo,
  Plus,
  Target,
} from "lucide-react";

import { crearIdeaRapida } from "@/features/inbox/actions";
import { crearProyecto } from "@/features/proyectos/actions";
import { getProyectos, type ProyectoResumen } from "@/features/proyectos/queries";
import { crearObjetivo, type EstadoObjetivo } from "@/features/objetivos/actions";
import { crearTarea } from "@/features/tareas/actions";
import { type EstadoTarea, type PrioridadTarea } from "@/features/tareas/queries";
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

const inputClassName =
  "rounded-2xl border-white/10 bg-white/10 text-white placeholder:text-slate-400 shadow-sm backdrop-blur-xl focus:border-white/30 focus:ring-4 focus:ring-white/10";

const textareaClassName =
  "min-h-28 rounded-2xl border-white/10 bg-white/10 text-white placeholder:text-slate-400 shadow-sm backdrop-blur-xl focus:border-white/30 focus:ring-4 focus:ring-white/10";

const selectClassName =
  "h-10 rounded-2xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white shadow-sm outline-none transition focus:border-white/30 focus:ring-4 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-60";

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

  const [tareas, setTareas] = useState<TareaDraft[]>([crearTareaVacia("tarea-inicial")]);

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

  const proyectoSeleccionado = useMemo(
    () => proyectos.find((proyecto) => proyecto.id === proyectoId),
    [proyectos, proyectoId]
  );

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

  function actualizarTarea(tareaId: string, field: keyof Omit<TareaDraft, "id">, value: string) {
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

    const tareasValidas = tareas.filter((tarea) => tarea.titulo.trim());

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

    startTransition(async () => {
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
        const message = err instanceof Error ? err.message : "No se pudo completar el flujo.";

        setError(message);
      }
    });
  }

  return (
    <AppShell title="Nueva idea" description="Flujo guiado: idea → proyecto → objetivo → tareas.">
      <form onSubmit={handleSubmit} className="grid gap-6 text-white">
        {error ? (
          <div className="rounded-2xl border border-red-300/30 bg-red-500/15 px-4 py-3 text-sm font-medium text-red-100 backdrop-blur-xl">
            {error}
          </div>
        ) : null}

        {message ? (
          <div className="rounded-2xl border border-emerald-300/30 bg-emerald-500/15 px-4 py-3 text-sm font-medium text-emerald-100 backdrop-blur-xl">
            {message}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="grid gap-6">
            <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <div className="mb-5 flex items-start gap-4">
                <div className="rounded-2xl bg-amber-300/20 p-3 text-amber-100 ring-1 ring-amber-200/20">
                  <Lightbulb className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-black text-white">1. Captura la idea</h2>

                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    No la dejes suelta. Esta idea se convertirá en proyecto, objetivo y tareas.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="ideaTitulo" className="text-sm font-semibold text-slate-100">
                    Idea principal
                  </label>

                  <Input
                    id="ideaTitulo"
                    value={ideaTitulo}
                    onChange={(event) => handleIdeaTituloChange(event.target.value)}
                    placeholder="Ej: Crear sistema de contenido para Marketing"
                    className={inputClassName}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="ideaDescripcion" className="text-sm font-semibold text-slate-100">
                    Descripción
                  </label>

                  <Textarea
                    id="ideaDescripcion"
                    value={ideaDescripcion}
                    onChange={(event) => handleIdeaDescripcionChange(event.target.value)}
                    placeholder="Explica qué quieres lograr, por qué importa o qué contexto tiene..."
                    className={textareaClassName}
                  />
                </div>
              </div>
            </Card>

            <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <div className="mb-5 flex items-start gap-4">
                <div className="rounded-2xl bg-sky-300/20 p-3 text-sky-100 ring-1 ring-sky-200/20">
                  <FolderKanban className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-black text-white">2. Proyecto</h2>

                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Decide si esta idea pertenece a un proyecto existente o si debe crear uno nuevo.
                  </p>
                </div>
              </div>

              <div className="mb-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setModoProyecto("existente")}
                  className={`rounded-3xl border p-4 text-left transition ${
                    modoProyecto === "existente"
                      ? "border-white bg-white text-slate-950 shadow-sm"
                      : "border-white/10 bg-white/10 text-slate-100 backdrop-blur-xl hover:border-white/25 hover:bg-white/15"
                  }`}
                >
                  <p className="font-black">Proyecto existente</p>

                  <p
                    className={`mt-1 text-sm leading-5 ${
                      modoProyecto === "existente" ? "text-slate-700" : "text-slate-300"
                    }`}
                  >
                    Usar uno de tus proyectos actuales.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setModoProyecto("nuevo")}
                  className={`rounded-3xl border p-4 text-left transition ${
                    modoProyecto === "nuevo"
                      ? "border-white bg-white text-slate-950 shadow-sm"
                      : "border-white/10 bg-white/10 text-slate-100 backdrop-blur-xl hover:border-white/25 hover:bg-white/15"
                  }`}
                >
                  <p className="font-black">Nuevo proyecto</p>

                  <p
                    className={`mt-1 text-sm leading-5 ${
                      modoProyecto === "nuevo" ? "text-slate-700" : "text-slate-300"
                    }`}
                  >
                    Crear un espacio nuevo para esta idea.
                  </p>
                </button>
              </div>

              {modoProyecto === "existente" ? (
                <div className="grid gap-2">
                  <label htmlFor="proyectoId" className="text-sm font-semibold text-slate-100">
                    Selecciona proyecto
                  </label>

                  <select
                    id="proyectoId"
                    value={proyectoId}
                    onChange={(event) => setProyectoId(event.target.value)}
                    disabled={loadingProyectos}
                    className={selectClassName}
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

                  <p className="text-xs leading-5 text-slate-400">
                    {proyectoSeleccionado
                      ? `La idea se conectará con: ${proyectoSeleccionado.nombre}`
                      : "El objetivo y las tareas quedarán dentro de este proyecto."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <label
                      htmlFor="nuevoProyectoNombre"
                      className="text-sm font-semibold text-slate-100"
                    >
                      Nombre del proyecto
                    </label>

                    <Input
                      id="nuevoProyectoNombre"
                      value={nuevoProyectoNombre}
                      onChange={(event) => setNuevoProyectoNombre(event.target.value)}
                      placeholder="Ej: Marketing"
                      className={inputClassName}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label
                      htmlFor="nuevoProyectoDescripcion"
                      className="text-sm font-semibold text-slate-100"
                    >
                      Descripción
                    </label>

                    <Textarea
                      id="nuevoProyectoDescripcion"
                      value={nuevoProyectoDescripcion}
                      onChange={(event) => setNuevoProyectoDescripcion(event.target.value)}
                      placeholder="¿Para qué existe este proyecto?"
                      className={textareaClassName}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label
                      htmlFor="nuevoProyectoColor"
                      className="text-sm font-semibold text-slate-100"
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
                      className={selectClassName}
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

            <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <div className="mb-5 flex items-start gap-4">
                <div className="rounded-2xl bg-emerald-300/20 p-3 text-emerald-100 ring-1 ring-emerald-200/20">
                  <Target className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-black text-white">3. Objetivo</h2>

                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Convierte la idea en una meta clara con rango de fechas.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="objetivoTitulo" className="text-sm font-semibold text-slate-100">
                    Título del objetivo
                  </label>

                  <Input
                    id="objetivoTitulo"
                    value={objetivoTitulo}
                    onChange={(event) => setObjetivoTitulo(event.target.value)}
                    placeholder="Ej: Lanzar sistema semanal de contenido"
                    className={inputClassName}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="objetivoDescripcion"
                    className="text-sm font-semibold text-slate-100"
                  >
                    Descripción del objetivo
                  </label>

                  <Textarea
                    id="objetivoDescripcion"
                    value={objetivoDescripcion}
                    onChange={(event) => setObjetivoDescripcion(event.target.value)}
                    placeholder="Define qué significa completar este objetivo..."
                    className={textareaClassName}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <label
                      htmlFor="objetivoFechaInicio"
                      className="text-sm font-semibold text-slate-100"
                    >
                      Inicio
                    </label>

                    <Input
                      id="objetivoFechaInicio"
                      type="date"
                      value={objetivoFechaInicio}
                      onChange={(event) => setObjetivoFechaInicio(event.target.value)}
                      className={inputClassName}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label
                      htmlFor="objetivoFechaLimite"
                      className="text-sm font-semibold text-slate-100"
                    >
                      Fin
                    </label>

                    <Input
                      id="objetivoFechaLimite"
                      type="date"
                      value={objetivoFechaLimite}
                      onChange={(event) => setObjetivoFechaLimite(event.target.value)}
                      className={inputClassName}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label
                      htmlFor="objetivoEstado"
                      className="text-sm font-semibold text-slate-100"
                    >
                      Estado
                    </label>

                    <select
                      id="objetivoEstado"
                      value={objetivoEstado}
                      onChange={(event) => setObjetivoEstado(event.target.value as EstadoObjetivo)}
                      className={selectClassName}
                    >
                      <option value="activo">Activo</option>
                      <option value="pausado">Pausado</option>
                      <option value="completado">Completado</option>
                      <option value="abandonado">Abandonado</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <div className="mb-5 flex items-start gap-4">
                <div className="rounded-2xl bg-violet-300/20 p-3 text-violet-100 ring-1 ring-violet-200/20">
                  <ListTodo className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-black text-white">4. Tareas iniciales</h2>

                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Agrega las primeras acciones. Luego aparecerán en el calendario si tienen fecha.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {tareas.map((tarea, index) => (
                  <div
                    key={tarea.id}
                    className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="font-black text-white">Tarea {index + 1}</h3>

                      {tareas.length > 1 ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="rounded-2xl border-white/15 bg-white/10 text-white hover:bg-white/15"
                          onClick={() => quitarTarea(tarea.id)}
                        >
                          Quitar
                        </Button>
                      ) : null}
                    </div>

                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <label
                          htmlFor={`tarea-${tarea.id}-titulo`}
                          className="text-sm font-semibold text-slate-100"
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
                          className={inputClassName}
                        />
                      </div>

                      <div className="grid gap-2">
                        <label
                          htmlFor={`tarea-${tarea.id}-descripcion`}
                          className="text-sm font-semibold text-slate-100"
                        >
                          Descripción
                        </label>

                        <Textarea
                          id={`tarea-${tarea.id}-descripcion`}
                          value={tarea.descripcion}
                          onChange={(event) =>
                            actualizarTarea(tarea.id, "descripcion", event.target.value)
                          }
                          placeholder="Detalles de esta tarea..."
                          className={textareaClassName}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        <div className="grid gap-2">
                          <label
                            htmlFor={`tarea-${tarea.id}-prioridad`}
                            className="text-sm font-semibold text-slate-100"
                          >
                            Prioridad
                          </label>

                          <select
                            id={`tarea-${tarea.id}-prioridad`}
                            value={tarea.prioridad}
                            onChange={(event) =>
                              actualizarTarea(tarea.id, "prioridad", event.target.value)
                            }
                            className={selectClassName}
                          >
                            <option value="baja">Baja</option>
                            <option value="media">Media</option>
                            <option value="alta">Alta</option>
                          </select>
                        </div>

                        <div className="grid gap-2">
                          <label
                            htmlFor={`tarea-${tarea.id}-estado`}
                            className="text-sm font-semibold text-slate-100"
                          >
                            Estado
                          </label>

                          <select
                            id={`tarea-${tarea.id}-estado`}
                            value={tarea.estado}
                            onChange={(event) =>
                              actualizarTarea(tarea.id, "estado", event.target.value)
                            }
                            className={selectClassName}
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
                            className="text-sm font-semibold text-slate-100"
                          >
                            Inicio
                          </label>

                          <Input
                            id={`tarea-${tarea.id}-inicio`}
                            type="date"
                            value={tarea.fechaInicio}
                            onChange={(event) =>
                              actualizarTarea(tarea.id, "fechaInicio", event.target.value)
                            }
                            className={inputClassName}
                          />
                        </div>

                        <div className="grid gap-2">
                          <label
                            htmlFor={`tarea-${tarea.id}-fin`}
                            className="text-sm font-semibold text-slate-100"
                          >
                            Fin
                          </label>

                          <Input
                            id={`tarea-${tarea.id}-fin`}
                            type="date"
                            value={tarea.fechaLimite}
                            onChange={(event) =>
                              actualizarTarea(tarea.id, "fechaLimite", event.target.value)
                            }
                            className={inputClassName}
                          />
                        </div>

                        <div className="grid gap-2">
                          <label
                            htmlFor={`tarea-${tarea.id}-recordatorio`}
                            className="text-sm font-semibold text-slate-100"
                          >
                            Recordatorio
                          </label>

                          <Input
                            id={`tarea-${tarea.id}-recordatorio`}
                            type="date"
                            value={tarea.recordatorio}
                            onChange={(event) =>
                              actualizarTarea(tarea.id, "recordatorio", event.target.value)
                            }
                            className={inputClassName}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl border-white/15 bg-white/10 text-white hover:bg-white/15"
                  onClick={agregarTarea}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar otra tarea
                </Button>
              </div>
            </Card>
          </div>

          <aside className="grid h-fit gap-6">
            <Card className="rounded-[2rem] border-white/10 bg-slate-950/72 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <h2 className="text-lg font-black text-white">Flujo lineal</h2>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Esta pantalla evita crear ideas sueltas. Todo lo que captures debe avanzar hacia
                proyecto, objetivo y tareas.
              </p>

              <div className="mt-6 grid gap-3">
                {[
                  "Idea capturada",
                  "Proyecto definido",
                  "Objetivo creado",
                  "Tareas calendarizables",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-xl"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-black text-slate-950">
                      {index + 1}
                    </span>

                    <p className="text-sm font-semibold text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <h2 className="text-lg font-black text-white">Qué pasará al guardar</h2>

              <div className="mt-5 grid gap-3">
                {[
                  "Se guarda la idea",
                  modoProyecto === "nuevo"
                    ? "Se crea un proyecto nuevo"
                    : "Se usa el proyecto seleccionado",
                  "Se crea un objetivo",
                  "Se crean las tareas",
                  "La idea queda marcada como convertida",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-100" />

                    <p className="text-sm font-semibold text-slate-100">{item}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Button
              type="submit"
              size="lg"
              className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100"
              disabled={isPending}
            >
              {isPending ? "Creando flujo..." : "Crear flujo completo"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </aside>
        </section>
      </form>
    </AppShell>
  );
}