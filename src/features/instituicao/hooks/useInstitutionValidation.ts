import { useEffect, useState } from 'react'
import { supabase } from '@/config/supabase'
import { useProfile } from '@/hooks/useProfile'

export function useInstitutionValidation() {
    const { profile, loading: profileLoading, refreshProfile } = useProfile()

    const [hasSchools, setHasSchools] = useState<boolean | null>(null)
    const [schoolsLoading, setSchoolsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    const checkSchools = async (instituicaoId: string) => {
        setSchoolsLoading(true)
        try {
            const { count, error: qError } = await supabase
                .from('ger_escolas_instituicao')
                .select('*', { count: 'exact', head: true })
                .eq('instituicao_id', instituicaoId)

            if (qError) throw qError

            setHasSchools((count || 0) > 0)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to check schools'))
        } finally {
            setSchoolsLoading(false)
        }
    }

    useEffect(() => {
        let mounted = true

        if (profileLoading) return // Agurada o profile resolver primeiro

        if (!profile?.instituicao_id) {
            if (mounted) {
                setHasSchools(false)
                setSchoolsLoading(false)
            }
            return
        }

        checkSchools(profile.instituicao_id)

        // Escuta novas escolas apenas para esta instituição
        const channel = supabase
            .channel(`public:ger_escolas_instituicao:instituicao_id=eq.${profile.instituicao_id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'ger_escolas_instituicao',
                    filter: `instituicao_id=eq.${profile.instituicao_id}`,
                },
                () => {
                    // Quando uma escola for inserida, forçamos a atualização
                    if (mounted) {
                        setHasSchools(true)
                    }
                }
            )
            .subscribe()

        return () => {
            mounted = false
            supabase.removeChannel(channel)
        }
    }, [profile?.instituicao_id, profileLoading])

    const isFullyOnboarded = !!profile?.instituicao_id && hasSchools === true
    const currentStep = !profile?.instituicao_id ? 1 : (!hasSchools ? 2 : 3)

    return {
        profile,
        hasSchools,
        isFullyOnboarded,
        currentStep,
        loading: profileLoading || schoolsLoading,
        error,
        refreshProfile,
        refreshValidation: () => profile?.instituicao_id && checkSchools(profile.instituicao_id)
    }
}
