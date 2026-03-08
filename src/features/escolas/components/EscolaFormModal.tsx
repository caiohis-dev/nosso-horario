import { useState, useEffect } from 'react'
import type { EscolaAdmin } from '../hooks/useEscolasAdmin'

interface EscolaFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (nome: string) => Promise<boolean>
    escola: EscolaAdmin | null
}

export function EscolaFormModal({ isOpen, onClose, onSave, escola }: EscolaFormModalProps) {
    const [nome, setNome] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setNome(escola?.nome || '')
        }
    }, [isOpen, escola])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!nome.trim()) return

        setIsSaving(true)
        const success = await onSave(nome.trim())
        setIsSaving(false)

        if (success) {
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Panel */}
            <div className="relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-surface-raised shadow-2xl transition-all">
                <div className="border-b border-border/50 px-6 py-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-text-primary">
                        {escola ? 'Editar Escola' : 'Nova Escola'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-text-muted hover:bg-surface-overlay hover:text-text-primary transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="nome" className="block text-sm font-medium text-text-primary">
                            Nome da Unidade Escolar
                        </label>
                        <input
                            type="text"
                            id="nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Ex: Escola Estadual Machado de Assis"
                            className="input-base"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-secondary w-full sm:w-auto flex-1"
                            disabled={isSaving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary w-full sm:w-auto flex-1"
                            disabled={isSaving || !nome.trim()}
                        >
                            {isSaving ? 'Salvando...' : 'Salvar Escola'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
