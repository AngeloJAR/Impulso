import {
  Bell,
  CalendarDays,
  FolderKanban,
  Lightbulb,
  ListTodo,
  RotateCcw,
  Target,
} from "lucide-react";

export const appConfig = {
  name: "Impulso",
  description:
    "Una app personal para capturar ideas rápidamente, organizarlas por proyecto, convertirlas en objetivos o tareas y recibir recordatorios para que nada importante se pierda.",
  tagline: "Captura ideas. Organiza proyectos. Convierte intención en acción.",
};

export const mainNavigation = [
  {
    title: "Dashboard",
    href: "/",
    icon: FolderKanban,
    description: "Inicio del flujo, proyectos activos y acceso rápido.",
  },
  {
    title: "Nueva idea",
    href: "/nueva-idea",
    icon: Lightbulb,
    description: "Captura una idea y conviértela en proyecto, objetivo o tarea.",
  },
  {
    title: "Proyectos",
    href: "/proyectos",
    icon: FolderKanban,
    description: "Organiza tus ideas por áreas, negocios o iniciativas.",
  },
  {
    title: "Objetivos",
    href: "/objetivos",
    icon: Target,
    description: "Define metas claras dentro de cada proyecto.",
  },
  {
    title: "Tareas",
    href: "/tareas",
    icon: ListTodo,
    description: "Convierte objetivos en acciones concretas.",
  },
  {
    title: "Calendario",
    href: "/calendario",
    icon: CalendarDays,
    description: "Vista de tareas, fechas límite y recordatorios.",
  },
  {
    title: "Recordatorios",
    href: "/recordatorios",
    icon: Bell,
    description: "Avisos para ideas, tareas u objetivos que necesitan atención.",
  },
  {
    title: "Revisión semanal",
    href: "/revision-semanal",
    icon: RotateCcw,
    description: "Revisa proyectos, objetivos, tareas e ideas pendientes.",
  },
] as const;

export const flowRoutes = {
  dashboard: "/",
  nuevaIdea: "/nueva-idea",
  proyectos: "/proyectos",
  objetivos: "/objetivos",
  tareas: "/tareas",
  calendario: "/calendario",
  recordatorios: "/recordatorios",
  revisionSemanal: "/revision-semanal",
} as const;

export const defaultProjects = [
  "AYR Motors / Lubricadora",
  "GestioLubricadoraMecanica ERP",
  "App Técnicos",
  "QuantFusion AI",
  "Vida personal",
  "Finanzas",
  "Marketing",
] as const;