-- Migration: create_password_reset_tokens
-- Tokens de recuperação de senha (gerados e validados via Edge Functions + Resend)
-- Acesso apenas por service_role (Edge Functions). Nenhuma policy de usuário.

create table public.password_reset_tokens (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users (id) on delete cascade,
  token_hash  text        not null,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- RLS habilitado — sem policies abertas para usuários.
-- service_role bypassa RLS e é o único que acessa esta tabela.
alter table public.password_reset_tokens enable row level security;

-- Índices
create index password_reset_tokens_user_id_idx    on public.password_reset_tokens (user_id);
create index password_reset_tokens_token_hash_idx  on public.password_reset_tokens (token_hash);
create index password_reset_tokens_expires_at_idx  on public.password_reset_tokens (expires_at);
