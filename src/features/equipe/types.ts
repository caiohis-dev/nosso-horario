import type { Database } from '@/types/database'

export type EquipeMember = Database['public']['Tables']['ger_professor_diretor']['Row'] & {
    disciplinas?: string[]    // nomes das disciplinas (para exibição na lista)
    disciplina_ids?: string[] // IDs das disciplinas (para pré-marcar checkboxes no form)
}
export type EquipeInsert = Database['public']['Tables']['ger_professor_diretor']['Insert']
export type EquipeUpdate = Database['public']['Tables']['ger_professor_diretor']['Update']

export interface EquipeFormData {
    nome_completo: string
    matricula: string
    numero_aulas_semanais: number
    email: string
    telefone: string
    diretor_escola_id: string | null
    data_admissao: string | null
    data_demissao: string | null
    password?: string // Usado exclusivamente na tela de criação de novos membros
    disciplinas: string[] // Array de IDs das disciplinas vinculadas
}
