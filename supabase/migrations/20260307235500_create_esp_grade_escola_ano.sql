-- Criando a tabela de grade horária estrutural por escola, série e ano (esp_grade_escola_ano)
-- Define o "esqueleto" da semana: quantas aulas por dia, em qual turno, para qual série/escola/ano.
CREATE TABLE IF NOT EXISTS public.esp_grade_escola_ano (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    instituicao_id UUID NOT NULL REFERENCES public.ger_instituicao(id) ON DELETE CASCADE,
    escola_id     UUID NOT NULL REFERENCES public.ger_escolas_instituicao(id) ON DELETE CASCADE,
    serie_id      UUID NOT NULL REFERENCES public.ger_series(id) ON DELETE RESTRICT,
    ano_letivo    TEXT NOT NULL,
    dia_semana    TEXT NOT NULL CHECK (dia_semana IN ('seg', 'ter', 'qua', 'qui', 'sex', 'sab')),
    turno         TEXT NOT NULL CHECK (turno IN ('matutino', 'vespertino', 'noturno')),
    num_aulas_dia INTEGER NOT NULL CHECK (num_aulas_dia > 0),
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Cada combinação escola+série+ano+dia+turno é única (evita linhas duplicadas para o mesmo slot)
    UNIQUE(escola_id, serie_id, ano_letivo, dia_semana, turno)
);

-- Ativando RLS
ALTER TABLE public.esp_grade_escola_ano ENABLE ROW LEVEL SECURITY;

-- Policy de SELECT
-- Todos os usuários autenticados da mesma instituição podem visualizar
CREATE POLICY "Instituição pode ver a grade das suas escolas"
    ON public.esp_grade_escola_ano
    FOR SELECT
    USING (instituicao_id = (SELECT instituicao_id FROM public.profiles WHERE id = (select auth.uid())));

-- Policy de INSERT — apenas Admin
CREATE POLICY "Admin pode inserir grades de escola"
    ON public.esp_grade_escola_ano
    FOR INSERT
    WITH CHECK (
        instituicao_id = (SELECT instituicao_id FROM public.profiles WHERE id = (select auth.uid()))
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid()) AND role = 'Admin'
        )
    );

-- Policy de UPDATE — apenas Admin
CREATE POLICY "Admin pode atualizar grades de escola"
    ON public.esp_grade_escola_ano
    FOR UPDATE
    USING (
        instituicao_id = (SELECT instituicao_id FROM public.profiles WHERE id = (select auth.uid()))
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid()) AND role = 'Admin'
        )
    )
    WITH CHECK (
        instituicao_id = (SELECT instituicao_id FROM public.profiles WHERE id = (select auth.uid()))
    );

-- Policy de DELETE — apenas Admin
CREATE POLICY "Admin pode deletar grades de escola"
    ON public.esp_grade_escola_ano
    FOR DELETE
    USING (
        instituicao_id = (SELECT instituicao_id FROM public.profiles WHERE id = (select auth.uid()))
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid()) AND role = 'Admin'
        )
    );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_esp_grade_escola_ano_instituicao ON public.esp_grade_escola_ano(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_esp_grade_escola_ano_escola     ON public.esp_grade_escola_ano(escola_id);
CREATE INDEX IF NOT EXISTS idx_esp_grade_escola_ano_serie      ON public.esp_grade_escola_ano(serie_id);
CREATE INDEX IF NOT EXISTS idx_esp_grade_escola_ano_ano        ON public.esp_grade_escola_ano(ano_letivo);
