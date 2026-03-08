-- Migration: create_ger_disciplinas
-- Cria a tabela de disciplinas com RLS atrelado apenas aos Admins da instituição

create table public.ger_disciplinas (
    id             uuid        primary key default uuid_generate_v4(),
    nome           text        not null,
    instituicao_id uuid        not null references public.ger_instituicao(id) on delete restrict,
    created_at     timestamptz not null default now(),
    updated_at     timestamptz not null default now()
);

-- Indexação
create index ger_disciplinas_instituicao_idx on public.ger_disciplinas(instituicao_id);
create index ger_disciplinas_nome_idx on public.ger_disciplinas(nome);

-- Trigger de updated_at
create trigger ger_disciplinas_updated_at
    before update on public.ger_disciplinas
    for each row execute procedure public.handle_updated_at();

-- Habilitar RLS
alter table public.ger_disciplinas enable row level security;

-- Políticas de Segurança (RLS)

-- 1. Qualquer usuário autenticado SÓ PODE LER disciplinas da sua própria instituição
create policy "ger_disciplinas: ver apenas da própria instituição"
    on public.ger_disciplinas for select
    to authenticated
    using (
        instituicao_id = (
            select auth_profile.instituicao_id 
            from public.profiles auth_profile 
            where auth_profile.id = (select auth.uid())
        )
    );

-- 2. Apenas 'Admin' pode INSERIR na exata instituição a que pertence
create policy "ger_disciplinas: admins podem inserir na sua instituição"
    on public.ger_disciplinas for insert
    to authenticated
    with check (
        instituicao_id = (
             select auth_profile.instituicao_id 
             from public.profiles auth_profile 
             where auth_profile.id = (select auth.uid()) 
               and auth_profile.role = 'Admin'
        )
    );

-- 3. Apenas 'Admin' pode ATUALIZAR na sua instituição
create policy "ger_disciplinas: admins podem atualizar na sua instituição"
    on public.ger_disciplinas for update
    to authenticated
    using (
        instituicao_id = (
             select auth_profile.instituicao_id 
             from public.profiles auth_profile 
             where auth_profile.id = (select auth.uid()) 
               and auth_profile.role = 'Admin'
        )
    );

-- 4. Apenas 'Admin' pode DELETAR na sua instituição
create policy "ger_disciplinas: admins podem deletar na sua instituição"
    on public.ger_disciplinas for delete
    to authenticated
    using (
        instituicao_id = (
             select auth_profile.instituicao_id 
             from public.profiles auth_profile 
             where auth_profile.id = (select auth.uid()) 
               and auth_profile.role = 'Admin'
        )
    );
