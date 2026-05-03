"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  ListTodo,
  Plus,
  Target,
} from "lucide-react";

import { crearTarea } from "@/features/tareas/actions";
import {
  getObjetivoDetalle,
  type ObjetivoDetalle,
} from "@/features/objetivos/objective-detail-queries";
import {
  type EstadoTarea,
  type PrioridadTarea,
} from "@/features/tareas/queries";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const inputClassName =
  "rounded-2xl border-white/10 bg-white/10 text-white placeholder:text-slate-400 shadow-sm backdrop-blur-xl focus:border-white/30 focus:ring-4 focus:ring-white/10";

const textareaClassName =
  "min-h-28 rounded-2xl border-white/10 bg-white/10 text-white placeholder:text-slate-400 shadow-sm backdrop-blur-xl focus:border-white/30 focus:ring-4 focus:ring-white/10";

const selectClassName =
  "h-10 rounded-2xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white shadow-sm outline-none transition focus:border-white/30 focus:ring-4 focus:ring-white/10";

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

  async function loadObjetivo() {
    setLoadingObjetivo(true);
    setError("");

    try {
      const data = await getObjetivoDetalle(objetivoId);
      setObjetivo(data.objetivo);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo cargar el objetivo.";

      setError(message);
    } finally {
      setLoadingObjetivo(false);
    }
  }

  useEffect(() => {
    loadObjetivo();
  }, [objetivoId]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    startTransition(async () => {
      try {
        if (!objetivo) {
          throw new Error("No se encontró el objetivo para asociar la tarea.");
        }

        if (!objetivo.proyecto_id) {
          throw new Error(
            "Este objetivo no tiene proyecto asociado. Primero asígnalo a un proyecto."
          );
        }

        if (fechaInicio && fechaLimite && fechaInicio > fechaLimite) {
          throw new Error(
            "La fecha de inicio no puede ser mayor que la fecha límite."
          );
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
    });
  }

  return (
    <AppShell
      title="Nueva tarea"
      description="Crea una tarea dentro del objetivo seleccionado."
    >
      <div className="grid gap-6 text-white">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href={`/objetivos/${objetivoId}`}>
            <Button
              variant="outline"
              className="rounded-2xl border-white/15 bg-white/10 text-white shadow-sm backdrop-blur-xl hover:bg-white/15"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al objetivo
            </Button>
          </Link>
        </div>

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
          <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-violet-300/20 p-3 text-violet-100 ring-1 ring-violet-200/20">
                <ListTodo className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-black text-white">
                  Crear tarea
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Esta tarea quedará asociada directamente al objetivo actual.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <label
                  htmlFor="titulo"
                  className="text-sm font-semibold text-slate-100"
                >
                  Título
                </label>

                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
                  placeholder="Ej: Diseñar calendario de publicaciones"
                  className={inputClassName}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="descripcion"
                  className="text-sm font-semibold text-slate-100"
                >
                  Descripción
                </label>

                <Textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(event) => setDescripcion(event.target.value)}
                  placeholder="Detalles, pasos o contexto de esta tarea..."
                  className={textareaClassName}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label
                    htmlFor="prioridad"
                    className="text-sm font-semibold text-slate-100"
                  >
                    Prioridad
                  </label>

                  <select
                    id="prioridad"
                    value={prioridad}
                    onChange={(event) =>
                      setPrioridad(event.target.value as PrioridadTarea)
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
                    htmlFor="estado"
                    className="text-sm font-semibold text-slate-100"
                  >
                    Estado
                  </label>

                  <select
                    id="estado"
                    value={estado}
                    onChange={(event) =>
                      setEstado(event.target.value as EstadoTarea)
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
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <label
                    htmlFor="fechaInicio"
                    className="text-sm font-semibold text-slate-100"
                  >
                    Inicio
                  </label>

                  <Input
                    id="fechaInicio"
                    type="date"
                    value={fechaInicio}
                    onChange={(event) => setFechaInicio(event.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="fechaLimite"
                    className="text-sm font-semibold text-slate-100"
                  >
                    Fin
                  </label>

                  <Input
                    id="fechaLimite"
                    type="date"
                    value={fechaLimite}
                    onChange={(event) => setFechaLimite(event.target.value)}
                    className={inputClassName}
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="recordatorio"
                    className="text-sm font-semibold text-slate-100"
                  >
                    Recordatorio
                  </label>

                  <Input
                    id="recordatorio"
                    type="date"
                    value={recordatorio}
                    onChange={(event) => setRecordatorio(event.target.value)}
                    className={inputClassName}
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-2 rounded-2xl bg-white text-slate-950 hover:bg-slate-100"
                disabled={isPending}
              >
                <Plus className="mr-2 h-5 w-5" />
                {isPending ? "Creando..." : "Crear tarea"}
              </Button>
            </form>
          </Card>

          <aside className="grid h-fit gap-6">
            <Card className="rounded-[2rem] border-white/10 bg-slate-950/72 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                  <Target className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">Objetivo</h2>

                  <p className="text-sm text-slate-300">
                    La tarea se creará aquí.
                  </p>
                </div>
              </div>

              {loadingObjetivo ? (
                <p className="text-sm text-slate-300">Cargando objetivo...</p>
              ) : objetivo ? (
                <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                  <p className="font-black text-white">{objetivo.titulo}</p>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {objetivo.descripcion || "Sin descripción"}
                  </p>

                  {objetivo.proyecto ? (
                    <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-sky-200/20 bg-sky-300/15 px-3 py-1 text-xs font-semibold text-sky-100 backdrop-blur-xl">
                      <FolderKanban className="h-3.5 w-3.5" />
                      {objetivo.proyecto.nombre}
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-slate-300">
                  Objetivo no encontrado.
                </p>
              )}
            </Card>

            <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-sky-300/20 p-3 text-sky-100 ring-1 ring-sky-200/20">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">
                    Regla de fechas
                  </h2>

                  <p className="text-sm text-slate-300">
                    Evitar tareas cruzadas.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-sm leading-6 text-slate-300">
                  Si ya existe una tarea activa dentro de este objetivo con un
                  rango cruzado, el sistema bloqueará la creación.
                </p>
              </div>
            </Card>

            <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-300/20 p-3 text-emerald-100 ring-1 ring-emerald-200/20">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">
                    Después de crear
                  </h2>

                  <p className="text-sm text-slate-300">
                    Volverás al objetivo o al calendario.
                  </p>
                </div>
              </div>

              <p className="text-sm leading-6 text-slate-300">
                La tarea aparecerá en el detalle del objetivo y en el calendario
                según su rango de fechas.
              </p>
            </Card>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}