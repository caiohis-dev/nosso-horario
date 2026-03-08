import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { disciplinasApi } from '../api/disciplinas'
import type { DisciplinaRow } from '../types'
import { useAuth } from '@/features/auth'
import { useProfile } from '@/hooks/useProfile'

export function useDisciplinas() {
    const { session } = useAuth()
    const { profile } = useProfile()
    const [disciplinas, setDisciplinas] = useState<DisciplinaRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchDisciplinas = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await disciplinasApi.getDisciplinas()
            setDisciplinas(data)
        } catch (err: unknown) {
            console.error('Erro ao carregar disciplinas:', err)
            setError(err instanceof Error ? err : new Error(String(err)))
            toast.error('Falha ao carregar a lista de disciplinas.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (session?.user) {
            fetchDisciplinas()
        }
    }, [session?.user, fetchDisciplinas])

    const createDisciplina = async (nome: string) => {
        if (!profile?.instituicao_id) {
            toast.error('Erro de Autenticação. Nenhuma instituição vinculada.')
            return { success: false }
        }

        try {
            const novaDisciplina = await disciplinasApi.createDisciplina({
                nome,
                instituicao_id: profile.instituicao_id
            })
            setDisciplinas(prev => [...prev, novaDisciplina].sort((a, b) => a.nome.localeCompare(b.nome)))
            toast.success('Disciplina adicionada com sucesso!')
            return { success: true, data: novaDisciplina }
        } catch (err: unknown) {
            console.error('Erro ao criar disciplina:', err)
            const msg = err instanceof Error ? err.message : 'Erro ao adicionar a disciplina.'
            toast.error(msg)
            return { success: false, error: err }
        }
    }

    const updateDisciplina = async (id: string, nome: string) => {
        try {
            const updatedDisciplina = await disciplinasApi.updateDisciplina(id, { nome })
            setDisciplinas(prev => prev.map(d => d.id === id ? updatedDisciplina : d).sort((a, b) => a.nome.localeCompare(b.nome)))
            toast.success('Disciplina alterada com sucesso!')
            return { success: true, data: updatedDisciplina }
        } catch (err: unknown) {
            console.error('Erro ao editar disciplina:', err)
            toast.error('Erro ao atualizar o nome da disciplina.')
            return { success: false, error: err }
        }
    }

    const deleteDisciplina = async (id: string) => {
        try {
            await disciplinasApi.deleteDisciplina(id)
            setDisciplinas(prev => prev.filter(d => d.id !== id))
            toast.success('Disciplina removida com sucesso.')
            return { success: true }
        } catch (err: unknown) {
            console.error('Erro ao excluir disciplina:', err)
            toast.error('Não foi possível excluir. Verifique se está em uso.')
            return { success: false, error: err }
        }
    }

    return {
        disciplinas,
        loading,
        error,
        fetchDisciplinas,
        createDisciplina,
        updateDisciplina,
        deleteDisciplina
    }
}
