-- Migration: create_email_verifications
-- Tokens de confirmação de email (gerados e validados via Edge Functions + Resend)
-- Acesso apenas por service_role (Edge Functions). Nenhuma policy de usuário.

create table public.email_verifications (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users (id) on delete cascade,
  token_hash  text        not null,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

-- RLS habilitado — sem policies abertas para usuários.
-- service_role bypassa RLS e é o único que acessa esta tabela.
alter table public.email_verifications enable row level security;

-- Índices
create index email_verifications_user_id_idx  on public.email_verifications (user_id);
create index email_verifications_token_hash_idx on public.email_verifications (token_hash);
create index email_verifications_expires_at_idx on public.email_verifications (expires_at);
