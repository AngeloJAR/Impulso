"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    CircleDashed,
    Clock3,
    FolderKanban,
    ListTodo,
    PlayCircle,
    Plus,
    Target,
} from "lucide-react";

import { cambiarEstadoTarea, crearTarea } from "@/features/tareas/actions";
import {
    getTareas,
    type EstadoTarea,
    type PrioridadTarea,
    type TareaResumen,
} from "@/features/tareas/queries";
import {
    getProyectos,
    type ProyectoResumen,
} from "@/features/proyectos/queries";
import {
    getObjetivosParaSelector,
    type ObjetivoSelector,
} from "@/features/objetivos/queries";


import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const estadosTarea: {
    key: EstadoTarea;
    title: string;
    description: string;
    icon: React.ElementType;
}[] = [
        {
            key: "pendiente",
            title: "Pendiente",
            description: "Acciones que todavía no empiezan.",
            icon: CircleDashed,
        },
        {
            key: "hoy",
            title: "Hoy",
            description: "Tareas que necesitan atención hoy.",
            icon: CalendarDays,
        },
        {
            key: "en_proceso",
            title: "En proceso",
            description: "Acciones que ya están en movimiento.",
            icon: PlayCircle,
        },
        {
            key: "bloqueada",
            title: "Bloqueada",
            description: "Tareas detenidas por dependencia o problema.",
            icon: AlertCircle,
        },
        {
            key: "terminada",
            title: "Terminada",
            description: "Acciones completadas.",
            icon: CheckCircle2,
        },
    ];

const prioridadStyles: Record<PrioridadTarea, string> = {
    baja: "bg-slate-100 text-slate-600",
    media: "bg-amber-100 text-amber-700",
    alta: "bg-rose-100 text-rose-700",
};

const estadoStyles: Record<EstadoTarea, string> = {
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

function getEstadoLabel(estado: EstadoTarea) {
    return estadosTarea.find((item) => item.key === estado)?.title ?? estado;
}

export default function TareasPage() {
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [proyectoId, setProyectoId] = useState("");
    const [objetivoId, setObjetivoId] = useState("");
    const [prioridad, setPrioridad] = useState<PrioridadTarea>("media");
    const [estado, setEstado] = useState<EstadoTarea>("pendiente");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaLimite, setFechaLimite] = useState("");
    const [recordatorio, setRecordatorio] = useState("");

    const [tareas, setTareas] = useState<TareaResumen[]>([]);
    const [proyectos, setProyectos] = useState<ProyectoResumen[]>([]);
    const [objetivos, setObjetivos] = useState<ObjetivoSelector[]>([]);

    const [loadingTareas, setLoadingTareas] = useState(true);
    const [loadingProyectos, setLoadingProyectos] = useState(true);
    const [loadingObjetivos, setLoadingObjetivos] = useState(true);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [updatingTareaId, setUpdatingTareaId] = useState<string | null>(null);

    const [isPending, startTransition] = useTransition();

    async function loadTareas() {
        setLoadingTareas(true);
        setError("");

        try {
            const data = await getTareas();
            setTareas(data);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "No se pudieron cargar las tareas.";

            setError(message);
        } finally {
            setLoadingTareas(false);
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
    async function loadObjetivos() {
        setLoadingObjetivos(true);

        try {
            const data = await getObjetivosParaSelector();
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
    useEffect(() => {
        loadTareas();
        loadProyectos();
        loadObjetivos();
    }, []);

    const tareasPorEstado = useMemo(() => {
        return estadosTarea.reduce<Record<EstadoTarea, TareaResumen[]>>(
            (acc, estadoItem) => {
                acc[estadoItem.key] = tareas.filter(
                    (tarea) => tarea.estado === estadoItem.key
                );
                return acc;
            },
            {
                pendiente: [],
                hoy: [],
                en_proceso: [],
                bloqueada: [],
                terminada: [],
            }
        );
    }, [tareas]);

    function resetForm() {
        setTitulo("");
        setDescripcion("");
        setProyectoId("");
        setObjetivoId("");
        setPrioridad("media");
        setEstado("pendiente");
        setFechaInicio("");
        setFechaLimite("");
        setRecordatorio("");
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setError("");
        setMessage("");

        startTransition(async () => {
            try {
                if (fechaInicio && fechaLimite && fechaInicio > fechaLimite) {
                    throw new Error("La fecha de inicio no puede ser mayor que la fecha límite.");
                }

                await crearTarea({
                    titulo,
                    descripcion,
                    proyectoId,
                    objetivoId,
                    prioridad,
                    estado,
                    fecha: fechaInicio,
                    fechaInicio,
                    fechaLimite,
                    recordatorio,
                });

                resetForm();
                setMessage("Tarea creada correctamente.");
                await loadTareas();
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "No se pudo crear la tarea.";

                setError(message);
            }
        });
    }

    function handleCambiarEstadoTarea(tareaId: string, nuevoEstado: EstadoTarea) {
        setError("");
        setMessage("");
        setUpdatingTareaId(tareaId);

        startTransition(async () => {
            try {
                await cambiarEstadoTarea(tareaId, nuevoEstado);
                setMessage("Estado de tarea actualizado correctamente.");
                await loadTareas();
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "No se pudo actualizar el estado de la tarea.";

                setError(message);
            } finally {
                setUpdatingTareaId(null);
            }
        });
    }

    const proyectoSeleccionado = proyectos.find(
        (proyecto) => proyecto.id === proyectoId
    );

    const objetivosFiltrados = proyectoId
        ? objetivos.filter((objetivo) => objetivo.proyecto_id === proyectoId)
        : objetivos;

    const objetivoSeleccionado = objetivos.find(
        (objetivo) => objetivo.id === objetivoId
    );

    return (
        <AppShell
            title="Tareas"
            description="Acciones concretas con estado, prioridad, fecha y recordatorio."
        >
            <div className="grid gap-6">
                <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                    <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_340px] md:p-8">
                        <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-violet-100 blur-3xl" />

                        <div className="relative">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700">
                                <ListTodo className="h-4 w-4" />
                                Acciones concretas
                            </div>

                            <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                                Una tarea debe decir exactamente qué hacer.
                            </h2>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                                Las tareas convierten tus ideas y objetivos en pasos claros.
                                Aquí puedes crearlas, programarlas y verlas agrupadas por
                                estado.
                            </p>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <Button
                                    size="lg"
                                    className="rounded-2xl"
                                    onClick={() => {
                                        document
                                            .getElementById("crear-tarea")
                                            ?.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }}
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    Nueva tarea
                                </Button>

                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="rounded-2xl"
                                    onClick={loadTareas}
                                    disabled={loadingTareas}
                                >
                                    <Clock3 className="mr-2 h-5 w-5" />
                                    {loadingTareas ? "Actualizando..." : "Actualizar"}
                                </Button>
                            </div>
                        </div>

                        <Card className="relative rounded-[2rem] border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
                            <p className="text-sm font-medium text-slate-400">
                                Regla del módulo
                            </p>
                            <h3 className="mt-2 text-2xl font-semibold">
                                Si no se puede ejecutar, no es tarea.
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-slate-300">
                                Una tarea debe ser una acción específica. Si todavía es muy
                                amplia, probablemente pertenece a objetivos o ideas.
                            </p>

                            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
                                <p className="text-sm leading-6 text-slate-300">
                                    Ya puedes crear tareas reales asociadas a proyectos.
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

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {estadosTarea.map((item) => {
                        const Icon = item.icon;
                        const total = tareasPorEstado[item.key]?.length ?? 0;

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
                                Tareas por estado
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Vista real de tus tareas guardadas en Supabase.
                            </p>
                        </div>

                        {loadingTareas ? (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                                <p className="text-sm font-medium text-slate-500">
                                    Cargando tareas...
                                </p>
                            </div>
                        ) : tareas.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                                    <ListTodo className="h-5 w-5" />
                                </div>
                                <p className="font-semibold text-slate-800">
                                    Todavía no hay tareas
                                </p>
                                <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
                                    Crea tu primera tarea desde el formulario de la derecha.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 xl:grid-cols-2">
                                {estadosTarea.map((estadoItem) => {
                                    const items = tareasPorEstado[estadoItem.key] ?? [];

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
                                                        {items.length} tareas
                                                    </p>
                                                </div>

                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${estadoStyles[estadoItem.key]
                                                        }`}
                                                >
                                                    {getEstadoLabel(estadoItem.key)}
                                                </span>
                                            </div>

                                            {items.length === 0 ? (
                                                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-5 text-center">
                                                    <p className="text-xs leading-5 text-slate-500">
                                                        Sin tareas en este estado.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="grid gap-3">
                                                    {items.map((tarea) => (
                                                        <div
                                                            key={tarea.id}
                                                            className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm"
                                                        >
                                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                                <span
                                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${prioridadStyles[tarea.prioridad]
                                                                        }`}
                                                                >
                                                                    {tarea.prioridad}
                                                                </span>

                                                                {tarea.proyecto ? (
                                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 ring-1 ring-sky-100">
                                                                        <FolderKanban className="h-3.5 w-3.5" />
                                                                        {tarea.proyecto.nombre}
                                                                    </span>
                                                                ) : (
                                                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-400">
                                                                        Sin proyecto
                                                                    </span>
                                                                )}

                                                                {tarea.objetivo ? (
                                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                                                                        <Target className="h-3.5 w-3.5" />
                                                                        {tarea.objetivo.titulo}
                                                                    </span>
                                                                ) : null}
                                                            </div>

                                                            <h4 className="font-bold text-slate-950">
                                                                {tarea.titulo}
                                                            </h4>

                                                            {tarea.descripcion ? (
                                                                <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                                                                    {tarea.descripcion}
                                                                </p>
                                                            ) : (
                                                                <p className="mt-1 text-sm text-slate-400">
                                                                    Sin descripción
                                                                </p>
                                                            )}

                                                            <div className="mt-3 grid gap-3">
                                                                <div className="grid gap-2 text-xs font-medium text-slate-400">
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

                                                                <div className="grid gap-1.5">
                                                                    <label
                                                                        htmlFor={`estado-tarea-${tarea.id}`}
                                                                        className="text-xs font-semibold text-slate-500"
                                                                    >
                                                                        Cambiar estado
                                                                    </label>

                                                                    <select
                                                                        id={`estado-tarea-${tarea.id}`}
                                                                        value={tarea.estado}
                                                                        disabled={isPending && updatingTareaId === tarea.id}
                                                                        onChange={(event) =>
                                                                            handleCambiarEstadoTarea(
                                                                                tarea.id,
                                                                                event.target.value as EstadoTarea
                                                                            )
                                                                        }
                                                                        className="h-9 rounded-2xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-xs outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                                                                    >
                                                                        {estadosTarea.map((estadoItem) => (
                                                                            <option key={estadoItem.key} value={estadoItem.key}>
                                                                                {estadoItem.title}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
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
                            id="crear-tarea"
                            className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm"
                        >
                            <div className="mb-5">
                                <h2 className="text-lg font-bold text-slate-950">
                                    Nueva tarea
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                    Crea una acción concreta y asígnala a un proyecto si aplica.
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
                                        placeholder="Ej: Publicar campaña de recordatorios"
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
                                        placeholder="Detalles, contexto o pasos necesarios..."
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
                                        onChange={(event) => {
                                            setProyectoId(event.target.value);
                                            setObjetivoId("");
                                        }}
                                        disabled={loadingProyectos}
                                        className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <option value="">
                                            {loadingProyectos ? "Cargando proyectos..." : "Sin proyecto"}
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
                                            : "Puedes crear la tarea sin proyecto y organizarla después."}
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <label
                                        htmlFor="objetivoId"
                                        className="text-sm font-semibold text-slate-700"
                                    >
                                        Objetivo opcional
                                    </label>
                                    <select
                                        id="objetivoId"
                                        name="objetivoId"
                                        value={objetivoId}
                                        onChange={(event) => setObjetivoId(event.target.value)}
                                        disabled={loadingObjetivos}
                                        className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <option value="">
                                            {loadingObjetivos ? "Cargando objetivos..." : "Sin objetivo"}
                                        </option>

                                        {objetivosFiltrados.map((objetivo) => (
                                            <option key={objetivo.id} value={objetivo.id}>
                                                {objetivo.titulo}
                                            </option>
                                        ))}
                                    </select>

                                    <p className="text-xs leading-5 text-slate-400">
                                        {objetivoSeleccionado
                                            ? `Se asociará al objetivo: ${objetivoSeleccionado.titulo}`
                                            : proyectoId
                                                ? "Solo se muestran objetivos activos o pausados de este proyecto."
                                                : "Puedes asociar la tarea a un objetivo activo o pausado."}
                                    </p>
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
                                            name="prioridad"
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
                                            name="estado"
                                            value={estado}
                                            onChange={(event) =>
                                                setEstado(event.target.value as EstadoTarea)
                                            }
                                            className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs outline-none transition focus:border-slate-400"
                                        >
                                            {estadosTarea.map((item) => (
                                                <option key={item.key} value={item.key}>
                                                    {item.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="grid gap-2">
                                        <label
                                            htmlFor="fechaInicio"
                                            className="text-sm font-semibold text-slate-700"
                                        >
                                            Inicio opcional
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
                                            Fin opcional
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

                                    <div className="grid gap-2">
                                        <label
                                            htmlFor="recordatorio"
                                            className="text-sm font-semibold text-slate-700"
                                        >
                                            Recordatorio opcional
                                        </label>
                                        <Input
                                            id="recordatorio"
                                            name="recordatorio"
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
                                    className="rounded-2xl"
                                    disabled={isPending}
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    {isPending ? "Creando..." : "Crear tarea"}
                                </Button>
                            </form>
                        </Card>

                        <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-950">
                                Próximo paso
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-slate-500">
                                Luego conectaremos la conversión directa desde Ideas para que
                                una idea cree una tarea y quede marcada como convertida.
                            </p>
                        </Card>
                    </div>
                </section>
            </div>
        </AppShell>
    );
}