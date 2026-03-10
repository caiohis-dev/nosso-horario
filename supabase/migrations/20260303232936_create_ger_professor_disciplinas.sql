-- Create ger_professor_disciplinas table
CREATE TABLE public.ger_professor_disciplinas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_id UUID NOT NULL REFERENCES public.ger_professor_diretor(id) ON DELETE RESTRICT,
    disciplina_id UUID NOT NULL REFERENCES public.ger_disciplinas(id) ON DELETE RESTRICT,
    instituicao_id UUID NOT NULL REFERENCES public.ger_instituicao(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(professor_id, disciplina_id, instituicao_id)
);

-- Set up Row Level Security
ALTER TABLE public.ger_professor_disciplinas ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- Admins can do everything
CREATE POLICY "Admins can view professor_disciplinas" ON public.ger_professor_disciplinas
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'Admin' 
            AND profiles.instituicao_id = ger_professor_disciplinas.instituicao_id
        )
    );

CREATE POLICY "Admins can insert professor_disciplinas" ON public.ger_professor_disciplinas
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'Admin' 
            AND profiles.instituicao_id = instituicao_id
        )
    );

CREATE POLICY "Admins can update professor_disciplinas" ON public.ger_professor_disciplinas
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'Admin' 
            AND profiles.instituicao_id = ger_professor_disciplinas.instituicao_id
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'Admin' 
            AND profiles.instituicao_id = instituicao_id
        )
    );

CREATE POLICY "Admins can delete professor_disciplinas" ON public.ger_professor_disciplinas
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'Admin' 
            AND profiles.instituicao_id = ger_professor_disciplinas.instituicao_id
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER set_public_ger_professor_disciplinas_updated_at
    BEFORE UPDATE ON public.ger_professor_disciplinas
    FOR EACH ROW
    EXECUTE FUNCTION moddatetime(updated_at);

-- Comments for postgREST
COMMENT ON TABLE public.ger_professor_disciplinas IS 'Vincula quais disciplinas cada professor pode lecionar.';
COMMENT ON COLUMN public.ger_professor_disciplinas.professor_id IS 'Referência ao profissional no registro ger_professor_diretor';
COMMENT ON COLUMN public.ger_professor_disciplinas.disciplina_id IS 'Referência à disciplina em ger_disciplinas';
COMMENT ON COLUMN public.ger_professor_disciplinas.instituicao_id IS 'Instituição (tenant) para manter o isolamento dos dados';
