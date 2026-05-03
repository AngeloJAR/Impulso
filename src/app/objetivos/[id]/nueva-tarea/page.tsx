"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
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
      <div className="grid gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href={`/objetivos/${objetivoId}`}>
            <Button variant="outline" className="rounded-2xl bg-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al objetivo
            </Button>
          </Link>
        </div>

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

        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start gap-4">
              <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
                <ListTodo className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Crear tarea
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Esta tarea quedará asociada directamente al objetivo actual.
                </p>
              </div>
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
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
                  placeholder="Ej: Diseñar calendario de publicaciones"
                  className="rounded-2xl"
                  required
                />
              </div>

              <div className="grid gap-2">
                <label
                  htmlFor="descripcion"
                  className="text-sm font-semibold text-slate-700"
                >
                  Descripción
                </label>
                <Textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(event) => setDescripcion(event.target.value)}
                  placeholder="Detalles, pasos o contexto de esta tarea..."
                  className="min-h-28 rounded-2xl"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <label
                    htmlFor="prioridad"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Prioridad
                  </label>
                  <select
                    id="prioridad"
                    value={prioridad}
                    onChange={(event) =>
                      setPrioridad(event.target.value as PrioridadTarea)
                    }
                    className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs outline-none transition focus:border-slate-400"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
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
                    value={estado}
                    onChange={(event) =>
                      setEstado(event.target.value as EstadoTarea)
                    }
                    className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs outline-none transition focus:border-slate-400"
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
                    className="text-sm font-semibold text-slate-700"
                  >
                    Inicio
                  </label>
                  <Input
                    id="fechaInicio"
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
                    Fin
                  </label>
                  <Input
                    id="fechaLimite"
                    type="date"
                    value={fechaLimite}
                    onChange={(event) => setFechaLimite(event.target.value)}
                    className="rounded-2xl"
                  />
                </div>

                <div className="grid gap-2">
                  <label
                    htmlFor="recordatorio"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Recordatorio
                  </label>
                  <Input
                    id="recordatorio"
                    type="date"
                    value={recordatorio}
                    onChange={(event) => setRecordatorio(event.target.value)}
                    className="rounded-2xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-2 rounded-2xl"
                disabled={isPending}
              >
                <Plus className="mr-2 h-5 w-5" />
                {isPending ? "Creando..." : "Crear tarea"}
              </Button>
            </form>
          </Card>

          <aside className="grid h-fit gap-6">
            <Card className="rounded-[2rem] border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <Target className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold">Objetivo</h2>
                  <p className="text-sm text-slate-400">
                    La tarea se creará aquí.
                  </p>
                </div>
              </div>

              {loadingObjetivo ? (
                <p className="text-sm text-slate-400">Cargando objetivo...</p>
              ) : objetivo ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold">{objetivo.titulo}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {objetivo.descripcion || "Sin descripción"}
                  </p>

                  {objetivo.proyecto ? (
                    <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                      <FolderKanban className="h-3.5 w-3.5" />
                      {objetivo.proyecto.nombre}
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  Objetivo no encontrado.
                </p>
              )}
            </Card>

            <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Regla de fechas
                  </h2>
                  <p className="text-sm text-slate-500">
                    Evitar tareas cruzadas.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm leading-6 text-slate-600">
                  Si ya existe una tarea activa dentro de este objetivo con un
                  rango cruzado, el sistema bloqueará la creación.
                </p>
              </div>
            </Card>

            <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Después de crear
                  </h2>
                  <p className="text-sm text-slate-500">
                    Volverás al objetivo.
                  </p>
                </div>
              </div>

              <p className="text-sm leading-6 text-slate-500">
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