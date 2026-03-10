-- Migration: create_profiles
-- Tabela pública de perfis, extendendo auth.users

create table public.profiles (
  id          uuid        primary key references auth.users (id) on delete cascade,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;

-- Qualquer usuário autenticado pode ler perfis
create policy "profiles: authenticated can select"
  on public.profiles for select
  to authenticated
  using (true);

-- Apenas o dono pode atualizar o próprio perfil
create policy "profiles: owner can update"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Sem DELETE direto — cascade cuida disso quando auth.user é removido

-- Índice para busca por updated_at (listagens ordenadas)
create index profiles_updated_at_idx on public.profiles (updated_at desc);

-- Trigger: atualiza updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Trigger: cria perfil automaticamente após signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
