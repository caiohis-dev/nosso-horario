-- Migration: change_default_role_to_admin

-- Alterar o valor padrão (Default) da coluna "role" na tabela "profiles" de "Professor" para "Admin"
-- Para que usuários que se registrarem via Auth cheguem como Administradores e entrem no fluxo de Onboarding
alter table public.profiles alter column role set default 'Admin'::public.user_role;
