import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { equipeApi } from '../api/equipe'
import type { EquipeMember, EquipeUpdate } from '../types'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { supabase } from '@/config/supabase'

export function useEquipe() {
    const { session } = useAuth()
    const [equipe, setEquipe] = useState<EquipeMember[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const fetchEquipe = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await equipeApi.getEquipe()
            setEquipe(data)
        } catch (err: any) {
            console.error('Erro ao carregar equipe:', err)
            setError(err)
            toast.error('Falha ao carregar a lista da equipe.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (session?.user) {
            fetchEquipe()
        }
    }, [session?.user, fetchEquipe])

    const createMember = async (memberData: any) => {
        try {
            if (!memberData.password) {
                throw new Error('A senha é obrigatória para cadastrar um novo integrante.')
            }

            // Invoca a Edge Function Deno de modo silencioso (bypass RLS / auto-confirm)
            const { data, error } = await supabase.functions.invoke('create-teacher', {
                body: { ...memberData },
                headers: {
                    Authorization: `Bearer ${session?.access_token}`
                }
            })

            // Captura de Erros da Network ou da transação Deno
            if (error) {
                console.error("Erro no invoke:", error);
                throw error;
            }

            // Exceções e constraints lógicas customizadas da Function
            if (data?.error) {
                console.error("Erro retornado na resposta (data.error):", data.error);
                throw new Error(typeof data.error === 'string' ? data.error : JSON.stringify(data.error));
            }

            toast.success('Membro cadastrado com acesso ativo! Email enviado.')

            // Recarrega todos da base (visto q a transação foi isolada)
            fetchEquipe()
            return { success: true, data: undefined }
        } catch (err: any) {
            console.error('Erro ao criar membro:', err)

            let errorMessage = err?.message || 'Erro desconhecido';
            const extraDetails = [];

            if (err?.details) extraDetails.push(err.details);
            if (err?.hint) extraDetails.push(`Dica: ${err.hint}`);
            if (err?.code) extraDetails.push(`Cód: ${err.code}`);
            if (err?.context) extraDetails.push(`Contexto: ${JSON.stringify(err.context)}`);

            if (extraDetails.length > 0) {
                errorMessage += ` | Detalhes: ${extraDetails.join(', ')}`;
            } else if (typeof err === 'object' && !err?.message) {
                try {
                    errorMessage = JSON.stringify(err);
                } catch (e) { }
            }

            toast.error(`Falha ao salvar: ${errorMessage}`, { duration: 10000 })
            return { success: false, error: err }
        }
    }

    const updateMember = async (id: string, memberData: EquipeUpdate & { disciplinas?: string[] }) => {
        try {
            const { disciplinas, ...rest } = memberData
            const updatedMember = await equipeApi.updateMember(id, rest as EquipeUpdate)

            if (disciplinas && session?.user?.id) {
                await equipeApi.updateMemberDisciplinas(id, disciplinas, session.user.id)
            }

            fetchEquipe()

            toast.success('Membro salvo com sucesso!')
            return { success: true, data: updatedMember }
        } catch (err: any) {
            console.error('Erro ao atualizar membro:', err)
            toast.error('Erro ao atualizar as informações do membro.')
            return { success: false, error: err }
        }
    }

    const deleteMember = async (id: string) => {
        try {
            await equipeApi.deleteMember(id)
            setEquipe(prev => prev.filter(m => m.id !== id))
            toast.success('Membro removido da equipe.')
            return { success: true }
        } catch (err: any) {
            console.error('Erro ao excluir membro:', err)
            toast.error('Não foi possível excluir este membro.')
            return { success: false, error: err }
        }
    }

    return {
        equipe,
        loading,
        error,
        fetchEquipe,
        createMember,
        updateMember,
        deleteMember
    }
}
