-- Migration: create_ger_professor_diretor
-- Cria tabela de professores e diretores e ajusta RLS da escola

create table public.ger_professor_diretor (
    id                    uuid        primary key default uuid_generate_v4(),
    nome_completo         text        not null,
    matricula             text,
    numero_aulas_semanais integer     not null,
    email                 text,
    telefone              text,
    data_admissao         date,
    data_demissao         date,
    instituicao_id        uuid        not null references public.ger_instituicao(id) on delete restrict,
    diretor_escola_id     uuid        references public.ger_escolas_instituicao(id) on delete set null,
    created_at            timestamptz not null default now(),
    updated_at            timestamptz not null default now()
);

-- Indexação
create index ger_professor_diretor_instituicao_idx on public.ger_professor_diretor(instituicao_id);
create index ger_professor_diretor_email_idx on public.ger_professor_diretor(email);
create index ger_professor_diretor_diretor_escola_idx on public.ger_professor_diretor(diretor_escola_id);

-- Trigger de updated_at
create trigger ger_professor_diretor_updated_at
    before update on public.ger_professor_diretor
    for each row execute procedure public.handle_updated_at();

-- Habilitar RLS
alter table public.ger_professor_diretor enable row level security;

-- Políticas de Segurança (RLS)

-- 1. Qualquer usuário autenticado SÓ PODE LER professores da sua própria instituição
create policy "ger_professor_diretor: ver apenas da própria instituição"
    on public.ger_professor_diretor for select
    to authenticated
    using (
        instituicao_id = (
            select auth_profile.instituicao_id 
            from public.profiles auth_profile 
            where auth_profile.id = (select auth.uid())
        )
    );

-- 2. Apenas 'Admin' pode INSERIR na exata instituição a que pertence
create policy "ger_professor_diretor: admins podem inserir na sua instituição"
    on public.ger_professor_diretor for insert
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
create policy "ger_professor_diretor: admins podem atualizar na sua instituição"
    on public.ger_professor_diretor for update
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
create policy "ger_professor_diretor: admins podem deletar na sua instituição"
    on public.ger_professor_diretor for delete
    to authenticated
    using (
        instituicao_id = (
             select auth_profile.instituicao_id 
             from public.profiles auth_profile 
             where auth_profile.id = (select auth.uid()) 
               and auth_profile.role = 'Admin'
        )
    );

-- Atualizar política de Visualização da Escola para restringir o Diretor
drop policy if exists "escolas: ver apenas da própria instituição" on public.ger_escolas_instituicao;

create policy "escolas: ver apenas da própria instituição"
    on public.ger_escolas_instituicao for select
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = (select auth.uid())
            and profiles.instituicao_id = ger_escolas_instituicao.instituicao_id
            and (
                profiles.role = 'Admin'
                or profiles.role = 'Professor'
                or (
                    profiles.role = 'Diretor'
                    and ger_escolas_instituicao.id in (
                        select p.diretor_escola_id
                        from public.ger_professor_diretor p
                        where p.email = (select auth.jwt() ->> 'email')
                    )
                )
            )
        )
    );
