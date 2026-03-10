import { useState } from 'react'
import type { UpsertArgs } from '../hooks/useGradeEscolaAno'
import type { Database } from '@/types/database'

type GradeRow = Database['public']['Tables']['esp_grade_escola_ano']['Row']

const DIAS = [
    { key: 'seg', label: 'Seg' },
    { key: 'ter', label: 'Ter' },
    { key: 'qua', label: 'Qua' },
    { key: 'qui', label: 'Qui' },
    { key: 'sex', label: 'Sex' },
    { key: 'sab', label: 'Sáb' },
] as const

const TURNOS = [
    { key: 'matutino', label: 'Matutino' },
    { key: 'vespertino', label: 'Vespertino' },
    { key: 'noturno', label: 'Noturno' },
] as const

interface GradeSerieTabela {
    serieName: string
    serieId: string
    escolaId: string
    instituicaoId: string
    anoLetivo: string
    serieGrade: Map<string, GradeRow> // "dia|turno" → row
    onUpsert: (args: UpsertArgs) => void
    saving: Set<string> // chaves "serieId|dia|turno"
}

export function GradeSerieTabela({
    serieName,
    serieId,
    escolaId,
    instituicaoId,
    anoLetivo,
    serieGrade,
    onUpsert,
    saving,
}: GradeSerieTabela) {
    // Estado local para cada célula (controla o valor enquanto o user digita)
    const [localValues, setLocalValues] = useState<Record<string, string>>({})

    const getCelulaKey = (dia: string, turno: string) => `${dia}|${turno}`
    const getSavingKey = (dia: string, turno: string) => `${serieId}|${dia}|${turno}`

    const getDisplayValue = (dia: string, turno: string): string => {
        const localKey = getCelulaKey(dia, turno)
        if (localKey in localValues) return localValues[localKey]
        const row = serieGrade.get(getCelulaKey(dia, turno))
        return row ? String(row.num_aulas_dia) : ''
    }

    const handleChange = (dia: string, turno: string, value: string) => {
        setLocalValues(prev => ({ ...prev, [getCelulaKey(dia, turno)]: value }))
    }

    const handleBlur = (dia: string, turno: string) => {
        const localKey = getCelulaKey(dia, turno)
        if (!(localKey in localValues)) return // sem mudança

        const raw = localValues[localKey]
        const num = raw === '' ? 0 : Math.max(0, Math.min(20, parseInt(raw, 10) || 0))
        const row = serieGrade.get(localKey)

        // Limpa valor local — o estado global assume
        setLocalValues(prev => {
            const next = { ...prev }
            delete next[localKey]
            return next
        })

        onUpsert({
            escola_id: escolaId,
            serie_id: serieId,
            instituicao_id: instituicaoId,
            ano_letivo: anoLetivo,
            dia_semana: dia,
            turno,
            num_aulas_dia: num,
            rowId: row?.id,
        })
    }

    return (
        <div className="space-y-3">
            {/* Título da série */}
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand/10 text-brand text-xs font-bold ring-1 ring-brand/20">
                    {serieName.charAt(0).toUpperCase()}
                </span>
                {serieName}
            </h3>

            {/* Tabela */}
            <div className="overflow-x-auto rounded-lg border border-border-subtle">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-surface-raised/60 border-b border-border-subtle">
                            <th className="px-3 py-2 text-left text-xs font-medium text-text-muted w-28">
                                Turno
                            </th>
                            {DIAS.map(dia => (
                                <th
                                    key={dia.key}
                                    className="px-2 py-2 text-center text-xs font-medium text-text-muted min-w-[60px]"
                                >
                                    {dia.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/50">
                        {TURNOS.map((turno, turnoIdx) => (
                            <tr
                                key={turno.key}
                                className={turnoIdx % 2 === 1 ? 'bg-surface-raised/20' : ''}
                            >
                                <td className="px-3 py-2 text-xs font-medium text-text-secondary whitespace-nowrap">
                                    {turno.label}
                                </td>
                                {DIAS.map(dia => {
                                    const isSaving = saving.has(getSavingKey(dia.key, turno.key))
                                    const displayVal = getDisplayValue(dia.key, turno.key)

                                    return (
                                        <td key={dia.key} className="px-2 py-1.5 text-center">
                                            {isSaving ? (
                                                <div className="inline-flex items-center justify-center w-14 h-8">
                                                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand border-r-transparent" />
                                                </div>
                                            ) : (
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={20}
                                                    aria-label={`Aulas ${turno.label} ${dia.label} — ${serieName}`}
                                                    value={displayVal}
                                                    onChange={e => handleChange(dia.key, turno.key, e.target.value)}
                                                    onBlur={() => handleBlur(dia.key, turno.key)}
                                                    placeholder="—"
                                                    className="
                                                        input-base input-default
                                                        w-14 h-8 text-center text-sm
                                                        px-1 py-0
                                                        [appearance:textfield]
                                                        [&::-webkit-inner-spin-button]:appearance-none
                                                        [&::-webkit-outer-spin-button]:appearance-none
                                                    "
                                                />
                                            )}
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
