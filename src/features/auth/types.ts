import type { Session, User } from '@supabase/supabase-js'

// Usuário autenticado — reutiliza o tipo do Supabase diretamente
export type AuthUser = User

// Estado da sessão gerenciado pelo useAuth
export interface SessionState {
    user: AuthUser | null
    session: Session | null
    loading: boolean
}

// Formulários
export interface SignInFormValues {
    email: string
    password: string
}

export interface SignUpFormValues {
    email: string
    password: string
    fullName: string
}
