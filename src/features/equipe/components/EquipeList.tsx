import { useState, useEffect, useMemo } from 'react'
import type { EquipeMember } from '../types'
import { supabase } from '@/config/supabase'

interface EquipeListProps {
    equipe: EquipeMember[]
    onEdit: (member: EquipeMember) => void
    onDelete: (id: string) => void
    anoLetivo: number
    onAnoLetivoChange: (ano: number) => void
}

export function EquipeList({ equipe, onEdit, onDelete, anoLetivo, onAnoLetivoChange }: EquipeListProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterEscola, setFilterEscola] = useState('todas')
    const [filterDisciplina, setFilterDisciplina] = useState('todas')
    const [escolasMap, setEscolasMap] = useState<Map<string, string[]>>(new Map())

    // Busca as escolas vinculadas a cada professor para o ano selecionado
    useEffect(() => {
        if (equipe.length === 0) return
        let mounted = true

        async function fetchLotacoes() {
            const { data, error } = await supabase
                .from('esp_professor_escola_ano')
                .select(`
                    professor_id,
                    ger_escolas_instituicao(nome)
                `)
                .eq('ano_letivo', String(anoLetivo))

            if (error || !data || !mounted) return

            const map = new Map<string, string[]>()
            for (const row of data) {
                const nome = (row.ger_escolas_instituicao as any)?.nome as string | undefined
                if (!nome) continue
                const list = map.get(row.professor_id) ?? []
                list.push(nome)
                map.set(row.professor_id, list)
            }
            setEscolasMap(map)
            // Reset escola filter when year changes
            setFilterEscola('todas')
        }

        fetchLotacoes()
        return () => { mounted = false }
    }, [anoLetivo, equipe])

    // Opções únicas para os selects
    const escolasOptions = useMemo(() => {
        const set = new Set<string>()
        escolasMap.forEach(nomes => nomes.forEach(n => set.add(n)))
        return Array.from(set).sort()
    }, [escolasMap])

    const disciplinasOptions = useMemo(() => {
        const set = new Set<string>()
        equipe.forEach(m => m.disciplinas?.forEach(d => set.add(d)))
        return Array.from(set).sort()
    }, [equipe])

    // Filtragem combinada
    const filteredEquipe = useMemo(() => equipe.filter(member => {
        const term = searchTerm.toLowerCase()
        const matchSearch =
            member.nome_completo.toLowerCase().includes(term) ||
            (member.disciplinas?.some(d => d.toLowerCase().includes(term)) ?? false)

        const escolas = escolasMap.get(member.id) ?? []
        const matchEscola = filterEscola === 'todas' || escolas.includes(filterEscola)

        const matchDisciplina =
            filterDisciplina === 'todas' ||
            (member.disciplinas?.includes(filterDisciplina) ?? false)

        return matchSearch && matchEscola && matchDisciplina
    }), [equipe, searchTerm, filterEscola, filterDisciplina, escolasMap])

    if (equipe.length === 0) {
        return (
            <div className="card !border-dashed !shadow-none flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand-muted ring-1 ring-brand-hover/20 mb-4">
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-text-primary">Nenhum membro cadastrado</h3>
                <p className="mt-1 text-sm text-text-muted max-w-sm">
                    Adicione professores e diretores para compor a equipe desta instituição.
                </p>
            </div>
        )
    }

    return (
        <div className="card shadow-sm">
            {/* Filtros dentro do card */}
            <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border-subtle/50 bg-surface-raised/30">
                {/* Ano letivo */}
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium text-text-muted whitespace-nowrap">Ano letivo</span>
                    <input
                        type="number"
                        value={anoLetivo}
                        onChange={e => onAnoLetivoChange(Number(e.target.value))}
                        min={2020}
                        max={2099}
                        className="input-base input-default w-24 text-center text-sm"
                    />
                </div>

                <div className="w-px bg-border-subtle hidden sm:block" />

                {/* Busca */}
                <div className="relative flex-1 min-w-0">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="h-4 w-4 text-text-muted" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Buscar membro da equipe..."
                        className="input-base input-default w-full pl-10"
                    />
                </div>

                {/* Filtro escola */}
                <select
                    value={filterEscola}
                    onChange={e => setFilterEscola(e.target.value)}
                    className="input-base input-default sm:w-52 bg-surface cursor-pointer"
                >
                    <option value="todas">Todas as escolas</option>
                    {escolasOptions.map(escola => (
                        <option key={escola} value={escola}>{escola}</option>
                    ))}
                </select>

                {/* Filtro disciplina */}
                <select
                    value={filterDisciplina}
                    onChange={e => setFilterDisciplina(e.target.value)}
                    className="input-base input-default sm:w-52 bg-surface cursor-pointer"
                >
                    <option value="todas">Todas as disciplinas</option>
                    {disciplinasOptions.map(disc => (
                        <option key={disc} value={disc}>{disc}</option>
                    ))}
                </select>
            </div>

            {/* List */}
            <ul className="divide-y divide-border-subtle/50">
                {filteredEquipe.map((member) => {
                    const escolas = escolasMap.get(member.id) ?? []
                    return (
                        <li key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 hover:bg-surface-overlay/40 transition-colors gap-4">
                            {/* LEFT — nome + disciplinas */}
                            <div className="flex items-center space-x-4 sm:w-2/5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand-muted ring-1 ring-brand-hover/20 font-bold">
                                    {member.nome_completo.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-text-primary flex items-center gap-2">
                                        {member.nome_completo}
                                        {member.diretor_escola_id && (
                                            <span className="inline-flex items-center rounded-md bg-brand-subtle/20 px-2 py-0.5 text-xs font-medium text-brand-muted ring-1 ring-inset ring-brand-hover/30">
                                                Diretor
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-sm text-text-muted flex items-center gap-2 mt-0.5">
                                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                        <span className="truncate max-w-xs">
                                            {member.disciplinas && member.disciplinas.length > 0
                                                ? member.disciplinas.join(', ')
                                                : <span className="italic text-text-muted/60">Sem disciplinas</span>
                                            }
                                        </span>
                                        <span className="text-border mx-1">•</span>
                                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        {member.numero_aulas_semanais} aulas / sem
                                    </p>
                                </div>
                            </div>

                            {/* CENTER — escolas do ano */}
                            <div className="sm:w-1/4 sm:text-center">
                                {escolas.length > 0 ? (
                                    <div className="flex flex-col gap-1">
                                        {escolas.map((escola) => (
                                            <span
                                                key={escola}
                                                className="inline-flex items-center gap-1 text-sm text-text-secondary"
                                            >
                                                <svg className="w-3.5 h-3.5 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                                {escola}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            {/* RIGHT — actions */}
                            <div className="flex items-center justify-end space-x-3 shrink-0">
                                <button
                                    onClick={() => onEdit(member)}
                                    className="text-sm font-medium text-brand-muted hover:text-brand transition-colors px-3 py-1.5 rounded-md hover:bg-brand/10"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Tem certeza que deseja remover este membro da equipe?')) {
                                            onDelete(member.id)
                                        }
                                    }}
                                    className="text-sm font-medium text-danger/70 hover:text-danger transition-colors px-3 py-1.5 rounded-md hover:bg-danger/10"
                                >
                                    Excluir
                                </button>
                            </div>
                        </li>
                    )
                })}
                {filteredEquipe.length === 0 && (
                    <li className="p-6 text-center text-sm text-text-muted">
                        Nenhum membro encontrado com os filtros aplicados.
                    </li>
                )}
            </ul>
        </div>
    )
}
