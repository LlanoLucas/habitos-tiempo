-- Hábitos + Presupuesto de Tiempo — esquema inicial
-- 5 tablas. Sin tabla de perfiles: auth.users ya guarda id/email/metadata.
-- user_id va denormalizado en las tablas hijas para que RLS sea una comparación directa, sin joins.

-- ============ HABIT CREATOR ============
create table habits (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users on delete cascade,
  name           text not null,
  weekdays       smallint[],                                  -- [1,3,5] = lun/mié/vie (ISO 1-7). null = cualquier día
  times_per_day  smallint not null default 1 check (times_per_day > 0),
  times_per_week smallint check (times_per_week > 0),         -- meta semanal; null = derivada de weekdays
  archived       boolean not null default false,
  created_at     timestamptz not null default now()
);

create table habit_logs (
  habit_id uuid not null references habits on delete cascade,
  user_id  uuid not null default auth.uid() references auth.users on delete cascade,
  day      date not null,
  count    smallint not null default 1 check (count > 0),
  primary key (habit_id, day)                                 -- un registro por hábito por día; upsert incrementa count
);

-- ============ DAILY PLANNER ============
create table tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  day         date not null,
  title       text not null,
  done        boolean not null default false,
  is_reminder boolean not null default false,                 -- "recordatorio importante" vs tarea normal
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- ============ TIME BUDGETER ============
create table activities (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null default auth.uid() references auth.users on delete cascade,
  name           text not null,
  kind           text not null check (kind in ('grow','cut')),      -- fomentar / recortar
  budget_minutes int not null check (budget_minutes >= 0),          -- meta diaria: deseado si grow, límite si cut
  archived       boolean not null default false,
  created_at     timestamptz not null default now()
);

create table time_logs (
  activity_id uuid not null references activities on delete cascade,
  user_id     uuid not null default auth.uid() references auth.users on delete cascade,
  day         date not null,
  minutes     int not null check (minutes >= 0),
  primary key (activity_id, day)
);

-- ============ ÍNDICES ============
-- Las PKs ya cubren el acceso por entidad; estos cubren "todo lo del usuario en un rango de fechas".
create index habit_logs_user_day_idx on habit_logs (user_id, day);
create index time_logs_user_day_idx  on time_logs  (user_id, day);
create index tasks_user_day_idx      on tasks      (user_id, day);
-- FKs sin índice propio quedan cubiertas por la PK compuesta / se agregan si el planner las pide.
create index habits_user_idx     on habits     (user_id) where not archived;
create index activities_user_idx on activities (user_id) where not archived;

-- ============ RLS ============
-- Una política por tabla: cada quien ve y escribe solo lo suyo.
alter table habits     enable row level security;
alter table habit_logs enable row level security;
alter table tasks      enable row level security;
alter table activities enable row level security;
alter table time_logs  enable row level security;

create policy own on habits     for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy own on habit_logs for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy own on tasks      for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy own on activities for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy own on time_logs  for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
