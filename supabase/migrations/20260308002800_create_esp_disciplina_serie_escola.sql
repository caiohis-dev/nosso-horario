-- Criando a tabela de disciplinas por série por escola por ano (esp_disciplina_serie_escola)
-- Registra quais disciplinas são ofertadas para cada série em cada escola em determinado ano letivo,
-- e quantas aulas semanais essa disciplina tem naquela combinação.
CREATE TABLE IF NOT EXISTS public.esp_disciplina_serie_escola (
    id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    instituicao_id UUID NOT NULL REFERENCES public.ger_instituicao(id) ON DELETE CASCADE,
    escola_id      UUID NOT NULL REFERENCES public.ger_escolas_instituicao(id) ON DELETE CASCADE,
    serie_id       UUID NOT NULL REFERENCES public.ger_series(id) ON DELETE RESTRICT,
    disciplina_id  UUID NOT NULL REFERENCES public.ger_disciplinas(id) ON DELETE RESTRICT,
    ano_letivo     TEXT NOT NULL,
    num_aulas      INTEGER NOT NULL CHECK (num_aulas > 0),
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    -- Cada combinação escola+série+disciplina+ano é única
    UNIQUE(escola_id, serie_id, disciplina_id, ano_letivo)
);

-- Ativando RLS
ALTER TABLE public.esp_disciplina_serie_escola ENABLE ROW LEVEL SECURITY;

-- Policy de SELECT — todos autenticados da mesma instituição
CREATE POLICY "Instituição pode ver disciplinas das séries das escolas"
    ON public.esp_disciplina_serie_escola
    FOR SELECT
    USING (instituicao_id = (SELECT instituicao_id FROM public.profiles WHERE id = (select auth.uid())));

-- Policy de INSERT — Admin e Diretor
CREATE POLICY "Admin e Diretor podem inserir disciplinas nas séries das escolas"
    ON public.esp_disciplina_serie_escola
    FOR INSERT
    WITH CHECK (
        instituicao_id = (SELECT instituicao_id FROM public.profiles WHERE id = (select auth.uid()))
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid()) AND role IN ('Admin', 'Diretor')
        )
    );

-- Policy de UPDATE — Admin e Diretor
CREATE POLICY "Admin e Diretor podem atualizar disciplinas nas séries das escolas"
    ON public.esp_disciplina_serie_escola
    FOR UPDATE
    USING (
        instituicao_id = (SELECT instituicao_id FROM public.profiles WHERE id = (select auth.uid()))
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid()) AND role IN ('Admin', 'Diretor')
        )
    )
    WITH CHECK (
        instituicao_id = (SELECT instituicao_id FROM public.profiles WHERE id = (select auth.uid()))
    );

-- Policy de DELETE — Admin e Diretor
CREATE POLICY "Admin e Diretor podem deletar disciplinas nas séries das escolas"
    ON public.esp_disciplina_serie_escola
    FOR DELETE
    USING (
        instituicao_id = (SELECT instituicao_id FROM public.profiles WHERE id = (select auth.uid()))
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = (select auth.uid()) AND role IN ('Admin', 'Diretor')
        )
    );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_esp_disc_serie_escola_instituicao ON public.esp_disciplina_serie_escola(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_esp_disc_serie_escola_escola      ON public.esp_disciplina_serie_escola(escola_id);
CREATE INDEX IF NOT EXISTS idx_esp_disc_serie_escola_serie        ON public.esp_disciplina_serie_escola(serie_id);
CREATE INDEX IF NOT EXISTS idx_esp_disc_serie_escola_disciplina   ON public.esp_disciplina_serie_escola(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_esp_disc_serie_escola_ano          ON public.esp_disciplina_serie_escola(ano_letivo);
