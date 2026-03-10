import { supabase } from '@/config/supabase'
import type { DisciplinaRow, DisciplinaInsert, DisciplinaUpdate } from '../types'

export const disciplinasApi = {
    async getDisciplinas() {
        const { data, error } = await supabase
            .from('ger_disciplinas')
            .select(`
                *,
                cor:ger_cores_disciplinas(*)
            `)
            .order('nome')

        if (error) throw error
        return data as DisciplinaRow[]
    },

    async createDisciplina(disciplina: Omit<DisciplinaInsert, 'cor_id'>) {
        // Primeiro busca uma cor aleatória
        const { data: randomColor, error: colorError } = await supabase
            .from('ger_cores_disciplinas')
            .select('id')
            .limit(1)

        if (colorError || !randomColor?.length) throw new Error('Falha ao buscar paleta de cores.')

        // Puxa a cor aleatória usando OrderBy na memoria do banco não funciona direto no rest,
        // então a edge ou trigger seria o ideal. Mas como precisamos de algo em tempo de linha:
        // A melhor forma no frontend Client Auth para postgresql RANDOM() sem RPC é:
        // Mas a row-level-security do select random() vai nos dar as 20. Escolhemos 1 no client:
        const { data: allColors } = await supabase.from('ger_cores_disciplinas').select('id')
        const chosenColor = allColors ? allColors[Math.floor(Math.random() * allColors.length)].id : randomColor[0].id

        const { data, error } = await supabase
            .from('ger_disciplinas')
            .insert({
                ...disciplina,
                cor_id: chosenColor
            })
            .select(`*, cor:ger_cores_disciplinas(*)`)
            .single()

        if (error) throw error
        return data as DisciplinaRow
    },

    async updateDisciplina(id: string, disciplina: DisciplinaUpdate) {
        const { data, error } = await supabase
            .from('ger_disciplinas')
            .update(disciplina)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as DisciplinaRow
    },

    async deleteDisciplina(id: string) {
        const { error } = await supabase
            .from('ger_disciplinas')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}
