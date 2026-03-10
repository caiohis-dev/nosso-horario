import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSeries } from '../hooks/useSeries'
import { Input } from '@/components/Input'

export default function SeriesPage() {
    const { series, loading, error, createSerie, deleteSerie, updateSerie } = useSeries()
    const [novaSerie, setNovaSerie] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!novaSerie.trim()) return

        setIsSubmitting(true)
        const res = await createSerie(novaSerie.trim())
        if (res.success) setNovaSerie('')
        setIsSubmitting(false)
    }

    const handleStartEdit = (id: string, currentName: string) => {
        setEditingId(id)
        setEditName(currentName)
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditName('')
    }

    const handleSaveEdit = async (id: string) => {
        if (!editName.trim()) return

        const res = await updateSerie(id, editName.trim())
        if (res.success) {
            setEditingId(null)
            setEditName('')
        }
    }

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-brand/30 ring-1 ring-brand" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex h-64 flex-col items-center justify-center text-center">
                <div className="rounded-full bg-danger/10 p-3 text-danger mb-4">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-text-primary">Erro ao carregar séries</h3>
                <p className="mt-1 text-sm text-text-muted">Tente recarregar a página.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-surface p-6 sm:p-10">
            <div className="mx-auto max-w-4xl space-y-8">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 pb-6 gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                        <Link
                            to="/dashboard"
                            className="flex shrink-0 h-10 w-10 items-center justify-center rounded-full bg-surface-raised text-text-muted ring-1 ring-border-subtle hover:text-text-primary hover:bg-surface-overlay transition-all"
                            title="Voltar ao Dashboard"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                                Séries Ensinadas
                            </h1>
                            <p className="mt-2 text-sm text-text-muted">
                                Gerencie a nomenclatura das Séries ou Anos Escolares (ex: 6º Ano Base, 1º Ano Ens. Médio).
                            </p>
                        </div>
                    </div>
                </header>

                <main className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Panel Esquerdo - Adicionar nova */}
                    <div className="card p-6 md:col-span-1 border border-border-subtle shadow-lg">
                        <h2 className="text-lg font-semibold text-text-primary mb-4">Nova Série</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <Input
                                label="Nome/Referência da Série"
                                placeholder="Ex: 6º Ano"
                                value={novaSerie}
                                onChange={(e) => setNovaSerie(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex justify-center items-center rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-text-primary shadow-sm hover:bg-brand-hover ring-1 ring-inset ring-brand-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Adicionar
                            </button>
                        </form>
                    </div>

                    {/* Panel Direito - Lista */}
                    <div className="card md:col-span-2 overflow-hidden border border-border-subtle shadow-lg">
                        {series.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="rounded-full bg-surface-overlay p-4 text-text-muted mb-4 ring-1 ring-border-subtle shadow-inner">
                                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-text-primary">Nenhuma série cadastrada</h3>
                                <p className="mt-2 text-sm text-text-muted max-w-sm">
                                    Adicione as divisões do ano letivo de sua instituição para habilitar a alocação de turmas e horários.
                                </p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-border-subtle">
                                {series.map((serie) => (
                                    <li key={serie.id} className="flex items-center justify-between p-4 hover:bg-surface-raised transition-colors group">
                                        {editingId === serie.id ? (
                                            <div className="flex items-center gap-3 w-full">
                                                <input
                                                    className="input-base input-default flex-1"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={() => handleSaveEdit(serie.id)}
                                                    disabled={!editName.trim()}
                                                    className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors flex-shrink-0"
                                                    title="Salvar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="p-2 text-text-muted hover:bg-surface-overlay rounded-lg transition-colors flex-shrink-0"
                                                    title="Cancelar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium text-text-primary px-3 py-1 bg-surface-overlay rounded-md ring-1 ring-border-subtle/50">
                                                        {serie.nome}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleStartEdit(serie.id, serie.nome)}
                                                        className="p-2 text-text-muted hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                                                        title="Editar"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm('Excluir esta série apagará instâncias vinculadas. Confirma?')) {
                                                                deleteSerie(serie.id)
                                                            }
                                                        }}
                                                        className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                                        title="Excluir"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}
