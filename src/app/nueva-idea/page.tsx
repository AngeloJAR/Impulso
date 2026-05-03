"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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
import {
    getProyectos,
    type ProyectoResumen,
} from "@/features/proyectos/queries";
import {
    crearObjetivo,
    type EstadoObjetivo,
} from "@/features/objetivos/actions";
import { crearTarea } from "@/features/tareas/actions";
import {
    type EstadoTarea,
    type PrioridadTarea,
} from "@/features/tareas/queries";
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
    const [nuevoProyectoColor, setNuevoProyectoColor] = useState<
        (typeof coloresProyecto)[number]["value"]
    >("slate");

    const [objetivoTitulo, setObjetivoTitulo] = useState("");
    const [objetivoDescripcion, setObjetivoDescripcion] = useState("");
    const [objetivoFechaInicio, setObjetivoFechaInicio] = useState("");
    const [objetivoFechaLimite, setObjetivoFechaLimite] = useState("");
    const [objetivoEstado, setObjetivoEstado] =
        useState<EstadoObjetivo>("activo");

    const [tareas, setTareas] = useState<TareaDraft[]>([
        crearTareaVacia("tarea-inicial"),
    ]);

    const [proyectos, setProyectos] = useState<ProyectoResumen[]>([]);
    const [loadingProyectos, setLoadingProyectos] = useState(true);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [isPending, startTransition] = useTransition();

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
        loadProyectos();
    }, []);

    useEffect(() => {
        if (!objetivoTitulo && ideaTitulo.trim()) {
            setObjetivoTitulo(ideaTitulo.trim());
        }
    }, [ideaTitulo, objetivoTitulo]);

    useEffect(() => {
        if (!objetivoDescripcion && ideaDescripcion.trim()) {
            setObjetivoDescripcion(ideaDescripcion.trim());
        }
    }, [ideaDescripcion, objetivoDescripcion]);

    const proyectoSeleccionado = useMemo(
        () => proyectos.find((proyecto) => proyecto.id === proyectoId),
        [proyectos, proyectoId]
    );

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

        const tareasValidas = tareas.filter((tarea) => tarea.titulo.trim());

        if (tareasValidas.length === 0) {
            throw new Error("Agrega al menos una tarea para que la idea avance.");
        }

        const tareaConFechasInvertidas = tareasValidas.find(
            (tarea) =>
                tarea.fechaInicio &&
                tarea.fechaLimite &&
                tarea.fechaInicio > tarea.fechaLimite
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
                const message =
                    err instanceof Error
                        ? err.message
                        : "No se pudo completar el flujo.";

                setError(message);
            }
        });
    }

    return (
        <AppShell
            title="Nueva idea"
            description="Flujo guiado: idea → proyecto → objetivo → tareas."
        >
            <form onSubmit={handleSubmit} className="grid gap-6">
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
                    <div className="grid gap-6">
                        <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-start gap-4">
                                <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                                    <Lightbulb className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                        1. Captura la idea
                                    </h2>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        No la dejes suelta. Esta idea se convertirá en proyecto,
                                        objetivo y tareas.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <label
                                        htmlFor="ideaTitulo"
                                        className="text-sm font-semibold text-slate-700"
                                    >
                                        Idea principal
                                    </label>
                                    <Input
                                        id="ideaTitulo"
                                        value={ideaTitulo}
                                        onChange={(event) => setIdeaTitulo(event.target.value)}
                                        placeholder="Ej: Crear sistema de contenido para Marketing"
                                        className="rounded-2xl"
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label
                                        htmlFor="ideaDescripcion"
                                        className="text-sm font-semibold text-slate-700"
                                    >
                                        Descripción
                                    </label>
                                    <Textarea
                                        id="ideaDescripcion"
                                        value={ideaDescripcion}
                                        onChange={(event) => setIdeaDescripcion(event.target.value)}
                                        placeholder="Explica qué quieres lograr, por qué importa o qué contexto tiene..."
                                        className="min-h-28 rounded-2xl"
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-start gap-4">
                                <div className="rounded-2xl bg-sky-50 p-3 text-sky-600">
                                    <FolderKanban className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                        2. Proyecto
                                    </h2>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Decide si esta idea pertenece a un proyecto existente o si
                                        debe crear uno nuevo.
                                    </p>
                                </div>
                            </div>

                            <div className="mb-5 grid gap-3 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => setModoProyecto("existente")}
                                    className={`rounded-3xl border p-4 text-left transition ${modoProyecto === "existente"
                                        ? "border-slate-950 bg-slate-950 text-white"
                                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                                        }`}
                                >
                                    <p className="font-bold">Proyecto existente</p>
                                    <p
                                        className={`mt-1 text-sm leading-5 ${modoProyecto === "existente"
                                            ? "text-slate-300"
                                            : "text-slate-500"
                                            }`}
                                    >
                                        Usar uno de tus proyectos actuales.
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setModoProyecto("nuevo")}
                                    className={`rounded-3xl border p-4 text-left transition ${modoProyecto === "nuevo"
                                        ? "border-slate-950 bg-slate-950 text-white"
                                        : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
                                        }`}
                                >
                                    <p className="font-bold">Nuevo proyecto</p>
                                    <p
                                        className={`mt-1 text-sm leading-5 ${modoProyecto === "nuevo"
                                            ? "text-slate-300"
                                            : "text-slate-500"
                                            }`}
                                    >
                                        Crear un espacio nuevo para esta idea.
                                    </p>
                                </button>
                            </div>

                            {modoProyecto === "existente" ? (
                                <div className="grid gap-2">
                                    <label
                                        htmlFor="proyectoId"
                                        className="text-sm font-semibold text-slate-700"
                                    >
                                        Selecciona proyecto
                                    </label>

                                    <select
                                        id="proyectoId"
                                        value={proyectoId}
                                        onChange={(event) => setProyectoId(event.target.value)}
                                        disabled={loadingProyectos}
                                        className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs outline-none transition focus:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <option value="">
                                            {loadingProyectos
                                                ? "Cargando proyectos..."
                                                : "Selecciona un proyecto"}
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
                                            className="text-sm font-semibold text-slate-700"
                                        >
                                            Nombre del proyecto
                                        </label>
                                        <Input
                                            id="nuevoProyectoNombre"
                                            value={nuevoProyectoNombre}
                                            onChange={(event) =>
                                                setNuevoProyectoNombre(event.target.value)
                                            }
                                            placeholder="Ej: Marketing"
                                            className="rounded-2xl"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <label
                                            htmlFor="nuevoProyectoDescripcion"
                                            className="text-sm font-semibold text-slate-700"
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
                                            className="min-h-24 rounded-2xl"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <label
                                            htmlFor="nuevoProyectoColor"
                                            className="text-sm font-semibold text-slate-700"
                                        >
                                            Color
                                        </label>
                                        <select
                                            id="nuevoProyectoColor"
                                            value={nuevoProyectoColor}
                                            onChange={(event) =>
                                                setNuevoProyectoColor(
                                                    event.target.value as typeof nuevoProyectoColor
                                                )
                                            }
                                            className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs outline-none transition focus:border-slate-400"
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

                        <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-start gap-4">
                                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                                    <Target className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                        3. Objetivo
                                    </h2>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Convierte la idea en una meta clara con rango de fechas.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                <div className="grid gap-2">
                                    <label
                                        htmlFor="objetivoTitulo"
                                        className="text-sm font-semibold text-slate-700"
                                    >
                                        Título del objetivo
                                    </label>
                                    <Input
                                        id="objetivoTitulo"
                                        value={objetivoTitulo}
                                        onChange={(event) => setObjetivoTitulo(event.target.value)}
                                        placeholder="Ej: Lanzar sistema semanal de contenido"
                                        className="rounded-2xl"
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <label
                                        htmlFor="objetivoDescripcion"
                                        className="text-sm font-semibold text-slate-700"
                                    >
                                        Descripción del objetivo
                                    </label>
                                    <Textarea
                                        id="objetivoDescripcion"
                                        value={objetivoDescripcion}
                                        onChange={(event) =>
                                            setObjetivoDescripcion(event.target.value)
                                        }
                                        placeholder="Define qué significa completar este objetivo..."
                                        className="min-h-24 rounded-2xl"
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div className="grid gap-2">
                                        <label
                                            htmlFor="objetivoFechaInicio"
                                            className="text-sm font-semibold text-slate-700"
                                        >
                                            Inicio
                                        </label>
                                        <Input
                                            id="objetivoFechaInicio"
                                            type="date"
                                            value={objetivoFechaInicio}
                                            onChange={(event) =>
                                                setObjetivoFechaInicio(event.target.value)
                                            }
                                            className="rounded-2xl"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <label
                                            htmlFor="objetivoFechaLimite"
                                            className="text-sm font-semibold text-slate-700"
                                        >
                                            Fin
                                        </label>
                                        <Input
                                            id="objetivoFechaLimite"
                                            type="date"
                                            value={objetivoFechaLimite}
                                            onChange={(event) =>
                                                setObjetivoFechaLimite(event.target.value)
                                            }
                                            className="rounded-2xl"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <label
                                            htmlFor="objetivoEstado"
                                            className="text-sm font-semibold text-slate-700"
                                        >
                                            Estado
                                        </label>
                                        <select
                                            id="objetivoEstado"
                                            value={objetivoEstado}
                                            onChange={(event) =>
                                                setObjetivoEstado(event.target.value as EstadoObjetivo)
                                            }
                                            className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs outline-none transition focus:border-slate-400"
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

                        <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-start gap-4">
                                <div className="rounded-2xl bg-violet-50 p-3 text-violet-600">
                                    <ListTodo className="h-5 w-5" />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-slate-950">
                                        4. Tareas iniciales
                                    </h2>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Agrega las primeras acciones. Luego aparecerán en el
                                        calendario si tienen fecha.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {tareas.map((tarea, index) => (
                                    <div
                                        key={tarea.id}
                                        className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                                    >
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <h3 className="font-semibold text-slate-800">
                                                Tarea {index + 1}
                                            </h3>

                                            {tareas.length > 1 ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-2xl bg-white"
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
                                                    className="text-sm font-semibold text-slate-700"
                                                >
                                                    Título
                                                </label>
                                                <Input
                                                    id={`tarea-${tarea.id}-titulo`}
                                                    value={tarea.titulo}
                                                    onChange={(event) =>
                                                        actualizarTarea(
                                                            tarea.id,
                                                            "titulo",
                                                            event.target.value
                                                        )
                                                    }
                                                    placeholder="Ej: Definir 5 ideas de contenido"
                                                    className="rounded-2xl bg-white"
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <label
                                                    htmlFor={`tarea-${tarea.id}-descripcion`}
                                                    className="text-sm font-semibold text-slate-700"
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
                                                    className="min-h-20 rounded-2xl bg-white"
                                                />
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                                                <div className="grid gap-2">
                                                    <label className="text-sm font-semibold text-slate-700">
                                                        Prioridad
                                                    </label>
                                                    <select
                                                        value={tarea.prioridad}
                                                        onChange={(event) =>
                                                            actualizarTarea(
                                                                tarea.id,
                                                                "prioridad",
                                                                event.target.value
                                                            )
                                                        }
                                                        className="h-10 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-xs outline-none transition focus:border-slate-400"
                                                    >
                                                        <option value="baja">Baja</option>
                                                        <option value="media">Media</option>
                                                        <option value="alta">Alta</option>
                                                    </select>
                                                </div>

                                                <div className="grid gap-2">
                                                    <label className="text-sm font-semibold text-slate-700">
                                                        Estado
                                                    </label>
                                                    <select
                                                        value={tarea.estado}
                                                        onChange={(event) =>
                                                            actualizarTarea(
                                                                tarea.id,
                                                                "estado",
                                                                event.target.value
                                                            )
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

                                                <div className="grid gap-2">
                                                    <label className="text-sm font-semibold text-slate-700">
                                                        Inicio
                                                    </label>
                                                    <Input
                                                        type="date"
                                                        value={tarea.fechaInicio}
                                                        onChange={(event) =>
                                                            actualizarTarea(
                                                                tarea.id,
                                                                "fechaInicio",
                                                                event.target.value
                                                            )
                                                        }
                                                        className="rounded-2xl bg-white"
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <label className="text-sm font-semibold text-slate-700">
                                                        Fin
                                                    </label>
                                                    <Input
                                                        type="date"
                                                        value={tarea.fechaLimite}
                                                        onChange={(event) =>
                                                            actualizarTarea(
                                                                tarea.id,
                                                                "fechaLimite",
                                                                event.target.value
                                                            )
                                                        }
                                                        className="rounded-2xl bg-white"
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    <label className="text-sm font-semibold text-slate-700">
                                                        Recordatorio
                                                    </label>
                                                    <Input
                                                        type="date"
                                                        value={tarea.recordatorio}
                                                        onChange={(event) =>
                                                            actualizarTarea(
                                                                tarea.id,
                                                                "recordatorio",
                                                                event.target.value
                                                            )
                                                        }
                                                        className="rounded-2xl bg-white"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-2xl bg-white"
                                    onClick={agregarTarea}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Agregar otra tarea
                                </Button>
                            </div>
                        </Card>
                    </div>

                    <aside className="grid h-fit gap-6">
                        <Card className="rounded-[2rem] border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
                            <h2 className="text-lg font-bold">Flujo lineal</h2>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                                Esta pantalla evita crear ideas sueltas. Todo lo que captures
                                debe avanzar hacia proyecto, objetivo y tareas.
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
                                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                                    >
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-950">
                                            {index + 1}
                                        </span>
                                        <p className="text-sm font-medium text-slate-200">
                                            {item}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="rounded-[2rem] border-slate-200 bg-white p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-slate-950">
                                Qué pasará al guardar
                            </h2>

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
                                        className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4"
                                    >
                                        <CheckCircle2 className="h-4 w-4 text-slate-500" />
                                        <p className="text-sm font-medium text-slate-700">
                                            {item}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Button
                            type="submit"
                            size="lg"
                            className="rounded-2xl"
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