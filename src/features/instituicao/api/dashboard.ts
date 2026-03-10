import { supabase } from '@/config/supabase'
import type { Database } from '@/types/database'

type Instituicao = Database['public']['Tables']['ger_instituicao']['Row']
type Escola = Database['public']['Tables']['ger_escolas_instituicao']['Row']

export async function getDashboardData(instituicaoId: string) {
    // Busca os dados da Instituição
    const { data: instituicao, error: instError } = await supabase
        .from('ger_instituicao')
        .select('*')
        .eq('id', instituicaoId)
        .single()

    if (instError) throw new Error(instError.message)

    // Busca todas as escolas atreladas (já ordenadas alfabeticamente)
    // RLS garantirá que apenas as escolas desse `instituicao_id` retornarão.
    const { data: escolas, error: escError } = await supabase
        .from('ger_escolas_instituicao')
        .select('*')
        .eq('instituicao_id', instituicaoId)
        .order('nome', { ascending: true })

    if (escError) throw new Error(escError.message)

    return {
        instituicao: instituicao as Instituicao,
        escolas: escolas as Escola[]
    }
}
