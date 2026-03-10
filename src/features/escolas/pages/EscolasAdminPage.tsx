import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useEscolasAdmin, type EscolaAdmin } from '../hooks/useEscolasAdmin'
import { EscolaFormModal } from '../components/EscolaFormModal'

export default function EscolasAdminPage() {
    const { escolas, loading, error, fetchEscolas, createEscola, updateEscola, deleteEscola } = useEscolasAdmin()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingEscola, setEditingEscola] = useState<EscolaAdmin | null>(null)

    useEffect(() => {
        fetchEscolas()
    }, [fetchEscolas])

    const handleOpenModal = (escola?: EscolaAdmin) => {
        setEditingEscola(escola || null)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingEscola(null)
    }

    const handleSave = async (nome: string) => {
        if (editingEscola) {
            return await updateEscola(editingEscola.id, nome)
        } else {
            return await createEscola(nome)
        }
    }

    if (loading && escolas.length === 0) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-surface">
                <div className="h-8 w-8 rounded-full bg-brand/30 ring-1 ring-brand" />
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
                            <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
                                Escolas
                            </h1>
                            <p className="mt-2 text-sm text-text-muted">
                                Unidades vinculadas à instituição base.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleOpenModal()}
                            className="btn-primary"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nova Escola
                        </button>
                    </div>
                </header>

                <main>
                    {error && (
                        <div className="mb-6 rounded-xl bg-danger/10 border border-danger/20 p-4">
                            <p className="text-sm font-medium text-danger">{error}</p>
                        </div>
                    )}

                    {escolas.length === 0 && !error ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center bg-surface-raised/50">
                            <div className="rounded-full bg-surface-overlay p-4 shadow-sm ring-1 ring-border-subtle mb-4">
                                <svg className="h-8 w-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-text-primary">Nenhuma escola cadastrada</h3>
                            <p className="mt-2 text-sm text-text-muted max-w-sm mx-auto">
                                Comece adicionando unidades de ensino. Cada unidade agrupará professores, séries e disciplinas futuramente.
                            </p>
                            <button
                                onClick={() => handleOpenModal()}
                                className="mt-6 btn-primary shadow-lg"
                            >
                                Adicionar primeira escola
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {escolas.map((escola) => (
                                <div
                                    key={escola.id}
                                    className="group flex flex-col justify-between rounded-xl border border-border bg-surface-raised p-5 shadow-sm transition-all hover:shadow-md hover:border-border-subtle"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-overlay ring-1 ring-border-subtle text-text-secondary group-hover:text-brand transition-colors">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <h3 className="font-semibold text-text-primary break-all">
                                                {escola.nome}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-end gap-2 border-t border-border-subtle pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleOpenModal(escola)}
                                            className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-text-secondary hover:bg-surface-overlay hover:text-text-primary transition-colors focus:ring-2 focus:ring-brand focus:outline-none"
                                            title="Editar escola"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => deleteEscola(escola.id)}
                                            className="inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium text-danger hover:bg-danger/10 transition-colors focus:ring-2 focus:ring-danger focus:outline-none"
                                            title="Remover escola"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                <EscolaFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    escola={editingEscola}
                />
            </div>
        </div>
    )
}
