-- Migration: create_instituicao_and_update_profiles
-- Cria tabela de instituição e adiciona role/instituição aos perfis

-- 1. Criar tipo ENUM para níveis de acesso
create type public.user_role as enum ('Admin', 'Diretor', 'Professor');

-- 2. Criar tabela Instituição (ger_instituicao)
create table public.ger_instituicao (
    id         uuid        primary key default uuid_generate_v4(),
    nome       text        not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Trigger para updated_at da Instituição
create trigger ger_instituicao_updated_at
    before update on public.ger_instituicao
    for each row execute procedure public.handle_updated_at();

-- RLS Instituição
alter table public.ger_instituicao enable row level security;

-- 3. Alterar tabela Profiles (Adicionar Role e Vinculo Institucional)
alter table public.profiles 
    add column role public.user_role not null default 'Professor',
    add column instituicao_id uuid references public.ger_instituicao(id) on delete restrict;

-- 4. Definir Políticas de Segurança (Após as colunas existirem)

-- Admin: Inserir, Atualizar, Deletar
-- Todos autenticados: Visualizar (necessário para listar opções em combos, validar acessos, etc)
create policy "ger_instituicao: autenticados podem ver"
    on public.ger_instituicao for select
    to authenticated
    using (true);

create policy "ger_instituicao: admins podem inserir"
    on public.ger_instituicao for insert
    to authenticated
    with check (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'Admin'
        )
    );

create policy "ger_instituicao: admins podem atualizar"
    on public.ger_instituicao for update
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'Admin'
        )
    );

create policy "ger_instituicao: admins podem deletar"
    on public.ger_instituicao for delete
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and profiles.role = 'Admin'
        )
    );

-- Atualizar RLS de Profiles (Adicionando permissões de Admin)
-- Nota: A policy "profiles: authenticated can select" já existe (ver 20260225005930_create_profiles.sql)
-- Nota: A policy "profiles: owner can update" já existe.
-- Vamos adicionar uma política extra para que Admins possam atualizar qualquer perfil:

create policy "profiles: admins podem atualizar todos"
    on public.profiles for update
    to authenticated
    using (
        exists (
            select 1 from public.profiles admin_check
            where admin_check.id = auth.uid()
            and admin_check.role = 'Admin'
        )
    );
