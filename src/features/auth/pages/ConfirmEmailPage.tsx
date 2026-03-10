import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

const EDGE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1'

type Status = 'verifying' | 'success' | 'error'

export default function ConfirmEmailPage() {
    const [searchParams] = useSearchParams()
    const [status, setStatus] = useState<Status>('verifying')
    const [errorMessage, setErrorMessage] = useState<string>('')

    useEffect(() => {
        const token = searchParams.get('token')

        if (!token) {
            setStatus('error')
            setErrorMessage('Link de confirmação inválido.')
            return
        }

        fetch(`${EDGE_FUNCTIONS_URL}/verify-confirm-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        })
            .then(async (res) => {
                if (res.ok) {
                    setStatus('success')
                } else {
                    const body = await res.json() as { error?: string }
                    setStatus('error')
                    setErrorMessage(body.error ?? 'Falha ao confirmar e-mail.')
                }
            })
            .catch(() => {
                setStatus('error')
                setErrorMessage('Erro de rede. Verifique sua conexão e tente novamente.')
            })
    }, [searchParams])

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
            <div className="w-full max-w-sm">
                <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-8 shadow-xl backdrop-blur-sm text-center">
                    {status === 'verifying' && (
                        <>
                            <div className="flex justify-center mb-4">
                                <div className="h-8 w-8 rounded-full border-4 border-gray-700 border-t-indigo-500" />
                            </div>
                            <p className="text-sm text-gray-400">Confirmando seu e-mail…</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 mx-auto mb-4">
                                <span className="text-2xl">✅</span>
                            </div>
                            <h1 className="text-xl font-bold text-white mb-2">E-mail confirmado!</h1>
                            <p className="text-sm text-gray-400 mb-6">
                                Sua conta foi verificada. Agora você pode entrar.
                            </p>
                            <Link
                                to={ROUTES.LOGIN}
                                className="inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                            >
                                Ir para o login
                            </Link>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 mx-auto mb-4">
                                <span className="text-2xl">❌</span>
                            </div>
                            <h1 className="text-xl font-bold text-white mb-2">Falha na confirmação</h1>
                            <p className="text-sm text-gray-400 mb-6">{errorMessage}</p>
                            <Link
                                to={ROUTES.LOGIN}
                                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                Voltar ao login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
