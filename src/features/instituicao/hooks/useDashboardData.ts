import { useEffect, useState } from 'react'
import { getDashboardData } from '../api/dashboard'
import { useInstitutionValidation } from './useInstitutionValidation'
import type { Database } from '@/types/database'

type Instituicao = Database['public']['Tables']['ger_instituicao']['Row']
type Escola = Database['public']['Tables']['ger_escolas_instituicao']['Row']

interface DashboardData {
    instituicao: Instituicao | null
    escolas: Escola[]
}

export function useDashboardData() {
    const { profile, loading: authLoading } = useInstitutionValidation()
    const [data, setData] = useState<DashboardData>({ instituicao: null, escolas: [] })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        let mounted = true

        async function loadData() {
            if (!profile?.instituicao_id) {
                if (mounted) setLoading(false)
                return
            }

            try {
                const result = await getDashboardData(profile.instituicao_id)
                if (mounted) {
                    setData(result)
                    setError(null)
                }
            } catch (err) {
                if (mounted) setError(err instanceof Error ? err : new Error('Falha ao carregar dashboard'))
            } finally {
                if (mounted) setLoading(false)
            }
        }

        if (!authLoading) {
            loadData()
        }

        return () => {
            mounted = false
        }
    }, [profile?.instituicao_id, authLoading])

    return { ...data, loading: loading || authLoading, error }
}
