import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Input } from '@/components/Input'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth'
import { signInSchema, type SignInSchema } from '../schemas'

export function LoginForm() {
    const { signIn } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [emailNotConfirmed, setEmailNotConfirmed] = useState(false)

    const justRegistered = searchParams.get('registered') === 'true'

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<SignInSchema>({ resolver: zodResolver(signInSchema) })

    const onSubmit = async (data: SignInSchema) => {
        setEmailNotConfirmed(false)
        const { error } = await signIn(data)
        if (error) {
            if (error.message.toLowerCase().includes('email not confirmed')) {
                setEmailNotConfirmed(true)
            }
            return
        }
        navigate(ROUTES.DASHBOARD, { replace: true })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            {/* Banner: cadastro realizado com sucesso */}
            {justRegistered && !emailNotConfirmed && (
                <div className="banner banner-info">
                    <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">✉️</span>
                        <div>
                            <p className="banner-info-title">
                                Conta criada com sucesso!
                            </p>
                            <p className="banner-info-body">
                                Enviamos um link de confirmação para o seu e-mail. Clique nele para ativar sua conta e entrar.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Banner: tentativa de login antes de confirmar email */}
            {emailNotConfirmed && (
                <div className="banner banner-warning">
                    <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">📬</span>
                        <div>
                            <p className="banner-warning-title">
                                Confirme seu e-mail antes de entrar
                            </p>
                            <p className="banner-warning-body">
                                Abra o e-mail que enviamos e clique no botão para ativar sua conta.
                            </p>
                            <p className="banner-warning-hint">
                                Não encontrou? <span className="font-medium">Verifique a pasta de spam.</span>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <Input
                id="email"
                label="E-mail"
                type="email"
                placeholder="voce@exemplo.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
            />
            <div className="flex flex-col gap-1.5">
                <Input
                    id="password"
                    label="Senha"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    error={errors.password?.message}
                    {...register('password')}
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary mt-1 w-full"
            >
                {isSubmitting ? 'Entrando…' : 'Entrar'}
            </button>

            <p className="text-center text-sm text-text-secondary mt-2">
                Não tem uma conta?{' '}
                <Link to={ROUTES.REGISTER} className="text-brand hover:text-brand-hover font-medium transition-colors">
                    Cadastre-se
                </Link>
            </p>
        </form>
    )
}
