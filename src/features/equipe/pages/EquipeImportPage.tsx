import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { Dropzone } from '@/components/Dropzone'
import { useExcelParser } from '../hooks/useExcelParser'
import { toast } from 'sonner'
import { supabase } from '@/config/supabase'

interface DBDisciplina {
    id: string
    nome: string
}

interface DBEscola {
    id: string
    nome: string
}

interface MappedProfessor {
    nome_completo: string
    email: string
    telefone: string
    matricula: string
    numero_aulas_semanais: number
    diretor_escola_id: null
    data_admissao: string
    data_demissao: null
    password: string
    disciplinas: string[]
    escolas: string[]
    ano_letivo: string
}

// Expected table fields
const DB_FIELDS = [
    { key: 'nome_completo', label: 'Nome Completo', required: true },
    { key: 'email', label: 'E-mail', required: true },
    { key: 'password', label: 'Senha Inicial', required: true },
    { key: 'telefone', label: 'Telefone', required: false },
    { key: 'matricula', label: 'Matrícula', required: false },
    { key: 'data_admissao', label: 'Data de Admissão', required: false },
    { key: 'numero_aulas_semanais', label: 'Carga Horária Semanal', required: false },
    { key: 'disciplina', label: 'Disciplina(s)', required: false },
    { key: 'escola', label: 'Escola(s)', required: false },
]

type RegistroStatus = 'pending' | 'processing' | 'success' | 'skipped' | 'error'

interface ImportProgress {
    nome: string
    email: string
    status: RegistroStatus
    mensagem?: string
}

export default function EquipeImportPage() {
    const { isParsing, parseResult, parseExcel, resetParser } = useExcelParser()
    const [isImporting, setIsImporting] = useState(false)

    // UI flow control
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1)

    const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})

    // Step 3 specific state
    const [dbDisciplinas, setDbDisciplinas] = useState<DBDisciplina[]>([])
    const [extractedRawDisciplinas, setExtractedRawDisciplinas] = useState<string[]>([])
    const [disciplinaMapping, setDisciplinaMapping] = useState<Record<string, string>>({})

    const [dbEscolas, setDbEscolas] = useState<DBEscola[]>([])
    const [extractedRawEscolas, setExtractedRawEscolas] = useState<string[]>([])
    const [escolaMapping, setEscolaMapping] = useState<Record<string, string>>({})
    const [anoLetivo, setAnoLetivo] = useState<string>(new Date().getFullYear().toString())

    // Step 5 specific state
    const [colunaConferencia, setColunaConferencia] = useState<string>('')

    // Step 6: progresso de importação registro a registro
    const [importProgress, setImportProgress] = useState<ImportProgress[]>([])

    const handleFileAccepted = (file: File) => {
        parseExcel(file)
        setCurrentStep(2)
    }

    const resetFlow = () => {
        setColumnMapping({})
        setDisciplinaMapping({})
        setEscolaMapping({})
        setAnoLetivo(new Date().getFullYear().toString())
        setColunaConferencia('')
        setImportProgress([])
        setCurrentStep(1)
        resetParser()
    }

    // Fetch real disciplines when appropriate
    const loadDisciplines = async () => {
        try {
            const { data, error } = await supabase.from('ger_disciplinas').select('id, nome').order('nome')
            if (error) throw error
            setDbDisciplinas(data || [])
        } catch (error) {
            console.error('Erro ao carregar disciplinas base', error)
            toast.error('Não foi possível carregar o banco de disciplinas')
        }
    }

    const loadEscolas = async () => {
        try {
            const { data, error } = await supabase.from('ger_escolas_instituicao').select('id, nome').order('nome')
            if (error) throw error
            setDbEscolas(data || [])
        } catch (error) {
            console.error('Erro ao carregar escolas base', error)
            toast.error('Não foi possível carregar o banco de escolas')
        }
    }

    const goToStep3 = () => {
        if (!parseResult?.data) return

        // Validate essentials
        const missingRequired = DB_FIELDS.filter(f => f.required && !columnMapping[f.key])
        if (missingRequired.length > 0) {
            toast.error(`Mapeie as colunas obrigatórias: ${missingRequired.map(f => f.label).join(', ')}`)
            return
        }

        // Se o usuário mapeou a coluna de disciplina, precisamos extrair
        if (columnMapping.disciplina) {
            loadDisciplines()

            // Extract unique values from the tracked column rows (handling comma separated values)
            const rawItems = new Set<string>()
            const discCol = columnMapping.disciplina

            parseResult.data.forEach(row => {
                const cell = row[discCol]
                if (cell) {
                    const splitted = String(cell).split(',').map(s => s.trim()).filter(Boolean)
                    splitted.forEach(s => rawItems.add(s))
                }
            })
            setExtractedRawDisciplinas(Array.from(rawItems))
        }

        // Preparamos também as Escolas (Indo para o Step 4 futuramente)
        if (columnMapping.escola) {
            loadEscolas()

            const rawItemsEscolas = new Set<string>()
            const escCol = columnMapping.escola

            parseResult.data.forEach(row => {
                const cell = row[escCol]
                if (cell) {
                    const splitted = String(cell).split(',').map(s => s.trim()).filter(Boolean)
                    splitted.forEach(s => rawItemsEscolas.add(s))
                }
            })
            setExtractedRawEscolas(Array.from(rawItemsEscolas))
        }

        setCurrentStep(3)
    }

    const goToStep4 = () => {
        setCurrentStep(4)
    }

    const goToStep5 = () => {
        setCurrentStep(5)
    }

    // Monta o array de MappedProfessor a partir do parseResult e dos mapeamentos selecionados
    const buildMappedRows = (): MappedProfessor[] => {
        if (!parseResult?.data) return []
        return parseResult.data.map((row) => {
            let data_admissao = new Date().toISOString().split('T')[0]
            if (columnMapping.data_admissao && row[columnMapping.data_admissao]) {
                const rawVal = row[columnMapping.data_admissao]
                if (rawVal instanceof Date) {
                    data_admissao = rawVal.toISOString().split('T')[0]
                } else if (typeof rawVal === 'number') {
                    const excelEpoch = new Date(Date.UTC(1899, 11, 30))
                    const actualDate = new Date(excelEpoch.getTime() + rawVal * 86400000)
                    data_admissao = actualDate.toISOString().split('T')[0]
                } else {
                    const parsedStr = String(rawVal).trim()
                    if (parsedStr.includes('/')) {
                        const parts = parsedStr.split('/')
                        if (parts.length === 3) {
                            const [d, m, y] = parts
                            data_admissao = `${y.length === 2 ? '20' + y : y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
                        } else {
                            data_admissao = parsedStr
                        }
                    } else {
                        data_admissao = parsedStr
                    }
                }
            }
            return {
                nome_completo: columnMapping.nome_completo ? String(row[columnMapping.nome_completo] || '') : '',
                email: columnMapping.email ? String(row[columnMapping.email] || '') : '',
                telefone: columnMapping.telefone ? String(row[columnMapping.telefone] || '') : '',
                matricula: columnMapping.matricula ? String(row[columnMapping.matricula] || '') : '',
                numero_aulas_semanais: columnMapping.numero_aulas_semanais ? Number(row[columnMapping.numero_aulas_semanais]) || 0 : 0,
                diretor_escola_id: null,
                data_admissao,
                data_demissao: null,
                password: columnMapping.password ? String(row[columnMapping.password] || '') : 'changeMe123*',
                disciplinas: (() => {
                    if (!columnMapping.disciplina) return []
                    const rawCell = String(row[columnMapping.disciplina] || '')
                    if (!rawCell) return []
                    return rawCell.split(',').map(d => d.trim()).filter(Boolean)
                        .map(name => disciplinaMapping[name])
                        .filter(Boolean)
                })(),
                escolas: (() => {
                    if (!columnMapping.escola) return []
                    const rawCell = String(row[columnMapping.escola] || '')
                    if (!rawCell) return []
                    return rawCell.split(',').map(d => d.trim()).filter(Boolean)
                        .map(name => escolaMapping[name])
                        .filter(Boolean)
                })(),
                ano_letivo: anoLetivo
            }
        })
    }

    // Loop sequencial: insere registro a registro via Edge Function
    const handleRunImport = async () => {
        const mappedRows = buildMappedRows()
        if (mappedRows.length === 0) return

        // Inicializa o progresso com todos os registros como 'pending'
        const initialProgress: ImportProgress[] = mappedRows.map(p => ({
            nome: p.nome_completo,
            email: p.email,
            status: 'pending'
        }))
        setImportProgress(initialProgress)
        setCurrentStep(6)
        setIsImporting(true)

        // Precisamos de uma cópia local do progresso para atualizar atomicamente por index
        const progressSnapshot = [...initialProgress]

        for (let i = 0; i < mappedRows.length; i++) {
            const prof = mappedRows[i]

            // Marca o registro atual como 'processing'
            progressSnapshot[i] = { ...progressSnapshot[i], status: 'processing' }
            setImportProgress([...progressSnapshot])

            try {
                const { data, error } = await supabase.functions.invoke('create-teacher', {
                    body: prof
                })

                if (error) throw error

                // A Edge Function retorna 409 se for duplicata
                if (data?.error) {
                    const isDuplicate = data.error.includes('já está sendo utilizado')
                    progressSnapshot[i] = {
                        ...progressSnapshot[i],
                        status: isDuplicate ? 'skipped' : 'error',
                        mensagem: data.error
                    }
                } else {
                    progressSnapshot[i] = { ...progressSnapshot[i], status: 'success' }
                }
            } catch (err: unknown) {
                const mensagem = err instanceof Error ? err.message : 'Erro desconhecido'
                progressSnapshot[i] = { ...progressSnapshot[i], status: 'error', mensagem }
            }

            setImportProgress([...progressSnapshot])
        }

        setIsImporting(false)

        const totals = progressSnapshot.reduce(
            (acc, r) => {
                acc[r.status] = (acc[r.status] ?? 0) + 1
                return acc
            },
            {} as Record<RegistroStatus, number>
        )
        toast.success(`Lote concluído: ${totals.success ?? 0} inseridos, ${totals.skipped ?? 0} ignorados, ${totals.error ?? 0} erros.`)
    }

    return (
        <div className="min-h-screen bg-surface p-6 sm:p-10">
            <div className="mx-auto max-w-5xl space-y-8">
                {/* Progress Stepper Roadmap */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 pb-6 gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                        <Link
                            to={ROUTES.EQUIPE}
                            className="flex shrink-0 h-10 w-10 items-center justify-center rounded-full bg-surface-raised text-text-muted ring-1 ring-border-subtle hover:text-text-primary hover:bg-surface-overlay transition-all"
                            title="Voltar"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                                Importar Equipe
                            </h1>
                            <p className="mt-2 text-sm text-text-muted">
                                Adicione dezenas de professores usando uma planilha base.
                            </p>
                        </div>
                    </div>
                    {/* Botão Superior Direito Dinâmico */}
                    {currentStep === 2 && (
                        <button
                            onClick={goToStep3}
                            className="btn-primary w-full sm:w-auto px-8"
                        >
                            Avançar: Pareamento de Disciplinas
                        </button>
                    )}
                    {currentStep === 3 && (
                        <button
                            onClick={goToStep4}
                            className="btn-primary w-full sm:w-auto px-8"
                        >
                            Avançar: Pareamento Escolas
                        </button>
                    )}
                    {currentStep === 4 && (
                        <button
                            onClick={goToStep5}
                            className="btn-primary w-full sm:w-auto px-8"
                        >
                            Avançar: Conferência
                        </button>
                    )}
                    {currentStep === 5 && (
                        <button
                            onClick={handleRunImport}
                            disabled={isImporting}
                            className="btn-primary w-full sm:w-auto px-8"
                        >
                            {isImporting ? 'Importando...' : 'Iniciar Importação'}
                        </button>
                    )}
                </header>

                <main className="space-y-8">
                    {/* Progress Stepper Roadmap */}
                    <nav aria-label="Progress" className="hidden sm:block">
                        <ol role="list" className="flex items-center rounded-xl border border-border bg-surface-overlay px-6 py-4 shadow-sm">
                            {[
                                { id: 1, title: 'Upload', desc: 'Envio da Planilha' },
                                { id: 2, title: 'Mapeamento', desc: 'Dados Pessoais' },
                                { id: 3, title: 'Disciplinas', desc: 'Matérias' },
                                { id: 4, title: 'Escolas', desc: 'Lotação' },
                                { id: 5, title: 'Conferência', desc: 'Prevenção de Duplicatas' },
                            ].map((step, stepIdx) => (
                                <li key={step.title} className={`relative pr-8 sm:pr-10 ${stepIdx !== 4 ? 'flex-1' : ''}`}>
                                    <div className="flex items-center">
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 
                                                ${currentStep > step.id ? 'border-brand bg-brand text-white' :
                                                    currentStep === step.id ? 'border-brand bg-surface text-brand' :
                                                        'border-border-subtle bg-surface text-text-muted'}`}
                                        >
                                            {currentStep > step.id ? (
                                                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            ) : (
                                                <span className="text-sm font-bold">{step.id}</span>
                                            )}
                                        </div>
                                        <div className="ml-4 flex flex-col">
                                            <span className={`text-xs font-bold uppercase tracking-wider ${currentStep >= step.id ? 'text-brand' : 'text-text-muted'}`}>
                                                {step.title}
                                            </span>
                                            <span className="text-sm font-medium text-text-secondary">{step.desc}</span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </nav>

                    {/* Stage 1: Upload */}
                    {currentStep === 1 && (
                        <div className="w-full">
                            <Dropzone
                                onFileAccepted={handleFileAccepted}
                                title={isParsing ? 'Verificando as células...' : 'Arraste sua planilha (.xlsx) de RH aqui'}
                                description="O sistema lerá os cabeçalhos automaticamente."
                            />
                            <div className="mt-6 rounded-lg bg-surface-overlay border border-border-subtle p-5 w-full">
                                <h3 className="text-sm font-semibold text-text-primary">Dicas de formato:</h3>
                                <ul className="mt-2 list-inside list-disc text-sm text-text-muted space-y-1">
                                    <li>Mantenha a primeira linha exclusivamente para os <b>títulos</b> das colunas.</li>
                                    <li>Assegure-se de que não haja células mescladas na tabela.</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Stage 2: Mapeamento de Coluna */}
                    {currentStep === 2 && parseResult && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-surface-raised">
                                <div>
                                    <h2 className="text-lg font-semibold text-text-primary">
                                        Perfeito! Lemos {parseResult.totalRows} linhas e {parseResult.headers.length} colunas.
                                    </h2>
                                    <p className="text-sm text-text-muted mt-1">
                                        Associe quais colunas lidas do seu arquivo Excel correspondem aos Campos de Banco obrigatórios do sistema escolar.
                                    </p>
                                </div>
                            </div>

                            {/* Mapping Interface */}
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {DB_FIELDS.map((field) => (
                                    <div key={field.key} className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-surface-overlay">
                                        <label htmlFor={field.key} className="text-sm font-medium text-text-primary flex items-center justify-between">
                                            {field.label}
                                            {field.required && <span className="text-xs text-danger font-bold">*Obrigatório</span>}
                                        </label>
                                        <select
                                            id={field.key}
                                            value={columnMapping[field.key] || ''}
                                            onChange={(e) => setColumnMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                                        >
                                            <option value="">-- Ignorar ou Não Mapear --</option>
                                            {parseResult.headers.map((h, i) => (
                                                <option key={i} value={h}>
                                                    Coluna: "{h}"
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>

                            {/* Footer do Estagio 2 */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border-subtle">
                                <button
                                    onClick={resetFlow}
                                    disabled={isImporting}
                                    className="inline-flex items-center text-text-muted hover:text-text-primary text-sm font-medium transition-colors"
                                >
                                    ← Voltar/Trocar Planilha
                                </button>
                                {/* O botão Avançar subiu para a cabeça da tela */}
                            </div>
                        </div>
                    )}

                    {/* Stage 3: Resolvendo Foreign Keys de Disciplinas */}
                    {currentStep === 3 && parseResult && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-surface-raised">
                                <div>
                                    <h2 className="text-lg font-semibold text-text-primary">
                                        Última etapa: Resolução de Disciplinas
                                    </h2>
                                    <p className="text-sm text-text-muted mt-1">
                                        Identificamos {extractedRawDisciplinas.length} tipos de disciplinas na coluna que você escolheu.
                                        Vincule cada texto lido do excel à matéria Oficial já registrada no nosso Banco de Dados de Ensino.
                                    </p>
                                </div>
                            </div>

                            {/* Mapping Interface Disciplinas */}
                            {extractedRawDisciplinas.length > 0 ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {extractedRawDisciplinas.map((rawDiscName, index) => (
                                        <div key={index} className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-surface-overlay">
                                            <label className="text-sm font-medium text-text-primary truncate" title={rawDiscName}>
                                                Lido: <span className="font-bold text-brand">"{rawDiscName}"</span>
                                            </label>
                                            <select
                                                value={disciplinaMapping[rawDiscName] || ''}
                                                onChange={(e) => setDisciplinaMapping(prev => ({ ...prev, [rawDiscName]: e.target.value }))}
                                                className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                                            >
                                                <option value="">-- Ignorar (Não cadastrar matéria) --</option>
                                                {dbDisciplinas.map((dbd) => (
                                                    <option key={dbd.id} value={dbd.id}>
                                                        Mapear para: {dbd.nome}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 px-6 rounded-xl border border-dashed border-border bg-surface-overlay">
                                    <h3 className="text-lg font-medium text-text-primary">Nenhuma disciplina a ser mapeada.</h3>
                                    <p className="mt-1 text-sm text-text-muted">A coluna de Disciplinas estava vazia ou você indicou que os professores não tem matérias associadas nesta planilha.</p>
                                </div>
                            )}

                            {/* Footer do Estágio 3 */}
                            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-8 pt-6 border-t border-border-subtle">
                                <button
                                    onClick={() => setCurrentStep(2)}
                                    disabled={isImporting}
                                    className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-text-primary hover:bg-surface-overlay disabled:opacity-50"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={goToStep4}
                                    className="btn-primary w-full sm:w-[320px] py-3 text-base shadow-lg"
                                >
                                    Avançar: Pareamento Escolas
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Stage 4: Resolvendo Foreign Keys de Escolas */}
                    {currentStep === 4 && parseResult && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-surface-raised">
                                <div>
                                    <h2 className="text-lg font-semibold text-text-primary">
                                        Última etapa: Lotação nas Escolas
                                    </h2>
                                    <p className="text-sm text-text-muted mt-1">
                                        Identificamos {extractedRawEscolas.length} tipos de escolas na coluna que você escolheu.
                                        Vincule cada texto lido do excel à Escola Oficial já registrada na instituição.
                                    </p>
                                </div>
                                <div className="shrink-0 w-full sm:w-48 flex flex-col gap-1">
                                    <label htmlFor="anoLetivo" className="text-sm font-medium text-text-primary">
                                        Vincular ao ano letivo:
                                    </label>
                                    <select
                                        id="anoLetivo"
                                        value={anoLetivo}
                                        onChange={(e) => setAnoLetivo(e.target.value)}
                                        className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                                    >
                                        <option value={(new Date().getFullYear() - 1).toString()}>{new Date().getFullYear() - 1}</option>
                                        <option value={(new Date().getFullYear()).toString()}>{new Date().getFullYear()}</option>
                                        <option value={(new Date().getFullYear() + 1).toString()}>{new Date().getFullYear() + 1}</option>
                                    </select>
                                </div>
                            </div>

                            {/* Mapping Interface Escolas */}
                            {extractedRawEscolas.length > 0 ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {extractedRawEscolas.map((rawEscName, index) => (
                                        <div key={index} className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-surface-overlay">
                                            <label className="text-sm font-medium text-text-primary truncate" title={rawEscName}>
                                                Lido: <span className="font-bold text-brand">"{rawEscName}"</span>
                                            </label>
                                            <select
                                                value={escolaMapping[rawEscName] || ''}
                                                onChange={(e) => setEscolaMapping(prev => ({ ...prev, [rawEscName]: e.target.value }))}
                                                className="w-full rounded-md border border-border-subtle bg-surface px-3 py-2 text-sm text-text-primary shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                                            >
                                                <option value="">-- Ignorar (Sem lotação inicial) --</option>
                                                {dbEscolas.map((dbe) => (
                                                    <option key={dbe.id} value={dbe.id}>
                                                        Mapear para: {dbe.nome}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 px-6 rounded-xl border border-dashed border-border bg-surface-overlay">
                                    <h3 className="text-lg font-medium text-text-primary">Nenhuma lotação escolar a ser mapeada.</h3>
                                    <p className="mt-1 text-sm text-text-muted">A coluna de Escolas estava vazia ou os professores não têm vínculos nas planilhas de origem.</p>
                                </div>
                            )}

                            {/* Footer do Estágio 4 */}
                            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-8 pt-6 border-t border-border-subtle">
                                <button
                                    onClick={() => setCurrentStep(3)}
                                    disabled={isImporting}
                                    className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-text-primary hover:bg-surface-overlay disabled:opacity-50"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={goToStep5}
                                    className="btn-primary w-full sm:w-[320px] py-3 text-base shadow-lg"
                                >
                                    Avançar: Conferência Final
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Stage 5: Prevenção de Duplicatas e Conferência */}
                    {currentStep === 5 && parseResult && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-surface-raised">
                                <div>
                                    <h2 className="text-lg font-semibold text-text-primary">
                                        Última etapa: Regra de Duplicidade
                                    </h2>
                                    <p className="text-sm text-text-muted mt-1">
                                        Como o sistema deve identificar se um professor já existe para evitar duplicações no banco de dados da instituição?
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="flex flex-col gap-2 p-6 rounded-xl border border-border bg-surface-overlay">
                                    <label htmlFor="colunaConferencia" className="text-sm font-semibold text-text-primary">
                                        Coluna Chave para Verificação
                                    </label>
                                    <p className="text-sm text-text-muted mb-4">
                                        Escolha um <b>Dado Pessoal Único</b> que sirva como documento identificador (ex: CPF, Matrícula ou E-mail). Se o banco encontrar o valor selecionado já cadastrado, a linha será ignorada na importação.
                                    </p>
                                    <select
                                        id="colunaConferencia"
                                        value={colunaConferencia}
                                        onChange={(e) => setColunaConferencia(e.target.value)}
                                        className="w-full rounded-md border border-border-subtle bg-surface px-4 py-3 text-sm text-text-primary shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                                    >
                                        <option value="">-- Ignorar Prevenção (Importar tudo) --</option>
                                        {Object.entries(columnMapping)
                                            .filter(([_, mappedExcelCol]) => Boolean(mappedExcelCol))
                                            .map(([dbKey, mappedExcelCol]) => {
                                                const fieldLabel = DB_FIELDS.find(f => f.key === dbKey)?.label || dbKey;
                                                return (
                                                    <option key={dbKey} value={dbKey}>
                                                        Validar pela coluna: {fieldLabel} (Planilha: "{mappedExcelCol}")
                                                    </option>
                                                )
                                            })}
                                    </select>
                                </div>
                            </div>

                            {/* Footer do Estágio 5 */}
                            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-8 pt-6 border-t border-border-subtle">
                                <button
                                    onClick={() => setCurrentStep(4)}
                                    disabled={isImporting}
                                    className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-6 py-3 text-sm font-semibold text-text-primary hover:bg-surface-overlay disabled:opacity-50"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={handleRunImport}
                                    disabled={isImporting}
                                    className="btn-primary w-full sm:w-[320px] py-3 text-base shadow-lg"
                                >
                                    {isImporting ? (
                                        <>
                                            <svg className="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Importando...
                                        </>
                                    ) : (
                                        'Iniciar Importação do Lote'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Stage 6: Execução Progressiva */}
                    {currentStep === 6 && importProgress.length > 0 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Header com progresso */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-border bg-surface-raised">
                                <div>
                                    <h2 className="text-lg font-semibold text-text-primary">
                                        Importando Equipe
                                    </h2>
                                    <p className="text-sm text-text-muted mt-1">
                                        {importProgress.filter(r => r.status === 'success' || r.status === 'skipped' || r.status === 'error').length} de {importProgress.length} registros processados
                                    </p>
                                </div>
                                {/* Barra de Progresso */}
                                <div className="w-full sm:w-64">
                                    <div className="h-2 rounded-full bg-surface-overlay overflow-hidden">
                                        <div
                                            className="h-2 rounded-full bg-brand transition-all duration-300"
                                            style={{ width: `${(importProgress.filter(r => r.status !== 'pending').length / importProgress.length) * 100}%` }}
                                        />
                                    </div>
                                    <div className="mt-2 flex gap-4 text-xs text-text-muted">
                                        <span className="text-success">✓ {importProgress.filter(r => r.status === 'success').length} inseridos</span>
                                        <span className="text-text-muted">⏭ {importProgress.filter(r => r.status === 'skipped').length} ignorados</span>
                                        <span className="text-danger">✕ {importProgress.filter(r => r.status === 'error').length} erros</span>
                                    </div>
                                </div>
                            </div>

                            {/* Lista de Registros */}
                            <div className="rounded-xl border border-border bg-surface-overlay overflow-hidden shadow-sm">
                                <ul className="divide-y divide-border-subtle">
                                    {importProgress.map((item, idx) => (
                                        <li key={idx} className="flex items-center gap-4 px-5 py-3">
                                            {/* Indicador de Status */}
                                            <div className="shrink-0 w-6 flex items-center justify-center">
                                                {item.status === 'pending' && (
                                                    <span className="h-2 w-2 rounded-full bg-border" />
                                                )}
                                                {item.status === 'processing' && (
                                                    <svg className="h-4 w-4 animate-spin text-brand" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                )}
                                                {item.status === 'success' && (
                                                    <svg className="h-4 w-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                                {item.status === 'skipped' && (
                                                    <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                )}
                                                {item.status === 'error' && (
                                                    <svg className="h-4 w-4 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* Info do Professor */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-text-primary truncate">{item.nome || '(sem nome)'}</p>
                                                <p className="text-xs text-text-muted truncate">{item.email}</p>
                                            </div>

                                            {/* Mensagem de Status */}
                                            <div className="shrink-0 text-right">
                                                {item.status === 'pending' && <span className="text-xs text-text-muted">Aguardando...</span>}
                                                {item.status === 'processing' && <span className="text-xs text-brand font-medium">Processando...</span>}
                                                {item.status === 'success' && <span className="text-xs text-success font-medium">Criado</span>}
                                                {item.status === 'skipped' && <span className="text-xs text-text-muted">Ignorado (duplicata)</span>}
                                                {item.status === 'error' && <span className="text-xs text-danger truncate max-w-[180px]" title={item.mensagem}>{item.mensagem ?? 'Erro'}</span>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Footer */}
                            {!isImporting && (
                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={resetFlow}
                                        className="btn-primary px-8"
                                    >
                                        Concluir e Nova Importação
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}
