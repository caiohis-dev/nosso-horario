import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/config/supabase'
import type { SessionState, SignInFormValues, SignUpFormValues } from '../types'

const EDGE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL + '/functions/v1'

export function useAuth() {
    const [state, setState] = useState<SessionState>({
        user: null,
        session: null,
        loading: true,
    })

    // Ref para distinguir signOut manual de expiração de sessão
    const isManualSignOut = useRef(false)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setState({ user: session?.user ?? null, session, loading: false })
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_OUT' && !isManualSignOut.current) {
                    // Sessão expirada ou refresh de token falhou
                    toast.error('Sua sessão expirou. Faça login novamente.')
                }

                // Reseta a flag após processar o evento
                if (event === 'SIGNED_OUT') {
                    isManualSignOut.current = false
                }

                setState({ user: session?.user ?? null, session, loading: false })
            },
        )

        return () => subscription.unsubscribe()
    }, [])

    const signIn = useCallback(async ({ email, password }: SignInFormValues) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            // Erros de email não confirmado são tratados inline no formulário
            if (!error.message.toLowerCase().includes('email not confirmed')) {
                toast.error(error.message)
            }
            return { error }
        }
        return { error: null }
    }, [])

    const signUp = useCallback(async ({ email, password, fullName }: SignUpFormValues) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
        })
        if (error) {
            toast.error(error.message)
            return { error }
        }

        // Dispara o email de confirmação via Resend (Edge Function)
        if (data.user) {
            const emailResult = await sendConfirmationEmail(data.user.id, email, fullName)
            if (emailResult.error) {
                toast.error('Conta criada, mas falha ao enviar e-mail de confirmação. Tente novamente.')
            }
        }

        return { error: null }
    }, [])

    const signOut = useCallback(async () => {
        isManualSignOut.current = true
        const { error } = await supabase.auth.signOut()
        if (error) {
            isManualSignOut.current = false
            toast.error(error.message)
        }
    }, [])
    return {
        user: state.user,
        session: state.session,
        loading: state.loading,
        signIn,
        signUp,
        signOut,
    }
}

async function sendConfirmationEmail(
    userId: string,
    email: string,
    userName?: string,
): Promise<{ error: string | null }> {
    const { data: { session } } = await supabase.auth.getSession()

    // Usa o access_token da sessão se disponível; caso contrário omite o header
    // (requer --no-verify-jwt no functions serve local, ou gateway configurado em produção)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
    }

    try {
        const response = await fetch(`${EDGE_FUNCTIONS_URL}/send-confirm-email`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ userId, email, userName }),
        })

        if (!response.ok) {
            const body = await response.json() as { error?: string }
            console.error('Falha ao enviar email de confirmação:', body.error)
            return { error: body.error ?? 'unknown' }
        }

        return { error: null }
    } catch (err) {
        console.error('Erro de rede ao enviar email de confirmação:', err)
        return { error: 'network_error' }
    }
}
