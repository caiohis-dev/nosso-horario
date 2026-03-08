import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/config/supabase'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

export type Serie = Database['public']['Tables']['ger_series']['Row']
export type SerieEscola = Database['public']['Tables']['esp_series_escolas']['Row']

export function useEscolaSeriesChecklist(escolaId: string | undefined, instituicaoId: string | undefined, anoLetivo: string) {
    const [seriesDisponiveis, setSeriesDisponiveis] = useState<Serie[]>([])
    const [seriesVinculadas, setSeriesVinculadas] = useState<Record<string, SerieEscola>>({})
    const [loading, setLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState<string | null>(null)

    // Busca todas as séries cadastradas globalmente para iterar (filtro apenas institucional acontece por trás (RLS/cascade) mas as séries bases não têm instituicao_id no schema do Supabase ou sim? no tabelas.md: a ger_series NÃO tem instituicao_id e no schema 20260302123040 tem.)
    // Ops, checando tabelas.md, ger_series TEM instituicao_id (criada global com rls). 

    const fetchDados = useCallback(async () => {
        if (!escolaId) return

        try {
            setLoading(true)

            // 1. Fetch Todas as Séries da Instituição
            const { data: todasSeriesData, error: todasError } = await supabase
                .from('ger_series')
                .select('*')
                .order('nome', { ascending: true })

            if (todasError) throw todasError
            setSeriesDisponiveis(todasSeriesData || [])

            // 2. Fetch Vinculadas da Escola naquele Ano Letivo
            const { data: vinculadasData, error: vinculadasError } = await supabase
                .from('esp_series_escolas')
                .select('*')
                .eq('escola_id', escolaId)
                .eq('ano', anoLetivo)

            if (vinculadasError) throw vinculadasError

            // Build dictionary for fast lookup
            const vinculosMap: Record<string, SerieEscola> = {}
            vinculadasData?.forEach(v => {
                vinculosMap[v.serie_id] = v
            })
            setSeriesVinculadas(vinculosMap)

        } catch (error: any) {
            console.error('Erro ao buscar as turmas/séries:', error)
            toast.error('Ocorreu um erro ao carregar as séries desta escola.')
        } finally {
            setLoading(false)
        }
    }, [escolaId, anoLetivo])

    useEffect(() => {
        fetchDados()
    }, [fetchDados])

    const toggleSerie = async (serieId: string, isCurrentlyChecked: boolean) => {
        if (!escolaId || !instituicaoId) {
            toast.error('Dados da escola ou instituição não carregados.')
            return
        }

        setIsUpdating(serieId)

        try {
            if (isCurrentlyChecked) {
                // DELETE
                const vinculoId = seriesVinculadas[serieId]?.id
                if (!vinculoId) throw new Error('Vínculo não encontrado na memória.')

                const { error } = await supabase
                    .from('esp_series_escolas')
                    .delete()
                    .eq('id', vinculoId)
                    .eq('escola_id', escolaId) // safety
                    .eq('ano', anoLetivo)

                if (error) throw error

                // Atualiza state local sem re-fetch inteiro (Otimista)
                setSeriesVinculadas(prev => {
                    const next = { ...prev }
                    delete next[serieId]
                    return next
                })

            } else {
                // INSERT
                const { data, error } = await supabase
                    .from('esp_series_escolas')
                    .insert({
                        escola_id: escolaId,
                        serie_id: serieId,
                        instituicao_id: instituicaoId,
                        ano: anoLetivo
                    })
                    .select('*')
                    .single()

                if (error) throw error

                // Atualiza state local
                if (data) {
                    setSeriesVinculadas(prev => ({
                        ...prev,
                        [serieId]: data as SerieEscola
                    }))
                }
            }
        } catch (error: any) {
            console.error('Erro no toggle de série:', error)
            // Código 23503 = violação de chave estrangeira (ON DELETE RESTRICT)
            // Significa que esta série tem dados dependentes nesta escola/ano que precisam ser removidos primeiro
            if (error?.code === '23503') {
                toast.error('Não é possível desvincular esta série pois ela possui turmas, disciplinas ou horários cadastrados para ela nesta escola. Remova as dependências primeiro.')
            } else {
                toast.error(error.message || 'Falha ao atualizar o vínculo da série.')
            }
            await fetchDados() // Re-sincroniza o estado visual (ex: volta o checkbox pra marcado)
        } finally {
            setIsUpdating(null)
        }
    }

    return {
        seriesDisponiveis,
        seriesVinculadas,
        loading,
        isUpdating,
        anoLetivo,
        toggleSerie,
        refresh: fetchDados
    }
}
