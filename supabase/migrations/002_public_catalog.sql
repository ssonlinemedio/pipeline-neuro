-- Catálogo público: lectura para descubrir/descargar; publicación administrativa.
create table if not exists public.public_catalog (
    id uuid primary key default gen_random_uuid(),
    content_key text not null unique,
    idioma text not null,
    nivel text not null,
    title text not null,
    content jsonb not null,
    content_version integer not null default 1,
    published_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    status text not null default 'published' check (status in ('published', 'hidden'))
);

create index if not exists public_catalog_language_level_idx
    on public.public_catalog (idioma, nivel, updated_at);

alter table public.public_catalog enable row level security;
create policy "Anyone can read published catalog"
    on public.public_catalog for select to anon, authenticated
    using (status = 'published');
