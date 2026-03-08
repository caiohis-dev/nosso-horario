-- Migration: create_ger_series
-- Cria a tabela de Séries, setando a deleção em cascata (caso a escola feche) e as restrições exclusivas (RLS) para Admins.

create table public.ger_series (
    id              uuid primary key default uuid_generate_v4(),
    nome            text not null,
    instituicao_id  uuid not null references public.ger_instituicao(id) on delete cascade,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

-- Trigger para atualizar `updated_at` (utilizando função genérica do Supabase baseada em moddatetime ou padronizada)
create trigger update_ger_series_updated_at
    before update on public.ger_series
    for each row execute procedure public.handle_updated_at();

-- Índices de Performance
create index idx_ger_series_instituicao_id on public.ger_series(instituicao_id);

-- Row Level Security (RLS)
alter table public.ger_series enable row level security;

-- SELECT (Leitura): Todos os membros da instituição podem visualizar as séries cadastradas.
create policy "Séries: Membros da instituição podem visualizar"
    on public.ger_series for select
    to authenticated
    using (
        instituicao_id = (
            select instituicao_id from public.profiles 
            where id = (select auth.uid())
        )
    );

-- INSERT/UPDATE/DELETE (Mutação): Apenas administradores podem gerir a tabela de Séries
create policy "Séries: Apenas Admins podem inserir"
    on public.ger_series for insert
    to authenticated
    with check (
        instituicao_id = (
            select instituicao_id from public.profiles 
            where id = (select auth.uid()) and role = 'Admin'
        )
    );

create policy "Séries: Apenas Admins podem atualizar"
    on public.ger_series for update
    to authenticated
    using (
        instituicao_id = (
            select instituicao_id from public.profiles 
            where id = (select auth.uid()) and role = 'Admin'
        )
    )
    with check (
        instituicao_id = (
            select instituicao_id from public.profiles 
            where id = (select auth.uid()) and role = 'Admin'
        )
    );

create policy "Séries: Apenas Admins podem deletar"
    on public.ger_series for delete
    to authenticated
    using (
        instituicao_id = (
            select instituicao_id from public.profiles 
            where id = (select auth.uid()) and role = 'Admin'
        )
    );
