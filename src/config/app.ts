import {
  Bell,
  CalendarDays,
  FolderKanban,
  RotateCcw,
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
    description: "Proyectos activos y acceso rápido para iniciar una nueva idea.",
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
  nuevaIdea: "/nueva-idea",
  dashboard: "/",
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