import { useState, useCallback } from 'react'
import { supabase } from '@/config/supabase'
import { useProfile } from '@/hooks/useProfile'
import { toast } from 'sonner'

export interface EscolaAdmin {
    id: string
    nome: string
    instituicao_id: string
    created_at: string
}

export function useEscolasAdmin() {
    const { profile } = useProfile()
    const [escolas, setEscolas] = useState<EscolaAdmin[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchEscolas = useCallback(async () => {
        if (!profile?.instituicao_id) return

        try {
            setLoading(true)
            setError(null)
            const { data, error } = await supabase
                .from('ger_escolas_instituicao')
                .select('*')
                .eq('instituicao_id', profile.instituicao_id)
                .order('nome')

            if (error) throw error
            setEscolas(data || [])
        } catch (err: any) {
            console.error('Erro ao buscar escolas:', err)
            setError(err.message)
            toast.error('Erro ao carregar as escolas')
        } finally {
            setLoading(false)
        }
    }, [profile?.instituicao_id])

    const createEscola = async (nome: string) => {
        if (!profile?.instituicao_id) return false

        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('ger_escolas_instituicao')
                .insert({
                    nome,
                    instituicao_id: profile.instituicao_id
                })
                .select()
                .single()

            if (error) throw error

            setEscolas(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)))
            toast.success('Escola adicionada com sucesso')
            return true
        } catch (err: any) {
            console.error('Erro ao criar escola:', err)
            if (err.code === '23505') {
                toast.error('Já existe uma escola com este nome nesta instituição.')
            } else {
                toast.error('Erro ao tentar cadastrar a escola')
            }
            return false
        } finally {
            setLoading(false)
        }
    }

    const updateEscola = async (id: string, nome: string) => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('ger_escolas_instituicao')
                .update({ nome })
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            setEscolas(prev => prev.map(e => e.id === id ? data : e).sort((a, b) => a.nome.localeCompare(b.nome)))
            toast.success('Escola atualizada com sucesso')
            return true
        } catch (err: any) {
            console.error('Erro ao atualizar escola:', err)
            if (err.code === '23505') {
                toast.error('Já existe uma escola com este nome nesta instituição.')
            } else {
                toast.error('Erro ao atualizar os dados da escola')
            }
            return false
        } finally {
            setLoading(false)
        }
    }

    const deleteEscola = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja excluir esta escola?')) return false

        try {
            setLoading(true)
            const { error } = await supabase
                .from('ger_escolas_instituicao')
                .delete()
                .eq('id', id)

            if (error) {
                if (error.code === '23503') {
                    throw new Error('Não é possível excluir esta escola pois ela possui professores, turmas ou matrizes curriculares atreladas.')
                }
                throw error;
            }

            setEscolas(prev => prev.filter(e => e.id !== id))
            toast.success('Escola removida com sucesso')
            return true
        } catch (err: any) {
            console.error('Erro ao deletar escola:', err)
            toast.error(err.message || 'Erro ao remover a escola')
            return false
        } finally {
            setLoading(false)
        }
    }

    return {
        escolas,
        loading,
        error,
        fetchEscolas,
        createEscola,
        updateEscola,
        deleteEscola
    }
}
