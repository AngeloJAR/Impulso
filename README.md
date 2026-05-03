# Impulso

Impulso es una aplicación web personal para organizar ideas, proyectos, objetivos, tareas, calendario y recordatorios en un flujo claro:

**Idea → Proyecto → Objetivo → Tarea → Calendario**

La app está pensada para capturar ideas rápido, evitar que se pierdan y convertirlas en acciones concretas.

---

## Funcionalidades principales

### Dashboard

Pantalla principal para entrar al flujo de trabajo.

Desde aquí puedes:

- Crear una nueva idea.
- Ver proyectos existentes.
- Entrar a un proyecto para trabajar objetivos y tareas.
- Revisar el avance general del sistema.

---

### Ideas

Módulo para capturar pensamientos, propuestas o planes antes de convertirlos en acciones.

Estados disponibles:

- Nueva
- Revisar
- Para tarea
- Convertida
- Archivada

---

### Nueva idea

Flujo guiado para crear una idea completa.

Permite crear o seleccionar:

1. Idea principal
2. Proyecto existente o nuevo proyecto
3. Objetivo
4. Tareas iniciales

Al guardar, el sistema crea el flujo completo y conecta cada elemento.

---

### Proyectos

Módulo para organizar ideas, objetivos y tareas por espacios de trabajo.

Cada proyecto puede tener:

- Nombre
- Descripción
- Color
- Estado
- Objetivos asociados
- Tareas asociadas

---

### Objetivos

Módulo para convertir ideas o proyectos en metas claras.

Cada objetivo puede tener:

- Título
- Descripción
- Proyecto asociado
- Fecha de inicio
- Fecha límite
- Estado
- Progreso calculado

Estados disponibles:

- Activo
- Pausado
- Completado
- Abandonado

---

### Tareas

Módulo para crear acciones concretas.

Cada tarea puede tener:

- Título
- Descripción
- Proyecto asociado
- Objetivo asociado
- Prioridad
- Estado
- Fecha de inicio
- Fecha límite
- Recordatorio

Estados disponibles:

- Pendiente
- Hoy
- En proceso
- Bloqueada
- Terminada

Prioridades disponibles:

- Baja
- Media
- Alta

---

### Calendario

Vista temporal de tareas y recordatorios.

Permite revisar:

- Tareas de hoy
- Tareas próximas
- Recordatorios
- Tareas terminadas
- Distribución semanal

Las tareas con fecha de inicio, fecha límite o recordatorio aparecen dentro del calendario.

---

### Recordatorios

Pantalla preparada para avisos relacionados con:

- Ideas
- Tareas
- Objetivos

Su propósito es funcionar como memoria externa para recuperar elementos importantes en el momento correcto.

---

### Revisión semanal

Pantalla para revisar el sistema y recuperar foco.

Sirve para decidir:

- Qué ideas avanzar
- Qué tareas cerrar
- Qué objetivos mantener activos
- Qué proyectos necesitan atención
- Qué elementos archivar

---

## Tecnologías usadas

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- Lucide React
- shadcn/ui

---

## Estructura principal

```txt
src/
├─ app/
│  ├─ page.tsx
│  ├─ ideas/
│  ├─ nueva-idea/
│  ├─ proyectos/
│  ├─ objetivos/
│  ├─ tareas/
│  ├─ calendario/
│  ├─ recordatorios/
│  └─ revision-semanal/
│
├─ components/
│  ├─ layout/
│  └─ ui/
│
├─ config/
│
├─ features/
│  ├─ calendario/
│  ├─ ideas/
│  ├─ inbox/
│  ├─ objetivos/
│  ├─ proyectos/
│  └─ tareas/
│
└─ lib/
```

---

## Flujo principal de uso

```txt
Dashboard
   ↓
Nueva idea
   ↓
Proyecto
   ↓
Objetivo
   ↓
Tarea
   ↓
Calendario
```

También puedes entrar directamente a un proyecto y crear objetivos o tareas desde ahí.

---

## Variables de entorno

Crea un archivo en la raíz del proyecto:

```txt
.env.local
```

Y agrega tus credenciales de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

---

## Instalación

Clona el proyecto:

```bash
git clone https://github.com/AngeloJAR/Impulso.git
```

Entra a la carpeta:

```bash
cd Impulso
```

Instala dependencias:

```bash
npm install
```

Ejecuta en desarrollo:

```bash
npm run dev
```

Abre en el navegador:

```txt
http://localhost:3000
```

---

## Build de producción

Para verificar que todo compile correctamente:

```bash
npm run build
```

---

## Comandos útiles

Ver estado de Git:

```bash
git status
```

Agregar cambios:

```bash
git add .
```

Crear commit:

```bash
git commit -m "Actualiza documentación del proyecto"
```

Subir cambios:

```bash
git push origin main
```

Si tu rama se llama `master`, usa:

```bash
git push origin master
```

---

## Guardar este README en Git

Después de editar este archivo, puedes guardar y subir los cambios con:

```bash
git add README.md
git commit -m "Agrega README del proyecto"
git push origin main
```

Si tu rama se llama `master`, usa:

```bash
git add README.md
git commit -m "Agrega README del proyecto"
git push origin master
```

---

## Estado actual del proyecto

La app ya cuenta con el flujo principal armado:

- Dashboard
- Ideas
- Nueva idea
- Proyectos
- Objetivos
- Tareas
- Calendario
- Recordatorios
- Revisión semanal

También se aplicó una mejora visual con fondo oscuro, tarjetas translúcidas y estilo tipo glass.

---

## Objetivo del proyecto

Impulso busca ayudar a organizar ideas y convertirlas en acciones reales, evitando que los pensamientos queden olvidados o dispersos.

La idea central es simple:

> Capturar rápido, organizar con intención y ejecutar con claridad.