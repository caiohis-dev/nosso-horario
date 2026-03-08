import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('@/config/supabase', () => ({
    supabase: {
        auth: {
            getSession: vi.fn(),
            onAuthStateChange: vi.fn(),
            signInWithPassword: vi.fn(),
            signUp: vi.fn(),
            signOut: vi.fn(),
        },
    },
}))

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

import { supabase } from '@/config/supabase'
import { toast } from 'sonner'
import { useAuth } from './useAuth'

const mockSupabase = supabase as unknown as {
    auth: {
        getSession: ReturnType<typeof vi.fn>
        onAuthStateChange: ReturnType<typeof vi.fn>
        signInWithPassword: ReturnType<typeof vi.fn>
        signUp: ReturnType<typeof vi.fn>
        signOut: ReturnType<typeof vi.fn>
    }
}

// Referência ao callback registrado pelo hook — permite disparar eventos manualmente
let authStateCallback: ((event: string, session: unknown) => void) | null = null

function captureAuthStateCallback() {
    mockSupabase.auth.onAuthStateChange.mockImplementation(
        (cb: (event: string, session: unknown) => void) => {
            authStateCallback = cb
            return { data: { subscription: { unsubscribe: vi.fn() } } }
        },
    )
}

function setupOnAuthStateChange(event: string, session = null) {
    mockSupabase.auth.onAuthStateChange.mockImplementation(
        (cb: (event: string, session: unknown) => void) => {
            authStateCallback = cb
            cb(event, session)
            return { data: { subscription: { unsubscribe: vi.fn() } } }
        },
    )
}

beforeEach(() => {
    vi.clearAllMocks()
    authStateCallback = null
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } })
    setupOnAuthStateChange('SIGNED_IN', null)
    mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
    })
})

describe('useAuth', () => {
    describe('estado inicial', () => {
        it('começa com loading=true e user=null antes de getSession resolver', () => {
            // getSession nunca resolve + onAuthStateChange não dispara imediatamente
            mockSupabase.auth.getSession.mockReturnValue(new Promise(() => { }))
            captureAuthStateCallback()

            const { result } = renderHook(() => useAuth())

            expect(result.current.loading).toBe(true)
            expect(result.current.user).toBeNull()
        })

        it('resolve loading=false após getSession', async () => {
            const { result } = renderHook(() => useAuth())
            await act(async () => { })
            expect(result.current.loading).toBe(false)
        })
    })

    describe('signIn', () => {
        it('retorna { error: null } em caso de sucesso', async () => {
            mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null })
            const { result } = renderHook(() => useAuth())
            await act(async () => { })

            const response = await act(async () =>
                result.current.signIn({ email: 'user@test.com', password: '12345678' }),
            )
            expect(response.error).toBeNull()
        })

        it('exibe toast.error e retorna error em caso de falha', async () => {
            const mockError = new Error('Invalid credentials')
            mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: mockError })
            const { result } = renderHook(() => useAuth())
            await act(async () => { })

            await act(async () =>
                result.current.signIn({ email: 'user@test.com', password: 'wrong' }),
            )
            expect(toast.error).toHaveBeenCalledWith(mockError.message)
        })
    })

    describe('signUp', () => {
        it('chama Edge Function de confirmação de email após signup bem-sucedido', async () => {
            const mockUser = { id: 'user-123', email: 'user@test.com' }
            mockSupabase.auth.signUp.mockResolvedValue({ data: { user: mockUser }, error: null })

            const { result } = renderHook(() => useAuth())
            await act(async () => { })

            await act(async () =>
                result.current.signUp({ email: 'user@test.com', password: '12345678', fullName: 'Test User' }),
            )

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('send-confirm-email'),
                expect.objectContaining({ method: 'POST' }),
            )
        })

        it('não chama Edge Function se signup falhar', async () => {
            mockSupabase.auth.signUp.mockResolvedValue({
                data: { user: null },
                error: new Error('Email already in use'),
            })

            const { result } = renderHook(() => useAuth())
            await act(async () => { })

            await act(async () =>
                result.current.signUp({ email: 'dup@test.com', password: '12345678', fullName: 'Test' }),
            )

            expect(mockFetch).not.toHaveBeenCalled()
        })
    })

    describe('signOut', () => {
        it('chama supabase.auth.signOut', async () => {
            mockSupabase.auth.signOut.mockResolvedValue({ error: null })
            const { result } = renderHook(() => useAuth())
            await act(async () => { })

            await act(async () => result.current.signOut())
            expect(mockSupabase.auth.signOut).toHaveBeenCalledOnce()
        })

        it('NÃO exibe toast de sessão expirada no signOut manual', async () => {
            mockSupabase.auth.signOut.mockResolvedValue({ error: null })
            captureAuthStateCallback()

            const { result } = renderHook(() => useAuth())
            await act(async () => { })

            // Chama signOut manualmente (seta isManualSignOut = true)
            await act(async () => result.current.signOut())

            // Dispara SIGNED_OUT após o signOut — simula o evento do Supabase
            await act(async () => authStateCallback?.('SIGNED_OUT', null))

            expect(toast.error).not.toHaveBeenCalledWith(
                expect.stringContaining('sessão expirou'),
            )
        })
    })

    describe('sessão expirada', () => {
        it('exibe toast de sessão expirada quando SIGNED_OUT não é manual', async () => {
            // SIGNED_OUT dispara na montagem sem signOut() ter sido chamado
            setupOnAuthStateChange('SIGNED_OUT', null)

            renderHook(() => useAuth())
            await act(async () => { })

            expect(toast.error).toHaveBeenCalledWith(
                expect.stringContaining('sessão expirou'),
            )
        })
    })

})
