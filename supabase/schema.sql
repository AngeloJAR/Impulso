-- =========================================================
-- IMPULSO - Schema inicial
-- App personal para capturar ideas, proyectos, objetivos,
-- tareas y recordatorios.
-- =========================================================

create extension if not exists "pgcrypto";

-- =========================================================
-- PROYECTOS
-- =========================================================

create table if not exists public.proyectos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  nombre text not null,
  descripcion text,
  color text not null default 'slate',
  estado text not null default 'activo',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint proyectos_estado_check check (
    estado in ('activo', 'pausado', 'completado', 'archivado')
  )
);

create index if not exists proyectos_user_id_idx
on public.proyectos(user_id);

create index if not exists proyectos_estado_idx
on public.proyectos(estado);

-- =========================================================
-- IDEAS
-- =========================================================

create table if not exists public.ideas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  titulo text not null,
  descripcion text,
  proyecto_id uuid references public.proyectos(id) on delete set null,

  categoria text,
  prioridad text not null default 'media',
  estado text not null default 'nueva',

  fecha_recordatorio timestamptz,
  convertida_en_tarea boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint ideas_prioridad_check check (
    prioridad in ('baja', 'media', 'alta')
  ),

  constraint ideas_estado_check check (
    estado in (
      'nueva',
      'revisar',
      'convertir_en_tarea',
      'convertida',
      'archivada'
    )
  )
);

create index if not exists ideas_user_id_idx
on public.ideas(user_id);

create index if not exists ideas_proyecto_id_idx
on public.ideas(proyecto_id);

create index if not exists ideas_estado_idx
on public.ideas(estado);

create index if not exists ideas_fecha_recordatorio_idx
on public.ideas(fecha_recordatorio);

-- =========================================================
-- OBJETIVOS
-- =========================================================

create table if not exists public.objetivos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  titulo text not null,
  descripcion text,
  proyecto_id uuid references public.proyectos(id) on delete set null,

  fecha_inicio date,
  fecha_limite date,

  progreso integer not null default 0,
  estado text not null default 'activo',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint objetivos_progreso_check check (
    progreso >= 0 and progreso <= 100
  ),

  constraint objetivos_estado_check check (
    estado in ('activo', 'pausado', 'completado', 'abandonado')
  )
);

create index if not exists objetivos_user_id_idx
on public.objetivos(user_id);

create index if not exists objetivos_proyecto_id_idx
on public.objetivos(proyecto_id);

create index if not exists objetivos_estado_idx
on public.objetivos(estado);

create index if not exists objetivos_fecha_limite_idx
on public.objetivos(fecha_limite);

-- =========================================================
-- TAREAS
-- =========================================================

create table if not exists public.tareas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  titulo text not null,
  descripcion text,

  proyecto_id uuid references public.proyectos(id) on delete set null,
  objetivo_id uuid references public.objetivos(id) on delete set null,

  prioridad text not null default 'media',
  estado text not null default 'pendiente',

  fecha date,
  recordatorio timestamptz,
  completada boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint tareas_prioridad_check check (
    prioridad in ('baja', 'media', 'alta')
  ),

  constraint tareas_estado_check check (
    estado in (
      'pendiente',
      'hoy',
      'en_proceso',
      'bloqueada',
      'terminada'
    )
  )
);

create index if not exists tareas_user_id_idx
on public.tareas(user_id);

create index if not exists tareas_proyecto_id_idx
on public.tareas(proyecto_id);

create index if not exists tareas_objetivo_id_idx
on public.tareas(objetivo_id);

create index if not exists tareas_estado_idx
on public.tareas(estado);

create index if not exists tareas_fecha_idx
on public.tareas(fecha);

create index if not exists tareas_recordatorio_idx
on public.tareas(recordatorio);

-- =========================================================
-- RECORDATORIOS
-- =========================================================

create table if not exists public.recordatorios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  tipo text not null,
  fecha timestamptz not null,
  estado text not null default 'pendiente',

  idea_id uuid references public.ideas(id) on delete cascade,
  tarea_id uuid references public.tareas(id) on delete cascade,
  objetivo_id uuid references public.objetivos(id) on delete cascade,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint recordatorios_tipo_check check (
    tipo in ('idea', 'tarea', 'objetivo')
  ),

  constraint recordatorios_estado_check check (
    estado in ('pendiente', 'enviado', 'pospuesto', 'cancelado')
  ),

  constraint recordatorios_relacion_check check (
    (
      tipo = 'idea'
      and idea_id is not null
      and tarea_id is null
      and objetivo_id is null
    )
    or
    (
      tipo = 'tarea'
      and idea_id is null
      and tarea_id is not null
      and objetivo_id is null
    )
    or
    (
      tipo = 'objetivo'
      and idea_id is null
      and tarea_id is null
      and objetivo_id is not null
    )
  )
);

create index if not exists recordatorios_user_id_idx
on public.recordatorios(user_id);

create index if not exists recordatorios_estado_idx
on public.recordatorios(estado);

create index if not exists recordatorios_fecha_idx
on public.recordatorios(fecha);

create index if not exists recordatorios_idea_id_idx
on public.recordatorios(idea_id);

create index if not exists recordatorios_tarea_id_idx
on public.recordatorios(tarea_id);

create index if not exists recordatorios_objetivo_id_idx
on public.recordatorios(objetivo_id);

-- =========================================================
-- UPDATED_AT AUTOMÁTICO
-- =========================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_proyectos_updated_at on public.proyectos;
create trigger set_proyectos_updated_at
before update on public.proyectos
for each row
execute function public.set_updated_at();

drop trigger if exists set_ideas_updated_at on public.ideas;
create trigger set_ideas_updated_at
before update on public.ideas
for each row
execute function public.set_updated_at();

drop trigger if exists set_objetivos_updated_at on public.objetivos;
create trigger set_objetivos_updated_at
before update on public.objetivos
for each row
execute function public.set_updated_at();

drop trigger if exists set_tareas_updated_at on public.tareas;
create trigger set_tareas_updated_at
before update on public.tareas
for each row
execute function public.set_updated_at();

drop trigger if exists set_recordatorios_updated_at on public.recordatorios;
create trigger set_recordatorios_updated_at
before update on public.recordatorios
for each row
execute function public.set_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY
-- Cada usuario solo puede ver/modificar sus propios datos.
-- =========================================================

alter table public.proyectos enable row level security;
alter table public.ideas enable row level security;
alter table public.objetivos enable row level security;
alter table public.tareas enable row level security;
alter table public.recordatorios enable row level security;

-- PROYECTOS

drop policy if exists "proyectos_select_own" on public.proyectos;
create policy "proyectos_select_own"
on public.proyectos
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "proyectos_insert_own" on public.proyectos;
create policy "proyectos_insert_own"
on public.proyectos
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "proyectos_update_own" on public.proyectos;
create policy "proyectos_update_own"
on public.proyectos
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "proyectos_delete_own" on public.proyectos;
create policy "proyectos_delete_own"
on public.proyectos
for delete
to authenticated
using (user_id = auth.uid());

-- IDEAS

drop policy if exists "ideas_select_own" on public.ideas;
create policy "ideas_select_own"
on public.ideas
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "ideas_insert_own" on public.ideas;
create policy "ideas_insert_own"
on public.ideas
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "ideas_update_own" on public.ideas;
create policy "ideas_update_own"
on public.ideas
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "ideas_delete_own" on public.ideas;
create policy "ideas_delete_own"
on public.ideas
for delete
to authenticated
using (user_id = auth.uid());

-- OBJETIVOS

drop policy if exists "objetivos_select_own" on public.objetivos;
create policy "objetivos_select_own"
on public.objetivos
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "objetivos_insert_own" on public.objetivos;
create policy "objetivos_insert_own"
on public.objetivos
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "objetivos_update_own" on public.objetivos;
create policy "objetivos_update_own"
on public.objetivos
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "objetivos_delete_own" on public.objetivos;
create policy "objetivos_delete_own"
on public.objetivos
for delete
to authenticated
using (user_id = auth.uid());

-- TAREAS

drop policy if exists "tareas_select_own" on public.tareas;
create policy "tareas_select_own"
on public.tareas
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "tareas_insert_own" on public.tareas;
create policy "tareas_insert_own"
on public.tareas
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "tareas_update_own" on public.tareas;
create policy "tareas_update_own"
on public.tareas
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "tareas_delete_own" on public.tareas;
create policy "tareas_delete_own"
on public.tareas
for delete
to authenticated
using (user_id = auth.uid());

-- RECORDATORIOS

drop policy if exists "recordatorios_select_own" on public.recordatorios;
create policy "recordatorios_select_own"
on public.recordatorios
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "recordatorios_insert_own" on public.recordatorios;
create policy "recordatorios_insert_own"
on public.recordatorios
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "recordatorios_update_own" on public.recordatorios;
create policy "recordatorios_update_own"
on public.recordatorios
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "recordatorios_delete_own" on public.recordatorios;
create policy "recordatorios_delete_own"
on public.recordatorios
for delete
to authenticated
using (user_id = auth.uid());