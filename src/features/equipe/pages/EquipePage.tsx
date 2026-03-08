import { useState } from 'react'
import { useEquipe } from '../hooks/useEquipe'
import { EquipeList } from '../components/EquipeList'
import { EquipeFormModal } from '../components/EquipeFormModal'
import type { EquipeMember } from '../types'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useProfile } from '@/hooks/useProfile'

export default function EquipePage() {
    const { profile } = useProfile()
    const { equipe, loading, error, createMember, updateMember, deleteMember } = useEquipe()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<EquipeMember | null>(null)
    const [anoLetivo, setAnoLetivo] = useState(new Date().getFullYear())

    const handleOpenModal = (member?: EquipeMember) => {
        setEditingMember(member || null)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingMember(null)
    }

    const handleSave = async (data: any) => {
        if (editingMember) {
            // O próprio hook agora separa "disciplinas" e lida com as tabelas relacionais em background
            return await updateMember(editingMember.id, data)
        } else {
            return await createMember(data)
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
                <h3 className="text-lg font-medium text-text-primary">Erro ao carregar equipe</h3>
                <p className="mt-1 text-sm text-text-muted">Tente recarregar a página.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-surface p-6 sm:p-10">
            <div className="mx-auto max-w-5xl space-y-8">
                {/* Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/50 pb-6 gap-4">
                    <div className="flex items-center gap-4">
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
                                Equipe Escolar
                            </h1>
                            <p className="mt-2 text-sm text-text-muted">
                                Gerencie os professores e diretores da sua instituição.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {profile?.role === 'Admin' && (
                            <Link
                                to={ROUTES.EQUIPE_LOTE}
                                className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary shadow-sm hover:bg-surface-overlay transition-all duration-300"
                            >
                                <svg className="-ml-1 mr-2 h-5 w-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Cadastro em Lote
                            </Link>
                        )}
                        <button
                            onClick={() => handleOpenModal()}
                            className="btn-primary"
                        >
                            <svg className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Novo Integrante
                        </button>
                    </div>
                </header>

                <main>
                    <EquipeList
                        equipe={equipe}
                        anoLetivo={anoLetivo}
                        onAnoLetivoChange={setAnoLetivo}
                        onEdit={handleOpenModal}
                        onDelete={deleteMember}
                    />
                </main>

                <EquipeFormModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    memberState={editingMember}
                />
            </div>
        </div>
    )
}
