import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Input } from '@/components/Input'
import { createSchool } from '../api'

const createSchoolSchema = z.object({
    nome: z.string().min(3, 'O nome da unidade deve ter no mínimo 3 caracteres.'),
})

type CreateSchoolFormValues = z.infer<typeof createSchoolSchema>

interface CreateSchoolFormProps {
    instituicaoId: string
    onSuccess: () => void
}

export function CreateSchoolForm({ instituicaoId, onSuccess }: CreateSchoolFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateSchoolFormValues>({
        resolver: zodResolver(createSchoolSchema),
    })

    const onSubmit = async (data: CreateSchoolFormValues) => {
        setIsSubmitting(true)
        try {
            await createSchool(data.nome, instituicaoId)
            toast.success('Primeira escola criada! Tudo pronto para começar.')
            // Tempo para o confetti
            setTimeout(() => {
                onSuccess()
            }, 500)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Erro ao criar escola.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
                id="nome"
                label="Nome da Unidade/Escola"
                placeholder="Ex: Unidade Centro ou Escola Machado de Assis"
                error={errors.nome?.message}
                {...register('nome')}
            />

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
                {isSubmitting ? 'Gerando Unidade...' : 'Finalizar Configuração'}
            </button>
        </form>
    )
}
