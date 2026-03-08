import { supabase } from '@/config/supabase'
import type { EquipeMember, EquipeInsert, EquipeUpdate } from '../types'

export const equipeApi = {
    async getEquipe(): Promise<EquipeMember[]> {
        // Ordena por nome
        const { data, error } = await supabase
            .from('ger_professor_diretor')
            .select(`
                *,
                ger_professor_disciplinas(
                    disciplina_id,
                    ger_disciplinas(nome)
                )
            `)
            .order('nome_completo', { ascending: true })

        if (error) throw error
        return (data || []).map(member => ({
            ...member,
            disciplinas: (member.ger_professor_disciplinas || [])
                .map((d: any) => d.ger_disciplinas?.nome)
                .filter(Boolean),
            disciplina_ids: (member.ger_professor_disciplinas || [])
                .map((d: any) => d.disciplina_id)
                .filter(Boolean)
        }))
    },

    async createMember(member: EquipeInsert): Promise<EquipeMember> {
        const { data, error } = await supabase
            .from('ger_professor_diretor')
            .insert(member)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateMember(id: string, member: EquipeUpdate): Promise<EquipeMember> {
        const { data, error } = await supabase
            .from('ger_professor_diretor')
            .update(member)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async updateMemberDisciplinas(professor_id: string, disciplina_ids: string[], profilesSessionId: string): Promise<void> {
        // Aqui assumimos que quem invoca está autenticado e o RLS vai tratar a restrição instituicao_id.
        // Pegaremos o instituicao_id vinculada ao profile para refazer o insert das disciplinas
        const { data: profileData } = await supabase
            .from('profiles')
            .select('instituicao_id')
            .eq('id', profilesSessionId)
            .single()

        if (!profileData?.instituicao_id) throw new Error("Instituição não encontrada no perfil")

        // Deleta todas as atribuições atuais do professor para inserirmos as novas (replace completo)
        const { error: deleteError } = await supabase
            .from('ger_professor_disciplinas')
            .delete()
            .eq('professor_id', professor_id)

        if (deleteError) throw deleteError

        // Se houverem disciplinas pra inserir, nós as inserimos
        if (disciplina_ids.length > 0) {
            const insertData = disciplina_ids.map(d_id => ({
                professor_id,
                disciplina_id: d_id,
                instituicao_id: profileData.instituicao_id!
            }))

            const { error: insertError } = await supabase
                .from('ger_professor_disciplinas')
                .insert(insertData)

            if (insertError) throw insertError
        }
    },

    async deleteMember(id: string): Promise<void> {
        const { error } = await supabase
            .from('ger_professor_diretor')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}
