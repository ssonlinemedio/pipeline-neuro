-- Pipeline Neuro: temas propios/importados sincronizables.
create table if not exists public.user_topics (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    local_key text not null,
    name text not null,
    content jsonb not null default '{}'::jsonb,
    version bigint not null default 1,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deleted_at timestamptz,
    unique (user_id, local_key)
);

alter table public.user_topics enable row level security;

drop policy if exists "user_topics_own_select" on public.user_topics;
create policy "user_topics_own_select" on public.user_topics
    for select to authenticated using (user_id = auth.uid());

drop policy if exists "user_topics_own_insert" on public.user_topics;
create policy "user_topics_own_insert" on public.user_topics
    for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "user_topics_own_update" on public.user_topics;
create policy "user_topics_own_update" on public.user_topics
    for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

grant select, insert, update, delete on public.user_topics to authenticated;
