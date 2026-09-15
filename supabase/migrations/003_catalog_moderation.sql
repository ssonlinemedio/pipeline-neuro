-- Identidad y moderación del catálogo público.
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    role text not null default 'user' check (role in ('user', 'admin')),
    created_at timestamptz not null default now()
);

create table if not exists public.catalog_submissions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    content_key text not null,
    title text not null,
    idioma text not null,
    nivel text not null,
    content jsonb not null,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    reviewer_note text,
    reviewed_at timestamptz,
    created_at timestamptz not null default now(),
    unique (user_id, content_key)
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;

alter table public.profiles enable row level security;
alter table public.catalog_submissions enable row level security;

create policy "Users read their own profile" on public.profiles
    for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "Users create their own submission" on public.catalog_submissions
    for insert to authenticated with check (user_id = auth.uid());
create policy "Users read their own submissions" on public.catalog_submissions
    for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "Admins review submissions" on public.catalog_submissions
    for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins publish catalog" on public.public_catalog
    for insert to authenticated with check (public.is_admin());
create policy "Admins update catalog" on public.public_catalog
    for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins hide catalog" on public.public_catalog
    for delete to authenticated using (public.is_admin());

create index if not exists catalog_submissions_status_idx
    on public.catalog_submissions (status, created_at);

-- Primer administrador, ejecutar manualmente una vez creada la cuenta:
-- insert into public.profiles (id, role)
-- select id, 'admin' from auth.users where email = 'TU_CORREO_ADMIN'
-- on conflict (id) do update set role = 'admin';
