import { useState, useEffect } from 'react'
import type { EquipeMember, EquipeFormData } from '../types'
import { Input } from '@/components/Input'
import { useDashboardData } from '@/features/instituicao/hooks/useDashboardData'
import { useDisciplinas } from '@/features/disciplinas/hooks/useDisciplinas'

interface EquipeFormModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => Promise<{ success: boolean }>
    memberState?: EquipeMember | null
}

const DEFAULT_FORM: EquipeFormData = {
    nome_completo: '',
    matricula: '',
    numero_aulas_semanais: 28,
    email: '',
    telefone: '',
    diretor_escola_id: '',
    data_admissao: '',
    data_demissao: '',
    disciplinas: []
}

export function EquipeFormModal({ isOpen, onClose, onSave, memberState }: EquipeFormModalProps) {
    const { escolas } = useDashboardData() // Para o combobox de Direção
    const { disciplinas, loading: loadingDisciplinas } = useDisciplinas()
    const [formData, setFormData] = useState<EquipeFormData>(DEFAULT_FORM)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (isOpen && memberState) {
            setFormData({
                nome_completo: memberState.nome_completo || '',
                matricula: memberState.matricula || '',
                numero_aulas_semanais: memberState.numero_aulas_semanais || 28,
                email: memberState.email || '',
                telefone: memberState.telefone || '',
                diretor_escola_id: memberState.diretor_escola_id || '',
                data_admissao: memberState.data_admissao || '',
                data_demissao: memberState.data_demissao || '',
                disciplinas: (memberState as any).disciplina_ids || []
            })
        } else if (isOpen) {
            setFormData(DEFAULT_FORM)
        }
    }, [isOpen, memberState])

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)
        // Clean up empty strings to null for relations
        const payload = {
            ...formData,
            diretor_escola_id: formData.diretor_escola_id === '' ? null : formData.diretor_escola_id,
            data_admissao: formData.data_admissao === '' ? null : formData.data_admissao,
            data_demissao: formData.data_demissao === '' ? null : formData.data_demissao,
            matricula: formData.matricula === '' ? null : formData.matricula,
            email: formData.email === '' ? null : formData.email,
            telefone: formData.telefone === '' ? null : formData.telefone
        }

        await onSave(payload)
        setIsSaving(false)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop com blur */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="card relative w-full max-w-lg">
                <div className="flex items-center justify-between p-6 border-b border-border-subtle">
                    <h2 className="text-xl font-semibold text-text-primary">
                        {memberState ? 'Editar Membro' : 'Novo Membro'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-primary transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    <Input
                        label="Nome Completo *"
                        className="w-full"
                        value={formData.nome_completo}
                        onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Email Obrigatório"
                            type="email"
                            className="w-full"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <Input
                            label="Telefone"
                            type="tel"
                            className="w-full"
                            value={formData.telefone}
                            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                        />
                    </div>

                    {!memberState && (
                        <div className="p-4 bg-brand/5 border border-brand/20 rounded-lg space-y-2">
                            <h4 className="text-sm font-medium text-brand">Credenciais de Acesso</h4>
                            <p className="text-xs text-text-muted">Forneça uma senha inicial segura. O membro não precisará confirmar e-mail e receberá as orientações via <strong className="text-text-primary">E-mail de Convite</strong>.</p>
                            <Input
                                label="Senha Inicial *"
                                type="password"
                                className="w-full"
                                placeholder="Minimo de 6 caracteres"
                                value={formData.password || ''}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Aulas Semanais *"
                            type="number"
                            min="0"
                            className="w-full"
                            value={formData.numero_aulas_semanais}
                            onChange={(e) => setFormData({ ...formData, numero_aulas_semanais: Number(e.target.value) })}
                            required
                        />
                        <Input
                            label="Matrícula"
                            className="w-full"
                            value={formData.matricula}
                            onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                        />
                    </div>

                    {/* Vinculo com Diretoria */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-text-secondary">
                            Atribuição de Direção (Opcional)
                        </label>
                        <p className="text-xs text-text-muted mb-2">Designe este membro como diretor de uma escola específica.</p>
                        <select
                            value={formData.diretor_escola_id || ''}
                            onChange={(e) => setFormData({ ...formData, diretor_escola_id: e.target.value })}
                            className="input-base input-default w-full"
                        >
                            <option value="">Nenhuma (Apenas Professor)</option>
                            {escolas.map(escola => (
                                <option key={escola.id} value={escola.id}>{escola.nome}</option>
                            ))}
                        </select>
                    </div>

                    {/* Checkbox de Disciplinas Multi-selecionáveis */}
                    <div className="space-y-2 col-span-2">
                        <label className="text-sm font-medium text-text-secondary">
                            Disciplinas Lecionadas
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 border border-border-subtle rounded-lg bg-surface/50 max-h-40 overflow-y-auto custom-scrollbar">
                            {loadingDisciplinas ? (
                                <p className="text-xs text-text-muted col-span-full">Carregando disciplinas...</p>
                            ) : disciplinas.length === 0 ? (
                                <p className="text-xs text-text-muted col-span-full">Nenhuma disciplina cadastrada na instituição.</p>
                            ) : (
                                disciplinas.map(d => (
                                    <label key={d.id} className="flex items-center gap-2 cursor-pointer text-sm">
                                        <input
                                            type="checkbox"
                                            className="rounded border-border-subtle text-brand focus:ring-brand bg-surface"
                                            checked={formData.disciplinas.includes(d.id)}
                                            onChange={(e) => {
                                                const checked = e.target.checked
                                                setFormData(prev => ({
                                                    ...prev,
                                                    disciplinas: checked
                                                        ? [...prev.disciplinas, d.id]
                                                        : prev.disciplinas.filter(id => id !== d.id)
                                                }))
                                            }}
                                        />
                                        <span className="text-text-primary truncate" title={d.nome}>{d.nome}</span>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <Input
                            label="Data de Admissão"
                            type="date"
                            className="w-full"
                            value={formData.data_admissao || ''}
                            onChange={(e) => setFormData({ ...formData, data_admissao: e.target.value })}
                        />
                        <Input
                            label="Data de Demissão"
                            type="date"
                            className="w-full"
                            value={formData.data_demissao || ''}
                            onChange={(e) => setFormData({ ...formData, data_demissao: e.target.value })}
                        />
                    </div>
                </form>

                <div className="flex items-center justify-end gap-3 p-6 border-t border-border-subtle bg-surface/30">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSaving || !formData.nome_completo}
                        className="btn-primary"
                    >
                        {isSaving ? (
                            <>
                                <svg className="-ml-1 mr-2 h-4 w-4 text-text-primary" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Salvando...
                            </>
                        ) : 'Salvar Integrante'}
                    </button>
                </div>
            </div>
        </div>
    )
}
