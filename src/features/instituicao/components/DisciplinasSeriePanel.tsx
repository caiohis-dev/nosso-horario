import { useState } from 'react'
import { useDisciplinasSerieEscola } from '../hooks/useDisciplinasSerieEscola'

interface DisciplinasSeriePanelProps {
    serieId: string
    serieName: string
    escolaId: string
    escolaNome: string
    instituicaoId: string
    anoLetivo: string
    onClose: () => void
}

export function DisciplinasSeriePanel({
    serieId,
    serieName,
    escolaId,
    escolaNome,
    instituicaoId,
    anoLetivo,
    onClose,
}: DisciplinasSeriePanelProps) {
    const {
        disciplinasDisponiveis,
        disciplinasVinculadas,
        loading,
        isUpdating,
        updatingNumAulas,
        toggleDisciplina,
        updateNumAulas,
    } = useDisciplinasSerieEscola(escolaId, serieId, instituicaoId, anoLetivo)

    // Estado local para os inputs de num_aulas enquanto o usuário digita
    const [localNumAulas, setLocalNumAulas] = useState<Record<string, string>>({})

    const handleNumAulasChange = (disciplinaId: string, value: string) => {
        setLocalNumAulas(prev => ({ ...prev, [disciplinaId]: value }))
    }

    const handleNumAulasBlur = (disciplinaId: string) => {
        if (!(disciplinaId in localNumAulas)) return
        const raw = localNumAulas[disciplinaId]
        const num = Math.max(1, parseInt(raw, 10) || 1)
        setLocalNumAulas(prev => {
            const next = { ...prev }
            delete next[disciplinaId]
            return next
        })
        updateNumAulas(disciplinaId, num)
    }

    const getNumAulasDisplay = (disciplinaId: string): string => {
        if (disciplinaId in localNumAulas) return localNumAulas[disciplinaId]
        const vinculo = disciplinasVinculadas[disciplinaId]
        return vinculo ? String(vinculo.num_aulas) : '1'
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="card w-full max-w-2xl shadow-xl border border-border animate-in slide-in-from-bottom-4 duration-300 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-start justify-between border-b border-border/50 p-6 bg-surface-raised/30 shrink-0">
                    <div>
                        <h2 className="text-xl font-semibold text-text-primary">
                            Disciplinas — {serieName}
                        </h2>
                        <div className="mt-2 flex items-center gap-4 text-xs text-text-muted">
                            <span>
                                <span className="font-medium text-text-secondary">Escola:</span> {escolaNome}
                            </span>
                            <span>
                                <span className="font-medium text-text-secondary">Série:</span> {serieName}
                            </span>
                            <span>
                                <span className="font-medium text-text-secondary">Ano letivo:</span> {anoLetivo}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Fechar painel de disciplinas"
                        className="flex shrink-0 h-8 w-8 items-center justify-center rounded-full bg-surface text-text-muted ring-1 ring-border-subtle hover:text-text-primary hover:bg-surface-overlay transition-all"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {loading ? (
                        <div className="grid grid-cols-1 gap-3">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-14 animate-pulse rounded-xl bg-surface-raised" />
                            ))}
                        </div>
                    ) : disciplinasDisponiveis.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border bg-surface-raised/50 py-12 text-center text-text-muted text-sm">
                            Nenhuma disciplina cadastrada na instituição.
                        </div>
                    ) : (
                        <>
                            <p className="text-xs text-text-muted mb-4">
                                Selecione as disciplinas ofertadas para <span className="font-semibold text-text-secondary">{serieName}</span> em {escolaNome} no ano {anoLetivo}.
                                Quando vinculada, informe o número de aulas semanais.
                            </p>
                            <div className="space-y-2">
                                {disciplinasDisponiveis.map(disciplina => {
                                    const isChecked = !!disciplinasVinculadas[disciplina.id]
                                    const isTogglingThis = isUpdating === disciplina.id
                                    const isSavingAulas = updatingNumAulas.has(disciplina.id)

                                    return (
                                        <div
                                            key={disciplina.id}
                                            className={`
                                                flex items-center gap-3 rounded-xl border p-3 transition-all
                                                ${isTogglingThis ? 'opacity-50 pointer-events-none' : ''}
                                                ${isChecked
                                                    ? 'border-brand bg-brand-subtle/5'
                                                    : 'border-border bg-surface-raised'}
                                            `}
                                        >
                                            {/* Checkbox */}
                                            <div className="flex h-5 items-center shrink-0">
                                                {isTogglingThis ? (
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-r-transparent" />
                                                ) : (
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-border-strong text-brand focus:ring-brand accent-brand cursor-pointer"
                                                        checked={isChecked}
                                                        onChange={() => toggleDisciplina(disciplina.id, isChecked)}
                                                    />
                                                )}
                                            </div>

                                            {/* Nome */}
                                            <span className={`flex-1 text-sm font-medium truncate ${isChecked ? 'text-text-primary' : 'text-text-secondary'}`}>
                                                {disciplina.nome}
                                            </span>

                                            {/* Input num_aulas — visível apenas quando vinculada */}
                                            {isChecked && (
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="text-xs text-text-muted whitespace-nowrap">aulas/semana</span>
                                                    {isSavingAulas ? (
                                                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand border-r-transparent" />
                                                    ) : (
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={40}
                                                            aria-label={`Aulas semanais — ${disciplina.nome}`}
                                                            value={getNumAulasDisplay(disciplina.id)}
                                                            onChange={e => handleNumAulasChange(disciplina.id, e.target.value)}
                                                            onBlur={() => handleNumAulasBlur(disciplina.id)}
                                                            className="
                                                                input-base input-default
                                                                w-16 h-8 text-center text-sm px-1 py-0
                                                                [appearance:textfield]
                                                                [&::-webkit-inner-spin-button]:appearance-none
                                                                [&::-webkit-outer-spin-button]:appearance-none
                                                            "
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-border/50 px-6 py-4 shrink-0 flex items-center justify-between bg-surface-raised/20">
                    <span className="text-xs text-text-muted">
                        {Object.keys(disciplinasVinculadas).length} disciplina(s) vinculada(s)
                    </span>
                    <button onClick={onClose} className="btn-primary">
                        Concluir
                    </button>
                </div>
            </div>
        </div>
    )
}
