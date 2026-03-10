import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/config/supabase'
import { toast } from 'sonner'
import type { Database } from '@/types/database'

type GradeRow = Database['public']['Tables']['esp_grade_escola_ano']['Row']
type GradeInsert = Database['public']['Tables']['esp_grade_escola_ano']['Insert']

// Chave composta para lookup: "serieId|dia|turno"
type CelulKey = string

// Map de lookup: serieId → Map<"dia|turno" → row>
export type GradeMap = Map<string, Map<CelulKey, GradeRow>>

export interface UpsertArgs {
    escola_id: string
    serie_id: string
    instituicao_id: string
    ano_letivo: string
    dia_semana: string
    turno: string
    num_aulas_dia: number
    rowId?: string // presente se for UPDATE
}

export function useGradeEscolaAno(
    escolaId: string | undefined,
    _instituicaoId: string | undefined,
    anoLetivo: string
) {
    const [gradeMap, setGradeMap] = useState<GradeMap>(new Map())
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<Set<string>>(new Set())

    const buildKey = (serieId: string, dia: string, turno: string) =>
        `${serieId}|${dia}|${turno}`

    const fetchGrade = useCallback(async () => {
        if (!escolaId || !anoLetivo) return

        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('esp_grade_escola_ano')
                .select('*')
                .eq('escola_id', escolaId)
                .eq('ano_letivo', anoLetivo)

            if (error) throw error

            const map = new Map<string, Map<CelulKey, GradeRow>>()
            for (const row of data ?? []) {
                if (!map.has(row.serie_id)) map.set(row.serie_id, new Map())
                const celulaKey = `${row.dia_semana}|${row.turno}`
                map.get(row.serie_id)!.set(celulaKey, row)
            }
            setGradeMap(map)
        } catch (err: unknown) {
            console.error('Erro ao carregar grade:', err)
            toast.error('Falha ao carregar a grade de aulas.')
        } finally {
            setLoading(false)
        }
    }, [escolaId, anoLetivo])

    useEffect(() => {
        fetchGrade()
    }, [fetchGrade])

    const upsertCelula = useCallback(async (args: UpsertArgs) => {
        const key = buildKey(args.serie_id, args.dia_semana, args.turno)
        setSaving(prev => new Set(prev).add(key))

        try {
            if (args.num_aulas_dia === 0) {
                // Deletar o registro se existir
                if (args.rowId) {
                    const { error } = await supabase
                        .from('esp_grade_escola_ano')
                        .delete()
                        .eq('id', args.rowId)
                    if (error) throw error
                }
                // Atualiza state local removendo a célula
                setGradeMap(prev => {
                    const next = new Map(prev)
                    const serieMap = next.get(args.serie_id)
                    if (serieMap) {
                        const nextSerie = new Map(serieMap)
                        nextSerie.delete(`${args.dia_semana}|${args.turno}`)
                        next.set(args.serie_id, nextSerie)
                    }
                    return next
                })
            } else {
                // Upsert
                const payload: GradeInsert = {
                    escola_id: args.escola_id,
                    serie_id: args.serie_id,
                    instituicao_id: args.instituicao_id,
                    ano_letivo: args.ano_letivo,
                    dia_semana: args.dia_semana,
                    turno: args.turno,
                    num_aulas_dia: args.num_aulas_dia,
                }
                const { data, error } = await supabase
                    .from('esp_grade_escola_ano')
                    .upsert(payload, {
                        onConflict: 'escola_id,serie_id,ano_letivo,dia_semana,turno',
                    })
                    .select()
                    .single()

                if (error) throw error

                // Atualiza state local com o row retornado
                setGradeMap(prev => {
                    const next = new Map(prev)
                    if (!next.has(args.serie_id)) next.set(args.serie_id, new Map())
                    const nextSerie = new Map(next.get(args.serie_id)!)
                    nextSerie.set(`${args.dia_semana}|${args.turno}`, data)
                    next.set(args.serie_id, nextSerie)
                    return next
                })
            }
        } catch (err: unknown) {
            console.error('Erro ao salvar célula da grade:', err)
            toast.error('Falha ao salvar. Verifique e tente novamente.')
            await fetchGrade() // Resincroniza o estado visual
        } finally {
            setSaving(prev => {
                const next = new Set(prev)
                next.delete(key)
                return next
            })
        }
    }, [fetchGrade])

    return { gradeMap, loading, saving, upsertCelula, refresh: fetchGrade }
}
