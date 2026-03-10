import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Check your .env file.')
}

/**
 * Capturado ANTES de createClient inicializar, porque o Supabase limpa
 * os parâmetros da URL (?code= ou #access_token=) de forma assíncrona
 * durante a troca do code PKCE — o que ocorre antes do useAuth montar.
 */
export const hadRecoveryUrl = (() => {
    try {
        const params = new URLSearchParams(window.location.search)
        const hash = window.location.hash
        return params.has('code') || hash.includes('type=recovery')
    } catch {
        return false
    }
})()

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        flowType: 'pkce',
    },
})
