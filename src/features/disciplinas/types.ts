import type { Database } from '@/types/database'

export type DisciplinaInsert = Database['public']['Tables']['ger_disciplinas']['Insert']
export type DisciplinaUpdate = Database['public']['Tables']['ger_disciplinas']['Update']

export type DisciplinaRow = Database['public']['Tables']['ger_disciplinas']['Row'] & {
    cor?: Database['public']['Tables']['ger_cores_disciplinas']['Row']
}

export interface DisciplinaFormData {
    nome: string
}
