import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { seriesApi } from '../api/series'
import { useProfile } from '@/hooks/useProfile'
import type { SerieRow } from '../types'

export function useSeries() {
    const { profile } = useProfile()
    const [series, setSeries] = useState<SerieRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchSeries = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await seriesApi.getSeries()
            setSeries(data)
        } catch (err: unknown) {
            console.error('Erro ao carregar séries:', err)
            setError(err instanceof Error ? err : new Error(String(err)))
            toast.error('Falha ao carregar a lista de séries.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (profile?.instituicao_id) {
            fetchSeries()
        }
    }, [profile?.instituicao_id])

    const createSerie = async (nome: string) => {
        if (!profile?.instituicao_id) {
            toast.error('Erro de contexto institucional.')
            return { success: false }
        }

        try {
            const novaSerie = await seriesApi.createSerie({
                nome: nome.trim(),
                instituicao_id: profile.instituicao_id
            })
            setSeries(prev => [...prev, novaSerie].sort((a, b) => a.nome.localeCompare(b.nome)))
            toast.success('Série adicionada com sucesso!')
            return { success: true, data: novaSerie }
        } catch (err: unknown) {
            console.error('Erro ao criar série:', err)
            const msg = err instanceof Error ? err.message : 'Erro ao adicionar a série.'
            toast.error(msg)
            return { success: false, error: err }
        }
    }

    const updateSerie = async (id: string, novoNome: string) => {
        try {
            const updatedSerie = await seriesApi.updateSerie(id, { nome: novoNome.trim() })
            setSeries(prev => prev.map(s => s.id === id ? updatedSerie : s).sort((a, b) => a.nome.localeCompare(b.nome)))
            toast.success('Série renomeada com sucesso!')
            return { success: true, data: updatedSerie }
        } catch (err: unknown) {
            console.error('Erro ao editar série:', err)
            toast.error('Erro ao editar a série.')
            return { success: false, error: err }
        }
    }

    const deleteSerie = async (id: string) => {
        try {
            await seriesApi.deleteSerie(id)
            setSeries(prev => prev.filter(s => s.id !== id))
            toast.success('Série removida com sucesso.')
            return { success: true }
        } catch (err: unknown) {
            console.error('Erro ao excluir série:', err)
            toast.error('Não foi possível excluir. Verifique se existem turmas atreladas.')
            return { success: false, error: err }
        }
    }

    return {
        series,
        loading,
        error,
        fetchSeries,
        createSerie,
        updateSerie,
        deleteSerie
    }
}
