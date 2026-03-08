import { useGradeEscolaAno } from '../hooks/useGradeEscolaAno'
import { GradeSerieTabela } from './GradeSerieTabela'
import type { SerieEscola } from '../hooks/useEscolaSeriesChecklist'
import type { Database } from '@/types/database'

type Serie = Database['public']['Tables']['ger_series']['Row']

interface GradeEscolaCardProps {
    escolaId: string
    instituicaoId: string
    anoLetivo: string
    seriesDisponiveis: Serie[]
    seriesVinculadas: Record<string, SerieEscola>
}

export function GradeEscolaCard({
    escolaId,
    instituicaoId,
    anoLetivo,
    seriesDisponiveis,
    seriesVinculadas,
}: GradeEscolaCardProps) {
    const { gradeMap, loading, saving, upsertCelula } = useGradeEscolaAno(
        escolaId,
        instituicaoId,
        anoLetivo
    )

    // Filtra apenas as séries efetivamente vinculadas neste ano
    const seriesAtivas = seriesDisponiveis.filter(s => !!seriesVinculadas[s.id])

    return (
        <div className="card shadow-sm border border-border">
            {/* Header do card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 p-6 gap-4 bg-surface-raised/30">
                <div>
                    <h2 className="text-xl font-semibold text-text-primary">
                        Grade de Aulas
                    </h2>
                    <p className="mt-1 text-sm text-text-muted">
                        Defina o número de aulas por dia e turno para cada série ofertada.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-muted bg-surface-raised/50 px-3 py-2 rounded-lg border border-border-subtle">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Salva automaticamente ao sair do campo</span>
                </div>
            </div>

            {/* Corpo */}
            <div className="p-6">
                {loading ? (
                    // Skeleton
                    <div className="space-y-6">
                        {[1, 2].map(i => (
                            <div key={i} className="space-y-3">
                                <div className="h-4 w-24 animate-pulse rounded bg-surface-raised" />
                                <div className="h-32 animate-pulse rounded-lg bg-surface-raised" />
                            </div>
                        ))}
                    </div>
                ) : seriesAtivas.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-surface-raised/50 py-12 text-center text-text-muted text-sm">
                        Nenhuma série vinculada a esta escola para o ano letivo {anoLetivo}.
                        <br />
                        <span className="text-xs mt-1 block">
                            Vincule séries no card acima para configurar a grade.
                        </span>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {seriesAtivas.map(serie => {
                            const serieGrade = gradeMap.get(serie.id) ?? new Map()
                            return (
                                <GradeSerieTabela
                                    key={serie.id}
                                    serieName={serie.nome}
                                    serieId={serie.id}
                                    escolaId={escolaId}
                                    instituicaoId={instituicaoId}
                                    anoLetivo={anoLetivo}
                                    serieGrade={serieGrade}
                                    onUpsert={upsertCelula}
                                    saving={new Set(
                                        [...saving].filter(k => k.startsWith(`${serie.id}|`))
                                            .map(k => k) // mantém o formato completo "serieId|dia|turno"
                                    )}
                                />
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
