import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '@/components/Input'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth'
import { signUpSchema, type SignUpSchema } from '../schemas'

export function RegisterForm() {
    const { signUp } = useAuth()
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignUpSchema>({ resolver: zodResolver(signUpSchema) })

    const onSubmit = async (data: SignUpSchema) => {
        const { error } = await signUp(data)
        if (!error) {
            navigate(`${ROUTES.LOGIN}?registered=true`, { replace: true })
        }
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            <Input
                id="fullName"
                label="Nome completo"
                type="text"
                placeholder="Seu nome"
                autoComplete="name"
                error={errors.fullName?.message}
                {...register('fullName')}
            />
            <Input
                id="email"
                label="E-mail"
                type="email"
                placeholder="voce@exemplo.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
            />
            <Input
                id="password"
                label="Senha"
                type="password"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register('password')}
            />

            <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary mt-1 w-full"
            >
                {isSubmitting ? 'Criando conta…' : 'Criar conta'}
            </button>

            <p className="text-center text-sm text-text-secondary mt-2">
                Já tem uma conta?{' '}
                <Link to={ROUTES.LOGIN} className="text-brand hover:text-brand-hover font-medium transition-colors">
                    Entrar
                </Link>
            </p>
        </form>
    )
}
