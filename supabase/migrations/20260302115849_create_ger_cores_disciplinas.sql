-- Migration: create_ger_cores_disciplinas
-- Cria a tabela de paletas predefinidas e adiciona a referência em ger_disciplinas

create table public.ger_cores_disciplinas (
    id          uuid primary key default uuid_generate_v4(),
    cor_bg      text not null,
    cor_text    text not null,
    created_at  timestamptz not null default now()
);

-- Inserindo as 20 opções de paletas Premium harmônicas
insert into public.ger_cores_disciplinas (cor_bg, cor_text) values
('#fef3c7', '#d97706'), -- Amber/Yellow
('#fef08a', '#854d0e'), -- Yellow Darker
('#ffedd5', '#ea580c'), -- Orange
('#ffedd5', '#c2410c'), -- Deep Orange
('#fee2e2', '#ef4444'), -- Red
('#fce7f3', '#db2777'), -- Pink
('#fbcfe8', '#be185d'), -- Deep Pink
('#f3e8ff', '#9333ea'), -- Purple
('#e0e7ff', '#4f46e5'), -- Indigo
('#dbeafe', '#2563eb'), -- Blue
('#bfdbfe', '#1d4ed8'), -- Dark Blue
('#e0f2fe', '#0284c7'), -- Light Blue/Sky
('#ccfbf1', '#0d9488'), -- Teal
('#d1fae5', '#059669'), -- Emerald
('#bbf7d0', '#16a34a'), -- Green
('#ecfccb', '#65a30d'), -- Lime
('#f4f4f5', '#52525b'), -- Zinc/Gray
('#e2e8f0', '#475569'), -- Slate
('#ffebf0', '#e11d48'), -- Rose
('#fae8ff', '#c026d3'); -- Fuchsia

-- Habilitar RLS e Permissão de Leitura Global Autenticada
alter table public.ger_cores_disciplinas enable row level security;

create policy "ger_cores_disciplinas: todos os autenticados podem ler"
    on public.ger_cores_disciplinas for select
    to authenticated
    using (true);

-- Adicionando cor_id na tabela ger_disciplinas
alter table public.ger_disciplinas 
    add column cor_id uuid references public.ger_cores_disciplinas(id) on delete set null;

-- Populando disciplinas antigas que não tinham cor_id (opcional, p/ consistencia)
update public.ger_disciplinas set cor_id = (select id from public.ger_cores_disciplinas order by random() limit 1) where cor_id is null;

-- Garantindo que novas exijam a cor_id
alter table public.ger_disciplinas alter column cor_id set not null;

-- Recriar a View ou apenas notificar que o frontend precisará do Join (No caso o front passará a buscar com .select('*, cor:ger_cores_disciplinas(*)') )
