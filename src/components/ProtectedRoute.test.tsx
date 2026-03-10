import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock do useAuth
vi.mock('@/features/auth', () => ({
    useAuth: vi.fn(),
}))

import { useAuth } from '@/features/auth'
import { ProtectedRoute } from './ProtectedRoute'

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>

function renderWithRouter(ui: React.ReactNode) {
    return render(
        <MemoryRouter initialEntries={['/dashboard']}>
            <Routes>
                <Route path="/login" element={<p>Página de Login</p>} />
                <Route path="/dashboard" element={ui} />
            </Routes>
        </MemoryRouter>,
    )
}

beforeEach(() => {
    vi.clearAllMocks()
})

describe('ProtectedRoute', () => {
    it('exibe spinner enquanto loading=true', () => {
        mockUseAuth.mockReturnValue({ user: null, loading: true })
        const { container } = renderWithRouter(
            <ProtectedRoute><p>Conteúdo protegido</p></ProtectedRoute>,
        )
        // Spinner é um div com format de circle border
        expect(container.querySelector('.rounded-full')).toBeInTheDocument()
    })

    it('redireciona para /login quando user=null e loading=false', () => {
        mockUseAuth.mockReturnValue({ user: null, loading: false })
        renderWithRouter(
            <ProtectedRoute><p>Conteúdo protegido</p></ProtectedRoute>,
        )
        expect(screen.getByText('Página de Login')).toBeInTheDocument()
        expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument()
    })

    it('renderiza os filhos quando usuário está autenticado', () => {
        mockUseAuth.mockReturnValue({ user: { id: 'user-1' }, loading: false })
        renderWithRouter(
            <ProtectedRoute><p>Conteúdo protegido</p></ProtectedRoute>,
        )
        expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument()
    })
})
