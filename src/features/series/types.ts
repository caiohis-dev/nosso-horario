import type { Database } from '@/types/database'

export type SerieRow = Database['public']['Tables']['ger_series']['Row']
export type SerieInsert = Database['public']['Tables']['ger_series']['Insert']
export type SerieUpdate = Database['public']['Tables']['ger_series']['Update']

export interface SerieFormData {
    nome: string
}
