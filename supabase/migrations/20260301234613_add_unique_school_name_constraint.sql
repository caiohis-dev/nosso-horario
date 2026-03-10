-- Migration: add_unique_school_name_constraint
-- Adiciona a constraint para que o nome de uma escola seja único DENTRO de uma mesma instituição.

alter table public.ger_escolas_instituicao 
add constraint unique_school_name_per_institution unique (nome, instituicao_id);
