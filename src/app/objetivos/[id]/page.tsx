"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Edit3,
    FolderKanban,
    ListTodo,
    Plus,
    Target,
} from "lucide-react";

import {
    getObjetivoDetalle,
    type ObjetivoDetalleData,
    type ObjetivoDetalleTarea,
} from "@/features/objetivos/objective-detail-queries";
import { actualizarProgresoObjetivo } from "@/features/objetivos/actions";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const emptyData: ObjetivoDetalleData = {
    objetivo: null,
    tareas: [],
    metricas: {
        totalTareas: 0,
        tareasPendientes: 0,
        tareasTerminadas: 0,
        progresoCalculado: 0,
    },
};

const estadoObjetivoStyles = {
    activo: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    pausado: "bg-amber-50 text-amber-700 ring-amber-100",
    completado: "bg-sky-50 text-sky-700 ring-sky-100",
    abandonado: "bg-slate-100 text-slate-500 ring-slate-200",
};

const prioridadTareaStyles: Record<ObjetivoDetalleTarea["prioridad"], string> = {
    baja: "bg-slate-100 text-slate-600",
    media: "bg-amber-100 text-amber-700",
    alta: "bg-rose-100 text-rose-700",
};

const estadoTareaStyles: Record<ObjetivoDetalleTarea["estado"], string> = {
    pendiente: "bg-slate-100 text-slate-600 ring-slate-200",
    hoy: "bg-sky-50 text-sky-700 ring-sky-100",
    en_proceso: "bg-violet-50 text-violet-700 ring-violet-100",
    bloqueada: "bg-rose-50 text-rose-700 ring-rose-100",
    terminada: "bg-emerald-50 text-emerald-700 ring-emerald-100",
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

export default function ObjetivoDetallePage() {
    const params = useParams<{ id: string }>();
    const objetivoId = params.id;

    const [data, setData] = useState<ObjetivoDetalleData>(emptyData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [isPending, startTransition] = useTransition();

    async function loadObjetivo() {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const result = await getObjetivoDetalle(objetivoId);
            setData(result);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "No se pudo cargar el objetivo.";

            setError(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadObjetivo();
    }, [objetivoId]);

    function handleActualizarProgreso() {
        setError("");
        setMessage("");

        startTransition(async () => {
            try {
                const result = await actualizarProgresoObjetivo(objetivoId);

                setMessage(
                    `Progreso actualizado: ${result.progreso}% (${result.tareasTerminadas}/${result.totalTareas} tareas terminadas).`
                );

                await loadObjetivo();
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "No se pudo actualizar el progreso.";

                setError(message);
            }
        });
    }

    const tareasPorEstado = useMemo(() => {
        return {
            pendiente: data.tareas.filter((tarea) => tarea.estado === "pendiente"),
            hoy: data.tareas.filter((tarea) => tarea.estado === "hoy"),
            en_proceso: data.tareas.filter((tarea) => tarea.estado === "en_proceso"),
            bloqueada: data.tareas.filter((tarea) => tarea.estado === "bloqueada"),
            terminada: data.tareas.filter((tarea) => tarea.estado === "terminada"),
        };
    }, [data.tareas]);

    const objetivo = data.objetivo;
    const proyectoHref = objetivo?.proyecto_id
        ? `/proyectos/${objetivo.proyecto_id}`
        : "/";

    return (
        <AppShell
            title={objetivo ? objetivo.titulo : "Objetivo"}
            description="Detalle del objetivo y sus tareas asociadas."
        >
            <div className="grid gap-6">
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link href={proyectoHref}>
                        <Button variant="outline" className="rounded-2xl bg-white">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al proyecto
                        </Button>
                    </Link>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Link href={`/objetivos/${objetivoId}/nueva-tarea`}>
                            <Button className="rounded-2xl">
                                <Plus className="mr-2 h-4 w-4" />
                                Nueva tarea
                            </Button>
                        </Link>

                        <Button variant="outline" className="rounded-2xl bg-white" disabled>
                            <Edit3 className="mr-2 h-4 w-4" />
                            Editar objetivo
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Cargando objetivo...
                        </p>
                    </Card>
                ) : !objetivo ? (
                    <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                            <Target className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                            <p className="font-semibold text-slate-800">
                                Objetivo no encontrado
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                Puede que no exista o no pertenezca a tu usuario.
                            </p>
                        </div>
                    </Card>
                ) : (
                    <>
                        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                            <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_340px] md:p-8">
                                <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-emerald-100 blur-3xl" />

                                <div className="relative">
                                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                                        <Target className="h-4 w-4" />
                                        Objetivo
                                    </div>

                                    <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                                        {objetivo.titulo}
                                    </h2>

                                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                                        {objetivo.descripcion ||
                                            "Este objetivo todavía no tiene descripción."}
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${estadoObjetivoStyles[objetivo.estado]
                                                }`}
                                        >
                                            {objetivo.estado}
                                        </span>

                                        {objetivo.proyecto ? (
                                            <Link href={`/proyectos/${objetivo.proyecto.id}`}>
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
                                                    <FolderKanban className="h-3.5 w-3.5" />
                                                    {objetivo.proyecto.nombre}
                                                </span>
                                            </Link>
                                        ) : (
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-400">
                                                Sin proyecto
                                            </span>
                                        )}

                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">
                                            {formatFecha(objetivo.fecha_inicio)} -{" "}
                                            {formatFecha(objetivo.fecha_limite)}
                                        </span>
                                    </div>
                                </div>

                                <Card className="relative rounded-[2rem] border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
                                    <p className="text-sm font-medium text-slate-400">
                                        Progreso calculado
                                    </p>

                                    <h3 className="mt-2 text-5xl font-bold">
                                        {data.metricas.progresoCalculado}%
                                    </h3>

                                    <p className="mt-3 text-sm leading-6 text-slate-300">
                                        Calculado usando tareas terminadas sobre el total de tareas
                                        del objetivo.
                                    </p>

                                    <div className="mt-6 h-3 rounded-full bg-white/10">
                                        <div
                                            className="h-3 rounded-full bg-white"
                                            style={{
                                                width: `${data.metricas.progresoCalculado}%`,
                                            }}
                                        />
                                    </div>
                                </Card>
                            </div>
                        </section>

                        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {[
                                {
                                    title: "Total tareas",
                                    value: data.metricas.totalTareas,
                                    icon: ListTodo,
                                },
                                {
                                    title: "Pendientes",
                                    value: data.metricas.tareasPendientes,
                                    icon: Clock3,
                                },
                                {
                                    title: "Terminadas",
                                    value: data.metricas.tareasTerminadas,
                                    icon: CheckCircle2,
                                },
                                {
                                    title: "Progreso",
                                    value: `${data.metricas.progresoCalculado}%`,
                                    icon: Target,
                                },
                            ].map((item) => {
                                const Icon = item.icon;

                                return (
                                    <Card
                                        key={item.title}
                                        className="rounded-[1.75rem] border-slate-200 bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-slate-500">
                                                    {item.title}
                                                </p>
                                                <p className="mt-3 text-4xl font-bold text-slate-950">
                                                    {item.value}
                                                </p>
                                            </div>

                                            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                                                <Icon className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </section>

                        <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
                            <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
                                <div className="mb-5">
                                    <h2 className="text-xl font-bold text-slate-950">
                                        Tareas del objetivo
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Acciones concretas que hacen avanzar este objetivo.
                                    </p>
                                </div>

                                {data.tareas.length === 0 ? (
                                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                                        <ListTodo className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                                        <p className="font-semibold text-slate-800">
                                            No hay tareas asociadas
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Las tareas que crees dentro del flujo lineal aparecerán
                                            aquí.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 xl:grid-cols-2">
                                        {data.tareas.map((tarea) => (
                                            <div
                                                key={tarea.id}
                                                className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                                            >
                                                <div className="mb-2 flex flex-wrap gap-2">
                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${prioridadTareaStyles[tarea.prioridad]
                                                            }`}
                                                    >
                                                        {tarea.prioridad}
                                                    </span>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${estadoTareaStyles[tarea.estado]
                                                            }`}
                                                    >
                                                        {tarea.estado}
                                                    </span>
                                                </div>

                                                <h3 className="font-bold text-slate-950">
                                                    {tarea.titulo}
                                                </h3>

                                                {tarea.descripcion ? (
                                                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                                                        {tarea.descripcion}
                                                    </p>
                                                ) : (
                                                    <p className="mt-1 text-sm text-slate-400">
                                                        Sin descripción
                                                    </p>
                                                )}

                                                <div className="mt-4 grid gap-2 text-xs font-medium text-slate-400">
                                                    <div className="flex items-center gap-2">
                                                        <CalendarDays className="h-3.5 w-3.5" />
                                                        Inicio: {formatFecha(tarea.fecha_inicio || tarea.fecha)}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <CalendarDays className="h-3.5 w-3.5" />
                                                        Fin: {formatFecha(tarea.fecha_limite || tarea.fecha)}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Clock3 className="h-3.5 w-3.5" />
                                                        Recordatorio: {formatFecha(tarea.recordatorio)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>

                            <div className="grid gap-6">
                                <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h2 className="text-lg font-bold text-slate-950">
                                                Progreso real
                                            </h2>
                                            <p className="text-sm text-slate-500">
                                                Basado en tareas terminadas.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                        <p className="text-sm leading-6 text-slate-600">
                                            {data.metricas.tareasTerminadas} de{" "}
                                            {data.metricas.totalTareas} tareas terminadas.
                                        </p>

                                        <Button
                                            type="button"
                                            className="mt-4 w-full rounded-2xl"
                                            disabled={isPending}
                                            onClick={handleActualizarProgreso}
                                        >
                                            {isPending ? "Actualizando..." : "Actualizar progreso"}
                                        </Button>
                                    </div>
                                </Card>

                                <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
                                    <h2 className="text-lg font-bold text-slate-950">
                                        Distribución por estado
                                    </h2>

                                    <div className="mt-5 grid gap-3">
                                        {[
                                            ["Pendiente", tareasPorEstado.pendiente.length],
                                            ["Hoy", tareasPorEstado.hoy.length],
                                            ["En proceso", tareasPorEstado.en_proceso.length],
                                            ["Bloqueada", tareasPorEstado.bloqueada.length],
                                            ["Terminada", tareasPorEstado.terminada.length],
                                        ].map(([label, value]) => (
                                            <div
                                                key={label}
                                                className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4"
                                            >
                                                <p className="text-sm font-medium text-slate-700">
                                                    {label}
                                                </p>
                                                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
                                                    {value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
                                    <h2 className="text-lg font-bold text-slate-950">
                                        Próximo ajuste
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Ahora falta guardar el progreso calculado en la tabla
                                        objetivos y aplicar reglas de bloqueo por rango de fechas.
                                    </p>
                                </Card>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </AppShell>
    );
}