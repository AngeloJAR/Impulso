"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  Plus,
  Target,
} from "lucide-react";

import { crearObjetivo, type EstadoObjetivo } from "@/features/objetivos/actions";
import {
  getProyectoDetalle,
  type ProyectoDetalle,
} from "@/features/proyectos/project-detail-queries";
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

  async function loadProyecto() {
    setLoadingProyecto(true);
    setError("");

    try {
      const data = await getProyectoDetalle(proyectoId);
      setProyecto(data.proyecto);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No se pudo cargar el proyecto.";

      setError(message);
    } finally {
      setLoadingProyecto(false);
    }
  }

  useEffect(() => {
    loadProyecto();
  }, [proyectoId]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    startTransition(async () => {
      try {
        if (fechaInicio && fechaLimite && fechaInicio > fechaLimite) {
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
    });
  }

  return (
    <AppShell
      title="Nuevo objetivo"
      description="Crea un objetivo dentro del proyecto seleccionado."
    >
      <div className="grid gap-6 text-white">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href={`/proyectos/${proyectoId}`}>
            <Button
              variant="outline"
              className="rounded-2xl border-white/15 bg-white/10 text-white shadow-sm backdrop-blur-xl hover:bg-white/15"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al proyecto
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
              <div className="rounded-2xl bg-emerald-300/20 p-3 text-emerald-100 ring-1 ring-emerald-200/20">
                <Target className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-black text-white">
                  Crear objetivo
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Este objetivo quedará asociado directamente al proyecto actual.
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
                  placeholder="Ej: Lanzar campaña mensual de contenido"
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
                  placeholder="Define qué significa completar este objetivo..."
                  className={textareaClassName}
                />
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
                    htmlFor="estado"
                    className="text-sm font-semibold text-slate-100"
                  >
                    Estado
                  </label>

                  <select
                    id="estado"
                    value={estado}
                    onChange={(event) =>
                      setEstado(event.target.value as EstadoObjetivo)
                    }
                    className={selectClassName}
                  >
                    <option value="activo">Activo</option>
                    <option value="pausado">Pausado</option>
                    <option value="completado">Completado</option>
                    <option value="abandonado">Abandonado</option>
                  </select>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-2 rounded-2xl bg-white text-slate-950 hover:bg-slate-100"
                disabled={isPending}
              >
                <Plus className="mr-2 h-5 w-5" />
                {isPending ? "Creando..." : "Crear objetivo"}
              </Button>
            </form>
          </Card>

          <aside className="grid h-fit gap-6">
            <Card className="rounded-[2rem] border-white/10 bg-slate-950/72 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                  <FolderKanban className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-black text-white">Proyecto</h2>

                  <p className="text-sm text-slate-300">
                    El objetivo se creará aquí.
                  </p>
                </div>
              </div>

              {loadingProyecto ? (
                <p className="text-sm text-slate-300">Cargando proyecto...</p>
              ) : proyecto ? (
                <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                  <p className="font-black text-white">{proyecto.nombre}</p>

                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {proyecto.descripcion || "Sin descripción"}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-300">
                  Proyecto no encontrado.
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
                    Evitar objetivos cruzados.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
                <p className="text-sm leading-6 text-slate-300">
                  Si ya existe un objetivo activo o pausado en este proyecto con
                  un rango cruzado, el sistema bloqueará la creación.
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
                    Irás directo a crear la tarea.
                  </p>
                </div>
              </div>

              <p className="text-sm leading-6 text-slate-300">
                Luego de crear el objetivo, la app te llevará al formulario de
                tareas con el proyecto y objetivo ya seleccionados.
              </p>
            </Card>
          </aside>
        </section>
      </div>
    </AppShell>
  );
}