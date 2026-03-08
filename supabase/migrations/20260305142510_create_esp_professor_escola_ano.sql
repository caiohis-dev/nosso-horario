-- Migration: create_esp_professor_escola_ano
-- Descrição: Cria a tabela relacional de lotação dos professores em escolas por ano letivo

CREATE TABLE public.esp_professor_escola_ano (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instituicao_id UUID NOT NULL REFERENCES public.ger_instituicao(id) ON DELETE CASCADE,
    professor_id UUID NOT NULL REFERENCES public.ger_professor_diretor(id) ON DELETE CASCADE,
    escola_id UUID NOT NULL REFERENCES public.ger_escolas_instituicao(id) ON DELETE CASCADE,
    ano_letivo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Prevenir vínculos duplicados para o mesmo prof na mesma escola no mesmo ano
    UNIQUE(professor_id, escola_id, ano_letivo)
);

-- Indexação para performance em queries comuns
CREATE INDEX idx_esp_professor_escola_ano_inst ON public.esp_professor_escola_ano(instituicao_id);
CREATE INDEX idx_esp_professor_escola_ano_prof ON public.esp_professor_escola_ano(professor_id);
CREATE INDEX idx_esp_professor_escola_ano_esc ON public.esp_professor_escola_ano(escola_id);
CREATE INDEX idx_esp_professor_escola_ano_ano ON public.esp_professor_escola_ano(ano_letivo);

-- Trigger de Updated At
CREATE TRIGGER handle_updated_at_esp_professor_escola_ano
    BEFORE UPDATE ON public.esp_professor_escola_ano
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime (updated_at);

-- RLS (Row Level Security)
ALTER TABLE public.esp_professor_escola_ano ENABLE ROW LEVEL SECURITY;

-- Policy: Admin tem controle total sobre registros da sua instituição
CREATE POLICY "Admin tem controle total em esp_professor_escola_ano"
    ON public.esp_professor_escola_ano
    FOR ALL
    USING (
        instituicao_id = (
            SELECT instituicao_id FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'Admin'
        )
    );

-- Policy: Diretores podem visualizar lotações na instituição
CREATE POLICY "Diretores podem visualizar em esp_professor_escola_ano"
    ON public.esp_professor_escola_ano
    FOR SELECT
    USING (
        instituicao_id = (
            SELECT instituicao_id FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'Diretor'
        )
    );

-- Policy: Professores podem visualizar as próprias lotações
CREATE POLICY "Professores podem visualizar próprias lotações"
    ON public.esp_professor_escola_ano
    FOR SELECT
    USING (
        professor_id IN (
            SELECT id FROM public.ger_professor_diretor 
            WHERE email = (select auth.jwt() ->> 'email')
        )
    );
