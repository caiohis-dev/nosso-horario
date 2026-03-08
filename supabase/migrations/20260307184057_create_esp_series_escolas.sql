-- Criando a tabela de relação (esp_series_escolas)
CREATE TABLE IF NOT EXISTS public.esp_series_escolas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    instituicao_id UUID NOT NULL REFERENCES public.ger_instituicao(id) ON DELETE CASCADE,
    escola_id UUID NOT NULL REFERENCES public.ger_escolas_instituicao(id) ON DELETE CASCADE,
    serie_id UUID NOT NULL REFERENCES public.ger_series(id) ON DELETE RESTRICT,
    ano TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(escola_id, serie_id, ano)
);

-- Ativando RLS
ALTER TABLE public.esp_series_escolas ENABLE ROW LEVEL SECURITY;

-- Policies de SELECT
-- Todos autenticados na mesma instituicao_id podem ver
CREATE POLICY "Instituição pode ver suas séries nas escolas"
    ON public.esp_series_escolas
    FOR SELECT
    USING (instituicao_id = (SELECT instituicao_id FROM public.profiles WHERE id = (select auth.uid())));

-- Policies de INSERT
-- Apenas Admin e Diretor da mesma instituição
CREATE POLICY "Admin e Diretor podem inserir séries das escolas"
    ON public.esp_series_escolas
    FOR INSERT
    WITH CHECK (
        instituicao_id = (SELECT instituicao_id FROM public.profiles WHERE id = (select auth.uid()))
        AND (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = (select auth.uid()) AND role IN ('Admin', 'Diretor')
            )
        )
    );

-- Policies de UPDATE
-- Apenas Admin e Diretor da mesma instituição
CREATE POLICY "Admin e Diretor podem atualizar séries das escolas"
    ON public.esp_series_escolas
    FOR UPDATE
    USING (
        instituicao_id = (SELECT instituicao_id FROM public.profiles WHERE id = (select auth.uid()))
        AND (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = (select auth.uid()) AND role IN ('Admin', 'Diretor')
            )
        )
    )
    WITH CHECK (
        instituicao_id = (SELECT instituicao_id FROM public.profiles WHERE id = (select auth.uid()))
    );

-- Policies de DELETE
-- Apenas Admin e Diretor da mesma instituição
CREATE POLICY "Admin e Diretor podem deletar séries das escolas"
    ON public.esp_series_escolas
    FOR DELETE
    USING (
        instituicao_id = (SELECT instituicao_id FROM public.profiles WHERE id = (select auth.uid()))
        AND (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = (select auth.uid()) AND role IN ('Admin', 'Diretor')
            )
        )
    );

-- Trigger para definir o campo 'updated_at' (se utilizável, por enquanto usando moddatetime ou apenas inserted at pro MVP)
-- indices para performance
CREATE INDEX IF NOT EXISTS idx_esp_series_escolas_instituicao ON public.esp_series_escolas(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_esp_series_escolas_escola ON public.esp_series_escolas(escola_id);
CREATE INDEX IF NOT EXISTS idx_esp_series_escolas_serie ON public.esp_series_escolas(serie_id);
