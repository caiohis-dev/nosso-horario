import { supabase } from '@/config/supabase'

export async function createInstitution(nome: string) {
    // 1. Inserir a nova instituição
    const { data: instituicao, error: insertError } = await supabase
        .from('ger_instituicao')
        .insert({ nome })
        .select()
        .single()

    if (insertError) {
        throw new Error(insertError.message || 'Falha ao criar instituição.')
    }

    // 2. O usuário logado acabou de criar, logo atualizaremos o profile dele
    // Pegando o usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        throw new Error('Usuário autenticado não encontrado.')
    }

    // 3. Atualizar o profile com a nova instituicao_id
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ instituicao_id: instituicao.id })
        .eq('id', user.id)

    if (updateError) {
        throw new Error(updateError.message || 'Falha ao vincular usuário à instituição.')
    }

    return instituicao
}

export async function createSchool(nome: string, instituicaoId: string) {
    const { data: escola, error: insertError } = await supabase
        .from('ger_escolas_instituicao')
        .insert({
            nome,
            instituicao_id: instituicaoId,
        })
        .select()
        .single()

    if (insertError) {
        if (insertError.code === '23505') {
            throw new Error('Você já tem uma escola cadastrada com este nome nesta intituição.')
        }
        throw new Error(insertError.message || 'Falha ao criar escola.')
    }

    return escola
}
