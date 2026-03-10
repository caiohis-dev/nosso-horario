import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useProfile } from '@/hooks/useProfile'
import { useDashboardData } from '@/features/instituicao/hooks/useDashboardData'
import { useEscolaSeriesChecklist } from '@/features/instituicao/hooks/useEscolaSeriesChecklist'
import { EscolaSeriesChecklist } from '@/features/instituicao/components/EscolaSeriesChecklist'
import { GradeEscolaCard } from '@/features/instituicao/components/GradeEscolaCard'
import { ROUTES } from '@/constants/routes'

export default function EscolaDashboardPage() {
    const { escolaId } = useParams()
    const { profile } = useProfile()
    const { escolas } = useDashboardData()
    const currentYear = new Date().getFullYear().toString()
    const [anoLetivo, setAnoLetivo] = useState(currentYear)
    const anosDisponiveis = [
        (Number(currentYear) - 1).toString(),
        currentYear,
        (Number(currentYear) + 1).toString()
    ]

    // Hook elevado para compartilhar séries com ambos os cards
    const {
        seriesDisponiveis,
        seriesVinculadas,
        loading: loadingSeries,
        isUpdating,
        toggleSerie,
    } = useEscolaSeriesChecklist(escolaId, profile?.instituicao_id ?? undefined, anoLetivo)

    // Filtramos para pegar os dados gerais da escola da store principal 
    const escolaAtual = escolas.find(e => e.id === escolaId)

    if (!escolaAtual) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
                <div className="text-danger mb-4">
                    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-text-primary mb-2">Escola não encontrada</h1>
                <p className="text-text-muted mb-6">A escola solicitada não existe ou foi removida.</p>
                <Link to={ROUTES.DASHBOARD} className="btn-primary">
                    Voltar ao Dashboard
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-surface p-6 sm:p-10">
            <div className="mx-auto max-w-5xl space-y-8">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 pb-6 gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                        <Link
                            to={ROUTES.DASHBOARD}
                            className="flex shrink-0 h-10 w-10 items-center justify-center rounded-full bg-surface-raised text-text-muted ring-1 ring-border-subtle hover:text-text-primary hover:bg-surface-overlay transition-all"
                            title="Voltar ao Dashboard"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl flex items-center gap-3">
                                {escolaAtual?.nome || 'Carregando Escola...'}
                            </h1>
                            <p className="mt-2 text-sm text-text-muted">
                                Gerenciamento individual desta unidade escolar.
                            </p>
                        </div>
                    </div>

                    {/* Ano Letivo — card alinhado à direita */}
                    <div className="flex items-center gap-3">
                        <div className="card !py-2 !px-4 flex items-center gap-3 shrink-0 shadow-sm">
                            <span className="text-xs font-medium text-text-muted whitespace-nowrap">Ano letivo</span>
                            <select
                                value={anoLetivo}
                                onChange={(e) => setAnoLetivo(e.target.value)}
                                className="input-base input-default w-24 text-center text-sm bg-surface cursor-pointer"
                            >
                                {anosDisponiveis.map(ano => (
                                    <option key={ano} value={ano}>{ano}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="space-y-10">
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
                        <EscolaSeriesChecklist
                            escolaId={escolaId!}
                            escolaNome={escolaAtual?.nome || ''}
                            instituicaoId={profile?.instituicao_id || ''}
                            anoLetivo={anoLetivo}
                            seriesDisponiveis={seriesDisponiveis}
                            seriesVinculadas={seriesVinculadas}
                            loading={loadingSeries}
                            isUpdating={isUpdating}
                            onToggleSerie={toggleSerie}
                        />
                    </section>
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
                        <GradeEscolaCard
                            escolaId={escolaId!}
                            instituicaoId={profile?.instituicao_id || ''}
                            anoLetivo={anoLetivo}
                            seriesDisponiveis={seriesDisponiveis}
                            seriesVinculadas={seriesVinculadas}
                        />
                    </section>
                </main>
            </div>
        </div>
    )
}
