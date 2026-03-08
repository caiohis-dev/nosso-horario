import { useState, useEffect } from 'react'
import { useInstitutionValidation } from '@/features/instituicao/hooks/useInstitutionValidation'
import { useDashboardData } from '@/features/instituicao/hooks/useDashboardData'
import { useProfile } from '@/hooks/useProfile'
import OnboardingPage from '@/features/instituicao/pages/OnboardingPage'
import { DashboardCard } from '@/components/DashboardCard'
import { ROUTES } from '@/constants/routes'
// DEV ONLY - REMOVER ANTES DO DEPLOY
import { supabase } from '@/config/supabase'

export default function DashboardPage() {
    const { isFullyOnboarded, loading: authLoading } = useInstitutionValidation()
    const { instituicao, escolas, loading: dataLoading } = useDashboardData()
    const { profile } = useProfile()

    const isLoading = authLoading || dataLoading

    // Contadores para os cards do Cadastro Geral
    const [counts, setCounts] = useState<{
        professores: number | null
        disciplinas: number | null
        series: number | null
        escolas: number | null
    }>({
        professores: null,
        disciplinas: null,
        series: null,
        escolas: null,
    })

    useEffect(() => {
        if (!profile?.instituicao_id) return
        const id = profile.instituicao_id

        Promise.all([
            supabase.from('ger_professor_diretor').select('id', { count: 'exact', head: true }).eq('instituicao_id', id),
            supabase.from('ger_disciplinas').select('id', { count: 'exact', head: true }).eq('instituicao_id', id),
            supabase.from('ger_series').select('id', { count: 'exact', head: true }).eq('instituicao_id', id),
            supabase.from('ger_escolas_instituicao').select('id', { count: 'exact', head: true }).eq('instituicao_id', id),
        ]).then(([prof, disc, ser, esc]) => {
            setCounts({
                professores: prof.count ?? 0,
                disciplinas: disc.count ?? 0,
                series: ser.count ?? 0,
                escolas: esc.count ?? 0,
            })
        })
    }, [profile?.instituicao_id])

    // =========================================================
    // DEV ONLY - REMOVER ANTES DO DEPLOY
    // =========================================================
    const [seedLoading, setSeedLoading] = useState(false)
    const [seedStatus, setSeedStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [seedMessage, setSeedMessage] = useState<string | null>(null)

    async function handleSeedData() {
        if (!profile?.instituicao_id) return
        const instituicaoId: string = profile.instituicao_id
        setSeedLoading(true)
        setSeedStatus('idle')
        setSeedMessage(null)

        try {
            // 1. Busca cores disponíveis
            const { data: cores, error: coresError } = await supabase
                .from('ger_cores_disciplinas')
                .select('id')

            if (coresError) throw new Error('Erro ao buscar cores: ' + coresError.message)
            if (!cores || cores.length === 0) throw new Error('Nenhuma cor cadastrada em ger_cores_disciplinas')

            const randomColor = () => cores[Math.floor(Math.random() * cores.length)].id

            // 2. Insert disciplinas
            const disciplinas = [
                'Arte', 'Ciências', 'Educação Física', 'Geografia', 'História',
                'Informática', 'Lingua Portugues', 'Matemática', 'Qualifica',
            ]
            const { error: discError } = await supabase
                .from('ger_disciplinas')
                .insert(disciplinas.map(nome => ({
                    nome,
                    instituicao_id: instituicaoId,
                    cor_id: randomColor(),
                })))

            if (discError) throw new Error('Erro ao inserir disciplinas: ' + discError.message)

            // 3. Insert escolas
            const escolas = [
                'Academia da Vida', 'Colégio Themis', 'Colégio João XXIII',
                'Colégio JB', 'Colégio Delce', 'Passaporte Universitário', 'Qualifica',
            ]
            const { error: escolasError } = await supabase
                .from('ger_escolas_instituicao')
                .insert(escolas.map(nome => ({
                    nome,
                    instituicao_id: instituicaoId,
                })))

            if (escolasError) throw new Error('Erro ao inserir escolas: ' + escolasError.message)

            // 4. Insert séries
            const series = ['6o ano', '7o ano', '8o ano']
            const { error: seriesError } = await supabase
                .from('ger_series')
                .insert(series.map(nome => ({
                    nome,
                    instituicao_id: instituicaoId,
                })))

            if (seriesError) throw new Error('Erro ao inserir séries: ' + seriesError.message)

            setSeedStatus('success')
            setSeedMessage('9 disciplinas, 7 escolas e 3 séries inseridas com sucesso!')
        } catch (err) {
            setSeedStatus('error')
            setSeedMessage(err instanceof Error ? err.message : 'Erro inesperado')
        } finally {
            setSeedLoading(false)
        }
    }
    // =========================================================

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-surface">
                <div className="h-8 w-8 rounded-full bg-brand/30 ring-1 ring-brand" />
            </div>
        )
    }

    if (!isFullyOnboarded) {
        return <OnboardingPage />
    }

    return (
        <div className="min-h-screen bg-surface p-6 sm:p-10">
            <div className="mx-auto max-w-7xl space-y-8">

                {/* Header Section */}
                <header className="flex flex-col space-y-2 border-b border-border/50 pb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                        Painel Administrativo
                    </h1>
                    <p className="text-sm text-text-muted">
                        Visão central da plataforma
                    </p>
                </header>

                {/* DEV ONLY - REMOVER ANTES DO DEPLOY */}
                {profile?.role === 'Admin' && (
                    <div className="rounded-lg border border-dashed border-amber-400/50 bg-amber-400/5 p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-amber-500">
                            ⚠ Ferramenta de desenvolvimento — remover antes do deploy
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={handleSeedData}
                                disabled={seedLoading}
                                className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {seedLoading ? (
                                    <>
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        Inserindo dados…
                                    </>
                                ) : (
                                    'Popular dados de demonstração'
                                )}
                            </button>

                            {seedStatus === 'success' && (
                                <span className="text-sm text-green-500">✓ {seedMessage}</span>
                            )}
                            {seedStatus === 'error' && (
                                <span className="text-sm text-red-500">✗ {seedMessage}</span>
                            )}
                        </div>
                    </div>
                )}
                {/* FIM DEV ONLY */}

                {profile?.role !== 'Professor' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-text-secondary">
                            Cadastro geral - {instituicao?.nome}
                        </h2>

                        {/* Quick Actions Area */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <DashboardCard
                                to="/equipe"
                                title="Equipe Escolar"
                                subtitle="Gerenciar professores e diretores"
                                stat={{ label: 'Profissionais cadastrados', value: counts.professores }}
                                icon={
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                }
                            />

                            {profile?.role === 'Admin' && (
                                <DashboardCard
                                    to="/disciplinas"
                                    title="Disciplinas"
                                    subtitle="Grade de matérias institucionais"
                                    stat={{ label: 'Componentes curriculares cadastrados', value: counts.disciplinas }}
                                    icon={
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    }
                                />
                            )}

                            {profile?.role === 'Admin' && (
                                <DashboardCard
                                    to="/series"
                                    title="Séries"
                                    subtitle="Divisões do ano letivo"
                                    stat={{ label: 'Anos de escolaridade cadastrados', value: counts.series }}
                                    icon={
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    }
                                />
                            )}

                            {profile?.role === 'Admin' && (
                                <DashboardCard
                                    to={ROUTES.ESCOLAS_GERENCIAMENTO}
                                    title="Escolas da Instituição"
                                    subtitle="Gerenciar unidades cadastradas"
                                    stat={{ label: 'Unidades escolares cadastradas', value: counts.escolas }}
                                    icon={
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    }
                                />
                            )}
                        </section>
                    </div>
                )}

                {/* Main Content Area */}
                <main className="space-y-6">
                    <h2 className="text-xl font-semibold text-text-secondary">
                        Unidades Escolares
                    </h2>

                    {escolas.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle bg-surface-raised/50 py-16 text-center">
                            <p className="text-sm text-text-muted">Nenhuma escola associada até o momento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {escolas.map((escola, index) => (
                                <DashboardCard
                                    key={escola.id}
                                    to={`/escola/${escola.id}`}
                                    title={escola.nome}
                                    subtitle="Acessar painel da unidade"
                                    style={{ animationDelay: `${index * 150}ms`, animationDuration: '600ms' }}
                                    icon={
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    }
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
