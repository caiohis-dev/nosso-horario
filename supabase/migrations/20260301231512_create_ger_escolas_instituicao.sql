-- Migration: create_ger_escolas_instituicao
-- Cria tabela de Escolas atreladas à Instituição com RLS por Tenant

create table public.ger_escolas_instituicao (
    id             uuid        primary key default uuid_generate_v4(),
    nome           text        not null,
    instituicao_id uuid        not null references public.ger_instituicao(id) on delete restrict,
    created_at     timestamptz not null default now(),
    updated_at     timestamptz not null default now()
);

-- Indexação para o "Tenant" (otimiza consultas do RLS)
create index ger_escolas_instituicao_instituicao_idx on public.ger_escolas_instituicao(instituicao_id);

-- Trigger de updated_at
create trigger ger_escolas_instituicao_updated_at
    before update on public.ger_escolas_instituicao
    for each row execute procedure public.handle_updated_at();

-- Habilitar RLS
alter table public.ger_escolas_instituicao enable row level security;

-- Políticas de Segurança (RLS)

-- 1. Qualquer usuário autenticado SÓ PODE LER escolas da sua própria instituição
create policy "escolas: ver apenas da própria instituição"
    on public.ger_escolas_instituicao for select
    to authenticated
    using (
        instituicao_id = (
            select auth_profile.instituicao_id 
            from public.profiles auth_profile 
            where auth_profile.id = auth.uid()
        )
    );

-- 2. Apenas 'Admin' pode INSERIR, e SOMENTE na exata instituição a que pertence
create policy "escolas: admins podem inserir na sua instituição"
    on public.ger_escolas_instituicao for insert
    to authenticated
    with check (
        instituicao_id = (
             select auth_profile.instituicao_id 
             from public.profiles auth_profile 
             where auth_profile.id = auth.uid() 
               and auth_profile.role = 'Admin'
        )
    );

-- 3. Apenas 'Admin' pode ATUALIZAR escolas da sua instituição
create policy "escolas: admins podem atualizar na sua instituição"
    on public.ger_escolas_instituicao for update
    to authenticated
    using (
        instituicao_id = (
             select auth_profile.instituicao_id 
             from public.profiles auth_profile 
             where auth_profile.id = auth.uid() 
               and auth_profile.role = 'Admin'
        )
    );

-- 4. Apenas 'Admin' pode DELETAR escolas da sua instituição
create policy "escolas: admins podem deletar na sua instituição"
    on public.ger_escolas_instituicao for delete
    to authenticated
    using (
        instituicao_id = (
             select auth_profile.instituicao_id 
             from public.profiles auth_profile 
             where auth_profile.id = auth.uid() 
               and auth_profile.role = 'Admin'
        )
    );
