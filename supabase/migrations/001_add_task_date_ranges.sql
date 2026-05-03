-- IMPULSO
-- Agrega rango de fechas a tareas para poder bloquear cruces dentro de objetivos.

alter table public.tareas
add column if not exists fecha_inicio date,
add column if not exists fecha_limite date;

create index if not exists tareas_fecha_inicio_idx
on public.tareas(fecha_inicio);

create index if not exists tareas_fecha_limite_idx
on public.tareas(fecha_limite);

-- Opcional: migrar fecha actual como fecha_inicio/fecha_limite si ya existía.
update public.tareas
set
  fecha_inicio = coalesce(fecha_inicio, fecha),
  fecha_limite = coalesce(fecha_limite, fecha)
where fecha is not null
  and (fecha_inicio is null or fecha_limite is null);