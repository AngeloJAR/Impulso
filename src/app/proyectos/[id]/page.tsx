"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
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
    getProyectoDetalle,
    type ProyectoDetalleData,
    type ProyectoObjetivoResumen,
    type ProyectoTareaResumen,
} from "@/features/proyectos/project-detail-queries";
import { flowRoutes } from "@/config/app";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const emptyData: ProyectoDetalleData = {
    proyecto: null,
    objetivos: [],
    tareas: [],
    metricas: {
        objetivosActivos: 0,
        objetivosCompletados: 0,
        tareasPendientes: 0,
        tareasTerminadas: 0,
    },
};

const estadoObjetivoStyles: Record<ProyectoObjetivoResumen["estado"], string> = {
    activo: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    pausado: "bg-amber-50 text-amber-700 ring-amber-100",
    completado: "bg-sky-50 text-sky-700 ring-sky-100",
    abandonado: "bg-slate-100 text-slate-500 ring-slate-200",
};

const prioridadTareaStyles: Record<ProyectoTareaResumen["prioridad"], string> = {
    baja: "bg-slate-100 text-slate-600",
    media: "bg-amber-100 text-amber-700",
    alta: "bg-rose-100 text-rose-700",
};

const estadoTareaStyles: Record<ProyectoTareaResumen["estado"], string> = {
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

export default function ProyectoDetallePage() {
    const params = useParams<{ id: string }>();
    const proyectoId = params.id;

    const [data, setData] = useState<ProyectoDetalleData>(emptyData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadProyecto() {
        setLoading(true);
        setError("");

        try {
            const result = await getProyectoDetalle(proyectoId);
            setData(result);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "No se pudo cargar el proyecto.";

            setError(message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadProyecto();
    }, [proyectoId]);

    const tareasPorObjetivo = useMemo(() => {
        return data.objetivos.map((objetivo) => ({
            objetivo,
            tareas: data.tareas.filter((tarea) => tarea.objetivo_id === objetivo.id),
        }));
    }, [data.objetivos, data.tareas]);

    const tareasSinObjetivo = useMemo(() => {
        return data.tareas.filter((tarea) => !tarea.objetivo_id);
    }, [data.tareas]);

    const proyecto = data.proyecto;

    return (
        <AppShell
            title={proyecto ? proyecto.nombre : "Proyecto"}
            description="Detalle del proyecto, objetivos y tareas asociadas."
        >
            <div className="grid gap-6">
                {error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {error}
                    </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Link href={flowRoutes.dashboard}>
                        <Button variant="outline" className="rounded-2xl bg-white">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver al dashboard
                        </Button>
                    </Link>

                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Link href={`/proyectos/${proyectoId}/nuevo-objetivo`}>
                            <Button className="rounded-2xl">
                                <Plus className="mr-2 h-4 w-4" />
                                Nuevo objetivo
                            </Button>
                        </Link>

                        <Button variant="outline" className="rounded-2xl bg-white" disabled>
                            <Edit3 className="mr-2 h-4 w-4" />
                            Editar proyecto
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
                        <p className="text-sm font-medium text-slate-500">
                            Cargando proyecto...
                        </p>
                    </Card>
                ) : !proyecto ? (
                    <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                            <FolderKanban className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                            <p className="font-semibold text-slate-800">
                                Proyecto no encontrado
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
                                <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-sky-100 blur-3xl" />

                                <div className="relative">
                                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                                        <FolderKanban className="h-4 w-4" />
                                        Proyecto activo
                                    </div>

                                    <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                                        {proyecto.nombre}
                                    </h2>

                                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                                        {proyecto.descripcion ||
                                            "Este proyecto todavía no tiene descripción."}
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                            Estado: {proyecto.estado}
                                        </span>
                                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                            Creado: {formatFecha(proyecto.created_at)}
                                        </span>
                                    </div>
                                </div>

                                <Card className="relative rounded-[2rem] border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
                                    <p className="text-sm font-medium text-slate-400">
                                        Flujo del proyecto
                                    </p>
                                    <h3 className="mt-2 text-2xl font-semibold">
                                        Objetivos → Tareas → Calendario
                                    </h3>
                                    <p className="mt-3 text-sm leading-6 text-slate-300">
                                        Este proyecto debe avanzar por objetivos claros y tareas
                                        asociadas, no por ideas sueltas.
                                    </p>
                                </Card>
                            </div>
                        </section>

                        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {[
                                {
                                    title: "Objetivos activos",
                                    value: data.metricas.objetivosActivos,
                                    icon: Target,
                                },
                                {
                                    title: "Objetivos completados",
                                    value: data.metricas.objetivosCompletados,
                                    icon: CheckCircle2,
                                },
                                {
                                    title: "Tareas pendientes",
                                    value: data.metricas.tareasPendientes,
                                    icon: ListTodo,
                                },
                                {
                                    title: "Tareas terminadas",
                                    value: data.metricas.tareasTerminadas,
                                    icon: CheckCircle2,
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
                                        Objetivos del proyecto
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Cada objetivo puede tener sus propias tareas asociadas.
                                    </p>
                                </div>

                                {data.objetivos.length === 0 ? (
                                    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                                        <Target className="mx-auto mb-3 h-8 w-8 text-slate-400" />
                                        <p className="font-semibold text-slate-800">
                                            No hay objetivos en este proyecto
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Crea una nueva idea para generar objetivo y tareas dentro
                                            del flujo lineal.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {tareasPorObjetivo.map(({ objetivo, tareas }) => (
                                            <div
                                                key={objetivo.id}
                                                className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                                            >
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="min-w-0">
                                                        <div className="mb-2 flex flex-wrap items-center gap-2">
                                                            <span
                                                                className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${estadoObjetivoStyles[objetivo.estado]
                                                                    }`}
                                                            >
                                                                {objetivo.estado}
                                                            </span>

                                                            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm ring-1 ring-slate-200">
                                                                {formatFecha(objetivo.fecha_inicio)} -{" "}
                                                                {formatFecha(objetivo.fecha_limite)}
                                                            </span>
                                                        </div>

                                                        <h3 className="font-bold text-slate-950">
                                                            {objetivo.titulo}
                                                        </h3>

                                                        {objetivo.descripcion ? (
                                                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                                                                {objetivo.descripcion}
                                                            </p>
                                                        ) : (
                                                            <p className="mt-1 text-sm text-slate-400">
                                                                Sin descripción
                                                            </p>
                                                        )}
                                                    </div>

                                                    <Link href={`/objetivos/${objetivo.id}`}>
                                                        <Button
                                                            variant="outline"
                                                            className="rounded-2xl bg-white"
                                                        >
                                                            Ver objetivo
                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                </div>

                                                <div className="mt-4">
                                                    <div className="mb-2 flex items-center justify-between text-xs font-medium">
                                                        <span className="text-slate-500">Progreso</span>
                                                        <span className="font-bold text-slate-950">
                                                            {objetivo.progreso}%
                                                        </span>
                                                    </div>
                                                    <div className="h-3 rounded-full bg-white">
                                                        <div
                                                            className="h-3 rounded-full bg-slate-950"
                                                            style={{ width: `${objetivo.progreso}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-4 grid gap-2">
                                                    {tareas.length === 0 ? (
                                                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-3 text-center">
                                                            <p className="text-xs text-slate-500">
                                                                Sin tareas para este objetivo.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        tareas.slice(0, 3).map((tarea) => (
                                                            <div
                                                                key={tarea.id}
                                                                className="rounded-2xl border border-slate-200 bg-white p-3"
                                                            >
                                                                <div className="mb-1 flex flex-wrap gap-2">
                                                                    <span
                                                                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${prioridadTareaStyles[tarea.prioridad]
                                                                            }`}
                                                                    >
                                                                        {tarea.prioridad}
                                                                    </span>
                                                                    <span
                                                                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${estadoTareaStyles[tarea.estado]
                                                                            }`}
                                                                    >
                                                                        {tarea.estado}
                                                                    </span>
                                                                </div>

                                                                <p className="text-sm font-semibold text-slate-950">
                                                                    {tarea.titulo}
                                                                </p>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>

                            <div className="grid gap-6">
                                <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
                                            <ListTodo className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h2 className="text-lg font-bold text-slate-950">
                                                Tareas del proyecto
                                            </h2>
                                            <p className="text-sm text-slate-500">
                                                Resumen de acciones.
                                            </p>
                                        </div>
                                    </div>

                                    {data.tareas.length === 0 ? (
                                        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                                            <p className="text-sm font-semibold text-slate-700">
                                                Sin tareas
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-3">
                                            {data.tareas.slice(0, 8).map((tarea) => (
                                                <div
                                                    key={tarea.id}
                                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                                                >
                                                    <div className="mb-2 flex flex-wrap gap-2">
                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${prioridadTareaStyles[tarea.prioridad]
                                                                }`}
                                                        >
                                                            {tarea.prioridad}
                                                        </span>
                                                        <span
                                                            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${estadoTareaStyles[tarea.estado]
                                                                }`}
                                                        >
                                                            {tarea.estado}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm font-semibold text-slate-950">
                                                        {tarea.titulo}
                                                    </p>

                                                    <div className="mt-2 grid gap-1 text-xs font-medium text-slate-400">
                                                        <div className="flex items-center gap-2">
                                                            <CalendarDays className="h-3.5 w-3.5" />
                                                            Inicio: {formatFecha(tarea.fecha_inicio || tarea.fecha)}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <CalendarDays className="h-3.5 w-3.5" />
                                                            Fin: {formatFecha(tarea.fecha_limite || tarea.fecha)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card>

                                <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                                            <Clock3 className="h-5 w-5" />
                                        </div>

                                        <div>
                                            <h2 className="text-lg font-bold text-slate-950">
                                                Próximo ajuste
                                            </h2>
                                            <p className="text-sm text-slate-500">
                                                Calendario por proyecto.
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-sm leading-6 text-slate-500">
                                        Luego agregaremos validación de rangos para impedir que dos
                                        objetivos activos del mismo proyecto ocupen fechas cruzadas.
                                    </p>
                                </Card>

                                {tareasSinObjetivo.length > 0 ? (
                                    <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
                                        <h2 className="text-lg font-bold text-slate-950">
                                            Tareas sin objetivo
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Estas tareas pertenecen al proyecto, pero no están
                                            asociadas a un objetivo.
                                        </p>

                                        <div className="mt-5 grid gap-3">
                                            {tareasSinObjetivo.map((tarea) => (
                                                <div
                                                    key={tarea.id}
                                                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                                                >
                                                    <p className="text-sm font-semibold text-slate-950">
                                                        {tarea.titulo}
                                                    </p>
                                                    <div className="mt-2 grid gap-1 text-xs font-medium text-slate-400">
                                                        <div className="flex items-center gap-2">
                                                            <CalendarDays className="h-3.5 w-3.5" />
                                                            Inicio: {formatFecha(tarea.fecha_inicio || tarea.fecha)}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <CalendarDays className="h-3.5 w-3.5" />
                                                            Fin: {formatFecha(tarea.fecha_limite || tarea.fecha)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                ) : null}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </AppShell>
    );
}