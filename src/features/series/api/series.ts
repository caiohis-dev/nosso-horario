import { supabase } from '@/config/supabase'
import type { SerieRow, SerieInsert, SerieUpdate } from '../types'

export const seriesApi = {
    async getSeries() {
        const { data, error } = await supabase
            .from('ger_series')
            .select('*')
            .order('nome')

        if (error) throw error
        return data as SerieRow[]
    },

    async createSerie(serie: SerieInsert) {
        const { data, error } = await supabase
            .from('ger_series')
            .insert(serie)
            .select()
            .single()

        if (error) throw error
        return data as SerieRow
    },

    async updateSerie(id: string, serie: SerieUpdate) {
        const { data, error } = await supabase
            .from('ger_series')
            .update(serie)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as SerieRow
    },

    async deleteSerie(id: string) {
        const { error } = await supabase
            .from('ger_series')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}
