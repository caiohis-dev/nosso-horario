-- Migration: Add theme preference to profiles
-- Adiciona a coluna theme (light, dark, system) com preenchimento padrão 'system'.

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'system' NOT NULL;

-- Garante que apenas os valores estritos sejam aceitos
ALTER TABLE public.profiles
ADD CONSTRAINT check_theme_values 
CHECK (theme IN ('light', 'dark', 'system'));
