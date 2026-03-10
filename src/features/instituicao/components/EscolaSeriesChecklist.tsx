import { useState } from 'react'
import type { SerieEscola, Serie } from '../hooks/useEscolaSeriesChecklist'
import { DisciplinasSeriePanel } from './DisciplinasSeriePanel'

interface EscolaSeriesChecklistProps {
    escolaId: string
    escolaNome: string
    instituicaoId: string
    anoLetivo: string
    seriesDisponiveis: Serie[]
    seriesVinculadas: Record<string, SerieEscola>
    loading: boolean
    isUpdating: string | null
    onToggleSerie: (serieId: string, isCurrentlyChecked: boolean) => void
}

export function EscolaSeriesChecklist({
    escolaId,
    escolaNome,
    instituicaoId,
    anoLetivo,
    seriesDisponiveis,
    seriesVinculadas,
    loading,
    isUpdating,
    onToggleSerie,
}: EscolaSeriesChecklistProps) {
    const [disciplinasSerie, setDisciplinasSerie] = useState<Serie | null>(null)

    return (
        <>
            <div className="card shadow-sm border border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 p-6 gap-4 bg-surface-raised/30">
                    <div>
                        <h2 className="text-xl font-semibold text-text-primary">
                            Séries Ofertadas
                        </h2>
                        <p className="mt-1 text-sm text-text-muted">
                            Configure as séries que a unidade escolar atende neste ano letivo.
                        </p>
                    </div>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-[68px] animate-pulse rounded-xl bg-surface-raised" />
                            ))}
                        </div>
                    ) : seriesDisponiveis.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border bg-surface-raised/50 py-12 text-center text-text-muted text-sm">
                            Nenhuma série cadastrada de forma global na instituição.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {seriesDisponiveis.map((serie) => {
                                const isChecked = !!seriesVinculadas[serie.id]
                                const isLoadingThis = isUpdating === serie.id

                                return (
                                    <div
                                        key={serie.id}
                                        className={`
                                            relative flex flex-col gap-3 rounded-xl border p-4 transition-all
                                            ${isLoadingThis ? 'opacity-50 pointer-events-none' : ''}
                                            ${isChecked
                                                ? 'border-brand bg-brand-subtle/5 shadow-sm'
                                                : 'border-border bg-surface-raised'}
                                        `}
                                    >
                                        {/* Checkbox row */}
                                        <label className="flex cursor-pointer items-start gap-3">
                                            <div className="flex h-5 items-center mt-0.5 shrink-0">
                                                {isLoadingThis ? (
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-r-transparent" />
                                                ) : (
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 shrink-0 rounded border-border-strong text-brand focus:ring-brand accent-brand cursor-pointer"
                                                        checked={isChecked}
                                                        onChange={() => onToggleSerie(serie.id, isChecked)}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-semibold text-text-primary truncate">
                                                    {serie.nome}
                                                </span>
                                                <span className={`text-xs mt-0.5 ${isChecked ? 'text-brand' : 'text-text-muted'}`}>
                                                    {isChecked ? 'Vinculada' : 'Não Vinculada'}
                                                </span>
                                            </div>
                                        </label>

                                        {/* Botão Disciplinas */}
                                        <button
                                            onClick={() => setDisciplinasSerie(serie)}
                                            disabled={!isChecked}
                                            className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-all enabled:hover:bg-surface-overlay enabled:hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                            Disciplinas
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Painel de disciplinas */}
            {disciplinasSerie && (
                <DisciplinasSeriePanel
                    serieId={disciplinasSerie.id}
                    serieName={disciplinasSerie.nome}
                    escolaId={escolaId}
                    escolaNome={escolaNome}
                    instituicaoId={instituicaoId}
                    anoLetivo={anoLetivo}
                    onClose={() => setDisciplinasSerie(null)}
                />
            )}
        </>
    )
}
