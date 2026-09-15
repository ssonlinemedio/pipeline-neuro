-- Pipeline Neuro: estado opcional de usuario.
-- El contenido predefinido permanece en data/ e IndexedDB.

create table if not exists public.user_stories (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    local_key text not null,
    title text not null,
    content jsonb not null,
    content_version integer not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    version bigint not null default 1,
    unique (user_id, local_key)
);

create table if not exists public.learning_states (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    content_key text not null,
    content_version integer not null default 1,
    state jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    version bigint not null default 1,
    unique (user_id, content_key)
);

create table if not exists public.mode_states (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    mode text not null check (mode in ('mis_temas', 'elipse', 'ondas_cruzadas')),
    content_key text not null,
    state jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    version bigint not null default 1,
    unique (user_id, mode, content_key)
);

create index if not exists user_stories_user_updated_idx on public.user_stories (user_id, updated_at);
create index if not exists learning_states_user_updated_idx on public.learning_states (user_id, updated_at);
create index if not exists mode_states_user_updated_idx on public.mode_states (user_id, updated_at);

alter table public.user_stories enable row level security;
alter table public.learning_states enable row level security;
alter table public.mode_states enable row level security;

create policy "Users own their stories" on public.user_stories for all to authenticated
    using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their learning states" on public.learning_states for all to authenticated
    using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users own their mode states" on public.mode_states for all to authenticated
    using (auth.uid() = user_id) with check (auth.uid() = user_id);
