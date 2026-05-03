"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    CircleDashed,
    FolderKanban,
    ListTodo,
    PauseCircle,
    Plus,
    RefreshCcw,
    Search,
    Target,
    XCircle,
} from "lucide-react";

import {
    cambiarEstadoObjetivo,
    crearObjetivo,
    type EstadoObjetivo,
} from "@/features/objetivos/actions";
import {
    getObjetivosParaSelector,
    type ObjetivoSelector,
} from "@/features/objetivos/queries";
import {
    getProyectos,
    type ProyectoResumen,
} from "@/features/proyectos/queries";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ObjetivoUI = ObjetivoSelector & {
    descripcion?: string | null;
    estado?: EstadoObjetivo;
    fecha_inicio?: string | null;
    fecha_limite?: string | null;
    progreso?: number | null;
    proyecto?: {
        id: string;
        nombre: string;
    } | null;
};

const estadosObjetivo: {
    key: EstadoObjetivo;
    title: string;
    description: string;
    icon: React.ElementType;
}[] = [
        {
            key: "activo",
            title: "Activo",
            description: "Objetivos que están en ejecución.",
            icon: Target,
        },
        {
            key: "pausado",
            title: "Pausado",
            description: "Metas detenidas temporalmente.",
            icon: PauseCircle,
        },
        {
            key: "completado",
            title: "Completado",
            description: "Objetivos finalizados.",
            icon: CheckCircle2,
        },
        {
            key: "abandonado",
            title: "Abandonado",
            description: "Objetivos descartados.",
            icon: XCircle,
        },
    ];

const estadoStyles: Record<EstadoObjetivo, string> = {
    activo: "bg-emerald-300/20 text-emerald-100 ring-emerald-200/20",
    pausado: "bg-amber-300/20 text-amber-100 ring-amber-200/20",
    completado: "bg-sky-300/20 text-sky-100 ring-sky-200/20",
    abandonado: "bg-slate-300/15 text-slate-200 ring-white/10",
};

const inputClassName =
    "rounded-2xl border-white/10 bg-white/10 text-white placeholder:text-slate-400 shadow-sm backdrop-blur-xl focus:border-white/30 focus:ring-4 focus:ring-white/10";

const textareaClassName =
    "min-h-28 rounded-2xl border-white/10 bg-white/10 text-white placeholder:text-slate-400 shadow-sm backdrop-blur-xl focus:border-white/30 focus:ring-4 focus:ring-white/10";

const selectClassName =
    "h-10 rounded-2xl border border-white/10 bg-slate-950/70 px-3 text-sm text-white shadow-sm outline-none transition focus:border-white/30 focus:ring-4 focus:ring-white/10 disabled:cursor-not-allowed disabled:opacity-60";

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

function getEstadoObjetivo(objetivo: ObjetivoUI): EstadoObjetivo {
    return objetivo.estado ?? "activo";
}

function ObjetivosContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const proyectoIdFromUrl = searchParams.get("proyectoId") ?? "";

    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [proyectoId, setProyectoId] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaLimite, setFechaLimite] = useState("");
    const [estado, setEstado] = useState<EstadoObjetivo>("activo");
    const [search, setSearch] = useState("");

    const [objetivos, setObjetivos] = useState<ObjetivoUI[]>([]);
    const [proyectos, setProyectos] = useState<ProyectoResumen[]>([]);

    const [loadingObjetivos, setLoadingObjetivos] = useState(true);
    const [loadingProyectos, setLoadingProyectos] = useState(true);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [updatingObjetivoId, setUpdatingObjetivoId] = useState<string | null>(
        null
    );

    const [isPending, startTransition] = useTransition();

    async function loadObjetivos() {
        setLoadingObjetivos(true);
        setError("");

        try {
            const data = await getObjetivosParaSelector();
            setObjetivos((data ?? []) as ObjetivoUI[]);
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

    useEffect(() => {
        loadObjetivos();
        loadProyectos();
    }, []);

    useEffect(() => {
        if (proyectoIdFromUrl) {
            setProyectoId(proyectoIdFromUrl);
        }
    }, [proyectoIdFromUrl]);

    const proyectoSeleccionado = proyectos.find(
        (proyecto) => proyecto.id === proyectoId
    );

    const objetivosFiltrados = useMemo(() => {
        const term = search.trim().toLowerCase();

        return objetivos.filter((objetivo) => {
            const perteneceAlProyecto = proyectoId
                ? objetivo.proyecto_id === proyectoId
                : true;

            if (!perteneceAlProyecto) return false;

            if (!term) return true;

            const tituloObjetivo = objetivo.titulo.toLowerCase();
            const descripcionObjetivo = objetivo.descripcion?.toLowerCase() ?? "";
            const estadoObjetivo = getEstadoObjetivo(objetivo).toLowerCase();

            return (
                tituloObjetivo.includes(term) ||
                descripcionObjetivo.includes(term) ||
                estadoObjetivo.includes(term)
            );
        });
    }, [objetivos, proyectoId, search]);

    const objetivosPorEstado = useMemo(() => {
        return estadosObjetivo.reduce<Record<EstadoObjetivo, ObjetivoUI[]>>(
            (acc, estadoItem) => {
                acc[estadoItem.key] = objetivosFiltrados.filter(
                    (objetivo) => getEstadoObjetivo(objetivo) === estadoItem.key
                );

                return acc;
            },
            {
                activo: [],
                pausado: [],
                completado: [],
                abandonado: [],
            }
        );
    }, [objetivosFiltrados]);

    function resetForm() {
        setTitulo("");
        setDescripcion("");

        if (!proyectoIdFromUrl) {
            setProyectoId("");
        }

        setFechaInicio("");
        setFechaLimite("");
        setEstado("activo");
    }

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
                await loadObjetivos();

                if (objetivo?.id) {
                    router.push(
                        `/tareas?proyectoId=${proyectoId}&objetivoId=${objetivo.id}#crear-tarea`
                    );
                    return;
                }

                resetForm();
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "No se pudo crear el objetivo.";

                setError(message);
            }
        });
    }

    function handleCambiarEstadoObjetivo(
        objetivoId: string,
        nuevoEstado: EstadoObjetivo
    ) {
        setError("");
        setMessage("");
        setUpdatingObjetivoId(objetivoId);

        startTransition(async () => {
            try {
                await cambiarEstadoObjetivo(objetivoId, nuevoEstado);
                setMessage("Estado de objetivo actualizado correctamente.");
                await loadObjetivos();
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "No se pudo actualizar el objetivo.";

                setError(message);
            } finally {
                setUpdatingObjetivoId(null);
            }
        });
    }

    return (
        <AppShell
            title="Objetivos"
            description="Define metas claras para tus proyectos y conviértelas en tareas ejecutables."
        >
            <div className="grid gap-6 text-white">
                <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/48 shadow-[0_24px_90px_rgba(2,6,23,0.35)] backdrop-blur-2xl">
                    <div className="relative grid gap-6 p-6 md:grid-cols-[1fr_340px] md:p-8">
                        <div className="absolute right-0 top-0 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />

                        <div className="relative">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-300/15 px-4 py-2 text-sm font-semibold text-emerald-100 shadow-sm backdrop-blur-xl">
                                <Target className="h-4 w-4" />
                                Centro de objetivos
                            </div>

                            <h1 className="max-w-2xl text-3xl font-black tracking-tight text-white drop-shadow-sm md:text-4xl">
                                Un objetivo convierte una idea en una meta alcanzable.
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 md:text-base">
                                Crea objetivos por proyecto y conviértelos rápidamente en tareas
                                concretas para avanzar sin perder el hilo.
                            </p>

                            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                                <Button
                                    className="rounded-2xl bg-white text-slate-950 shadow-sm hover:bg-slate-100"
                                    onClick={() => {
                                        document
                                            .getElementById("crear-objetivo")
                                            ?.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Nuevo objetivo
                                </Button>

                                <Button
                                    variant="outline"
                                    className="rounded-2xl border-white/15 bg-white/10 text-white shadow-sm backdrop-blur-xl hover:bg-white/15"
                                    onClick={loadObjetivos}
                                    disabled={loadingObjetivos}
                                >
                                    <RefreshCcw
                                        className={`mr-2 h-4 w-4 ${loadingObjetivos ? "animate-spin" : ""
                                            }`}
                                    />
                                    {loadingObjetivos ? "Actualizando..." : "Actualizar"}
                                </Button>
                            </div>
                        </div>

                        <Card className="relative rounded-[2rem] border-white/10 bg-slate-950/72 p-6 text-white shadow-[0_18px_70px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
                            <p className="text-sm font-semibold text-slate-300">
                                Flujo correcto
                            </p>

                            <div className="mt-5 grid gap-3">
                                {["Proyecto", "Objetivo", "Tarea", "Calendario"].map(
                                    (item, index) => (
                                        <div
                                            key={item}
                                            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-xs font-black text-slate-950">
                                                    {index + 1}
                                                </span>

                                                <span className="text-sm font-semibold text-white">
                                                    {item}
                                                </span>
                                            </div>

                                            {index < 3 ? (
                                                <ArrowRight className="h-4 w-4 text-slate-300" />
                                            ) : null}
                                        </div>
                                    )
                                )}
                            </div>
                        </Card>
                    </div>
                </section>

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

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {estadosObjetivo.map((item) => {
                        const Icon = item.icon;
                        const total = objetivosPorEstado[item.key]?.length ?? 0;

                        return (
                            <Card
                                key={item.key}
                                className="rounded-[1.75rem] border-white/10 bg-white/10 p-5 text-white shadow-[0_18px_70px_rgba(2,6,23,0.18)] backdrop-blur-2xl"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-3xl font-black text-white">{total}</p>

                                        <h3 className="mt-2 text-sm font-bold text-slate-100">
                                            {item.title}
                                        </h3>

                                        <p className="mt-1 text-xs leading-5 text-slate-300">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="rounded-2xl bg-white/15 p-3 text-slate-100 ring-1 ring-white/10">
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </section>

                <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
                    <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <h2 className="text-xl font-black text-white">
                                    Objetivos por proyecto
                                </h2>

                                <p className="mt-1 text-sm text-slate-300">
                                    Revisa, filtra y entra a cada objetivo para crear tareas.
                                </p>
                            </div>

                            <div className="relative w-full sm:w-[300px]">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />

                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Buscar objetivo..."
                                    className="h-10 w-full rounded-2xl border border-white/10 bg-white/10 pl-10 pr-4 text-sm font-semibold text-white outline-none backdrop-blur-xl transition placeholder:text-slate-300 focus:border-white/30 focus:bg-white/15 focus:ring-4 focus:ring-white/10"
                                />
                            </div>
                        </div>

                        {loadingObjetivos ? (
                            <div className="rounded-3xl border border-dashed border-white/20 bg-white/10 p-6 text-center backdrop-blur-xl">
                                <p className="text-sm font-medium text-slate-300">
                                    Cargando objetivos...
                                </p>
                            </div>
                        ) : objetivosFiltrados.length === 0 ? (
                            <div className="rounded-3xl border border-dashed border-white/20 bg-white/10 p-6 text-center backdrop-blur-xl">
                                <Target className="mx-auto mb-3 h-8 w-8 text-slate-300" />

                                <p className="font-semibold text-white">
                                    Todavía no hay objetivos
                                </p>

                                <p className="mt-1 text-sm text-slate-300">
                                    Crea un objetivo desde el formulario de la derecha.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {objetivosFiltrados.map((objetivo) => {
                                    const objetivoEstado = getEstadoObjetivo(objetivo);

                                    return (
                                        <Link
                                            key={objetivo.id}
                                            href={`/objetivos/${objetivo.id}`}
                                            className="group rounded-3xl border border-white/10 bg-white/10 p-5 text-white shadow-[0_18px_70px_rgba(2,6,23,0.18)] backdrop-blur-2xl transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/15 hover:shadow-[0_24px_90px_rgba(2,6,23,0.26)]"
                                        >
                                            <div className="mb-4 flex items-start justify-between gap-3">
                                                <div className="rounded-2xl bg-emerald-300/20 p-3 text-emerald-100 ring-1 ring-emerald-200/20">
                                                    <Target className="h-5 w-5" />
                                                </div>

                                                <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 text-slate-200 shadow-sm ring-1 ring-white/10 transition group-hover:bg-white group-hover:text-slate-950">
                                                    <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                                                </span>
                                            </div>

                                            <div className="mb-3 flex flex-wrap gap-2">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${estadoStyles[objetivoEstado]}`}
                                                >
                                                    {objetivoEstado}
                                                </span>

                                                {objetivo.proyecto ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-sky-200/20 bg-sky-300/15 px-3 py-1 text-xs font-semibold text-sky-100 backdrop-blur-xl">
                                                        <FolderKanban className="h-3.5 w-3.5" />
                                                        {objetivo.proyecto.nombre}
                                                    </span>
                                                ) : objetivo.proyecto_id ? (
                                                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200 backdrop-blur-xl">
                                                        <FolderKanban className="h-3.5 w-3.5" />
                                                        Proyecto asociado
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300 backdrop-blur-xl">
                                                        Sin proyecto
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="line-clamp-2 text-lg font-black leading-6 text-white">
                                                {objetivo.titulo}
                                            </h3>

                                            {objetivo.descripcion ? (
                                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">
                                                    {objetivo.descripcion}
                                                </p>
                                            ) : (
                                                <p className="mt-2 text-sm text-slate-400">
                                                    Sin descripción
                                                </p>
                                            )}

                                            <div className="mt-4 grid gap-2 text-xs font-medium text-slate-300">
                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="h-3.5 w-3.5" />
                                                    Inicio: {formatFecha(objetivo.fecha_inicio)}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <CalendarDays className="h-3.5 w-3.5" />
                                                    Fin: {formatFecha(objetivo.fecha_limite)}
                                                </div>
                                            </div>

                                            <div className="mt-5">
                                                <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                                                    <span className="text-slate-300">Progreso</span>
                                                    <span className="text-white">
                                                        {objetivo.progreso ?? 0}%
                                                    </span>
                                                </div>

                                                <div className="h-3 rounded-full bg-white/10 ring-1 ring-white/10">
                                                    <div
                                                        className="h-3 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.35)]"
                                                        style={{ width: `${objetivo.progreso ?? 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </Card>

                    <div className="grid gap-6">
                        <Card
                            id="crear-objetivo"
                            className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl"
                        >
                            <div className="mb-5 flex items-center gap-3">
                                <div className="rounded-2xl bg-white p-3 text-slate-950 shadow-sm">
                                    <Plus className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-lg font-black text-white">
                                        Nuevo objetivo
                                    </h2>

                                    <p className="text-sm text-slate-300">
                                        Crea una meta y luego conviértela en tareas.
                                    </p>
                                </div>
                            </div>

                            {proyectoSeleccionado ? (
                                <div className="mb-5 rounded-3xl border border-sky-200/20 bg-sky-300/15 p-4 backdrop-blur-xl">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-100">
                                        Proyecto seleccionado
                                    </p>

                                    <p className="mt-1 text-sm font-bold text-white">
                                        {proyectoSeleccionado.nombre}
                                    </p>
                                </div>
                            ) : null}

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
                                        placeholder="Ej: Lanzar sistema semanal de contenido"
                                        className={inputClassName}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label
                                        htmlFor="descripcion"
                                        className="text-sm font-semibold text-slate-100"
                                    >
                                        Descripción opcional
                                    </label>

                                    <Textarea
                                        id="descripcion"
                                        value={descripcion}
                                        onChange={(event) => setDescripcion(event.target.value)}
                                        placeholder="Define qué significa completar este objetivo..."
                                        className={textareaClassName}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label
                                        htmlFor="proyectoId"
                                        className="text-sm font-semibold text-slate-100"
                                    >
                                        Proyecto opcional
                                    </label>

                                    <select
                                        id="proyectoId"
                                        value={proyectoId}
                                        onChange={(event) => setProyectoId(event.target.value)}
                                        disabled={loadingProyectos}
                                        className={selectClassName}
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
                                            : "Puedes crear el objetivo sin proyecto y organizarlo después."}
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <label
                                            htmlFor="fechaInicio"
                                            className="text-sm font-semibold text-slate-100"
                                        >
                                            Inicio opcional
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
                                            Fin opcional
                                        </label>

                                        <Input
                                            id="fechaLimite"
                                            type="date"
                                            value={fechaLimite}
                                            onChange={(event) => setFechaLimite(event.target.value)}
                                            className={inputClassName}
                                        />
                                    </div>
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
                                        {estadosObjetivo.map((item) => (
                                            <option key={item.key} value={item.key}>
                                                {item.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Button
                                    type="submit"
                                    size="lg"
                                    className="rounded-2xl bg-white text-slate-950 hover:bg-slate-100"
                                    disabled={isPending}
                                >
                                    <Plus className="mr-2 h-5 w-5" />
                                    {isPending ? "Creando..." : "Crear objetivo"}
                                </Button>
                            </form>
                        </Card>

                        <Card className="rounded-[2rem] border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="rounded-2xl bg-emerald-300/20 p-3 text-emerald-100 ring-1 ring-emerald-200/20">
                                    <ListTodo className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-lg font-black text-white">
                                        Próximo paso
                                    </h2>

                                    <p className="text-sm text-slate-300">
                                        Crear una tarea para avanzar.
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm leading-6 text-slate-300">
                                Después de crear el objetivo, la app te llevará directo al
                                formulario de tareas con el objetivo ya seleccionado.
                            </p>
                        </Card>
                    </div>
                </section>
            </div>
        </AppShell>
    );
}

export default function ObjetivosPage() {
    return (
        <Suspense
            fallback={
                <AppShell
                    title="Objetivos"
                    description="Define metas claras para tus proyectos y conviértelas en tareas ejecutables."
                >
                    <div className="rounded-[2rem] border border-white/10 bg-slate-950/44 p-6 text-white shadow-[0_24px_90px_rgba(2,6,23,0.28)] backdrop-blur-2xl">
                        <p className="text-sm font-medium text-slate-300">
                            Cargando objetivos...
                        </p>
                    </div>
                </AppShell>
            }
        >
            <ObjetivosContent />
        </Suspense>
    );
}