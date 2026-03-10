import { useEffect, useState } from 'react'
import { supabase } from '@/config/supabase'
import { useAuth } from '@/features/auth'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useProfile() {
    const { user } = useAuth()
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        let mounted = true

        async function fetchProfile() {
            if (!user) {
                if (mounted) {
                    setProfile(null)
                    setLoading(false)
                }
                return
            }

            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (error) throw error

                if (mounted) {
                    setProfile(data)
                    setError(null)
                }
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err : new Error('Failed to fetch profile'))
                    setProfile(null)
                }
            } finally {
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        fetchProfile()

        // Opcional: Escutar mudanças no profile do usuário logado via Realtime 
        // caso a role ou institution_id mude externamente.
        if (user) {
            const channel = supabase
                .channel(`public:profiles:id=eq.${user.id}`)
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
                    (payload) => {
                        if (mounted) {
                            setProfile(payload.new as Profile)
                        }
                    }
                )
                .subscribe()

            return () => {
                mounted = false
                supabase.removeChannel(channel)
            }
        }

        return () => {
            mounted = false
        }
    }, [user])

    // Função utilitária para forçar a re-leitura do profile manualmente
    const refreshProfile = async () => {
        if (!user) return
        setLoading(true)
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (!error && data) setProfile(data)
        setLoading(false)
    }

    // Função utilitária para atualizar colunas isoladas (Ex: theme)
    const updateProfile = async (updates: Partial<Profile>) => {
        if (!user || !profile) return { error: new Error('User not loaded') }

        // Otimismo: atualizamos o state no React antes mesmo da query voltar
        setProfile({ ...profile, ...updates })

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)

        if (error) {
            // Rollback em caso de erro
            setProfile(profile)
            return { error }
        }

        return { error: null }
    }

    return { profile, loading, error, refreshProfile, updateProfile }
}
