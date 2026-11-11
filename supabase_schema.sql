-- =========================================================================
-- ESQUEMA SQL PARA O SUPABASE (CifraViva)
-- Execute este script no SQL Editor do seu projeto Supabase para criar as tabelas
-- =========================================================================

-- 1. Tabela de Músicas e Cifras
create table if not exists public.songs (
    id text primary key,
    title text not null,
    artist text,
    original_key text default 'G',
    current_key text default 'G',
    bpm integer default 100,
    time_signature text default '4/4',
    chordpro_content text,
    tags text[],
    status text default 'pronto',
    type text default 'repertorio',
    workspace_id text default 'ws-ss-clarinetes',
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabela de Repertórios / Setlists
create table if not exists public.setlists (
    id text primary key,
    name text not null,
    date text,
    location text,
    notes text,
    items jsonb default '[]'::jsonb,
    workspace_id text default 'ws-ss-clarinetes',
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Habilitar Row Level Security (RLS) opcional (ou desativar para testes simples)
alter table public.songs enable row level security;
alter table public.setlists enable row level security;

-- Políticas de acesso público para demonstração/uso sem fricção
create policy "Permitir leitura pública de songs" on public.songs for select using (true);
create policy "Permitir inserção/atualização pública de songs" on public.songs for insert with check (true);
create policy "Permitir atualização pública de songs" on public.songs for update using (true);

create policy "Permitir leitura pública de setlists" on public.setlists for select using (true);
create policy "Permitir inserção/atualização pública de setlists" on public.setlists for insert with check (true);
create policy "Permitir atualização pública de setlists" on public.setlists for update using (true);
