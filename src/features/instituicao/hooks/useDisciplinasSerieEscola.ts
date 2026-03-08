import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/config/supabase'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

export type Disciplina = Database['public']['Tables']['ger_disciplinas']['Row']
export type DisciplinaSerieEscola = Database['public']['Tables']['esp_disciplina_serie_escola']['Row']

export function useDisciplinasSerieEscola(
    escolaId: string,
    serieId: string,
    instituicaoId: string,
    anoLetivo: string
) {
    const [disciplinasDisponiveis, setDisciplinasDisponiveis] = useState<Disciplina[]>([])
    const [disciplinasVinculadas, setDisciplinasVinculadas] = useState<Record<string, DisciplinaSerieEscola>>({})
    const [loading, setLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState<string | null>(null)
    const [updatingNumAulas, setUpdatingNumAulas] = useState<Set<string>>(new Set())

    const fetchDados = useCallback(async () => {
        if (!escolaId || !serieId || !instituicaoId) return

        try {
            setLoading(true)

            const [{ data: disciplinas, error: errDisc }, { data: vinculadas, error: errVinc }] =
                await Promise.all([
                    supabase
                        .from('ger_disciplinas')
                        .select('*')
                        .order('nome', { ascending: true }),
                    supabase
                        .from('esp_disciplina_serie_escola')
                        .select('*')
                        .eq('escola_id', escolaId)
                        .eq('serie_id', serieId)
                        .eq('ano_letivo', anoLetivo),
                ])

            if (errDisc) throw errDisc
            if (errVinc) throw errVinc

            setDisciplinasDisponiveis(disciplinas ?? [])

            const map: Record<string, DisciplinaSerieEscola> = {}
            vinculadas?.forEach(v => { map[v.disciplina_id] = v })
            setDisciplinasVinculadas(map)
        } catch (err: unknown) {
            console.error('Erro ao carregar disciplinas da série:', err)
            toast.error('Falha ao carregar as disciplinas.')
        } finally {
            setLoading(false)
        }
    }, [escolaId, serieId, instituicaoId, anoLetivo])

    useEffect(() => {
        fetchDados()
    }, [fetchDados])

    const toggleDisciplina = useCallback(async (
        disciplinaId: string,
        isCurrentlyChecked: boolean
    ) => {
        setIsUpdating(disciplinaId)
        try {
            if (isCurrentlyChecked) {
                // DELETE
                const vinculoId = disciplinasVinculadas[disciplinaId]?.id
                if (!vinculoId) throw new Error('Vínculo não encontrado.')

                const { error } = await supabase
                    .from('esp_disciplina_serie_escola')
                    .delete()
                    .eq('id', vinculoId)

                if (error) throw error

                setDisciplinasVinculadas(prev => {
                    const next = { ...prev }
                    delete next[disciplinaId]
                    return next
                })
            } else {
                // INSERT
                const { data, error } = await supabase
                    .from('esp_disciplina_serie_escola')
                    .insert({
                        escola_id: escolaId,
                        serie_id: serieId,
                        disciplina_id: disciplinaId,
                        instituicao_id: instituicaoId,
                        ano_letivo: anoLetivo,
                        num_aulas: 1,
                    })
                    .select('*')
                    .single()

                if (error) throw error

                if (data) {
                    setDisciplinasVinculadas(prev => ({ ...prev, [disciplinaId]: data }))
                }
            }
        } catch (err: unknown) {
            console.error('Erro ao atualizar disciplina:', err)
            toast.error('Falha ao atualizar a disciplina.')
            await fetchDados()
        } finally {
            setIsUpdating(null)
        }
    }, [escolaId, serieId, instituicaoId, anoLetivo, disciplinasVinculadas, fetchDados])

    const updateNumAulas = async (disciplinaId: string, numAulas: number) => {
        const vinculo = disciplinasVinculadas[disciplinaId]
        if (!vinculo) return

        setUpdatingNumAulas(prev => new Set(prev).add(disciplinaId))
        try {
            const { data, error } = await supabase
                .from('esp_disciplina_serie_escola')
                .update({ num_aulas: numAulas })
                .eq('id', vinculo.id)
                .select('*')
                .single()

            if (error) throw error
            if (data) {
                setDisciplinasVinculadas(prev => ({ ...prev, [disciplinaId]: data }))
            }
        } catch (err: unknown) {
            console.error('Erro ao atualizar num_aulas:', err)
            toast.error('Falha ao salvar o número de aulas.')
            await fetchDados()
        } finally {
            setUpdatingNumAulas(prev => {
                const next = new Set(prev)
                next.delete(disciplinaId)
                return next
            })
        }
    }

    return {
        disciplinasDisponiveis,
        disciplinasVinculadas,
        loading,
        isUpdating,
        updatingNumAulas,
        toggleDisciplina,
        updateNumAulas,
    }
}
