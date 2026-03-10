import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Input } from '@/components/Input'
import { createInstitution } from '../api'
import { useProfile } from '@/hooks/useProfile'

const createInstitutionSchema = z.object({
    nome: z.string().min(3, 'O nome da instituição deve ter no mínimo 3 caracteres.'),
})

type CreateInstitutionFormValues = z.infer<typeof createInstitutionSchema>

interface CreateInstitutionFormProps {
    onSuccess?: () => void
}

export function CreateInstitutionForm({ onSuccess }: CreateInstitutionFormProps = {}) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { refreshProfile } = useProfile()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateInstitutionFormValues>({
        resolver: zodResolver(createInstitutionSchema),
    })

    const onSubmit = async (data: CreateInstitutionFormValues) => {
        setIsSubmitting(true)
        try {
            await createInstitution(data.nome)
            toast.success('Instituição criada com sucesso! Preparando seu ambiente...')

            // Aguarda um instante para o banco triggar o Auth Update no Realtime, ou 
            // no mínimo forçamos o refetch no Client duas vezes
            setTimeout(async () => {
                if (onSuccess) {
                    onSuccess()
                } else {
                    await refreshProfile()
                }
            }, 500)

        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Erro ao criar instituição.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
                id="nome"
                label="Nome da Instituição"
                placeholder="Ex: Escola Estadual Machado de Assis"
                error={errors.nome?.message}
                {...register('nome')}
            />

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
                {isSubmitting ? 'Gerando Workspace...' : 'Criar Workspace'}
            </button>
        </form>
    )
}
