import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { useProfile } from '@/hooks/useProfile'
import { ROUTES } from '@/constants/routes'

export function Header() {
    const { signOut } = useAuth()
    const { profile } = useProfile()
    const navigate = useNavigate()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSignOut = async () => {
        setIsMenuOpen(false)
        await signOut()
        navigate(ROUTES.LOGIN, { replace: true })
    }

    // Pega as iniciais do usuário caso não haja avatar
    const initials = profile?.full_name
        ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'US'

    return (
        <header className="sticky top-0 z-10 border-b border-border-subtle bg-surface/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

                {/* Logo & Brand */}
                <Link to="/dashboard" className="flex items-center gap-2 group">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white shadow-md transition-transform group-hover:scale-105">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-text-primary">
                        Nosso<span className="text-brand">Horário</span>
                    </span>
                </Link>

                {/* User Dropdown */}
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-surface-overlay focus:outline-none focus:ring-2 focus:ring-brand/50"
                        aria-expanded={isMenuOpen}
                    >
                        {profile?.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt="Avatar do usuário"
                                className="h-8 w-8 rounded-full border border-border-subtle object-cover"
                            />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-raised border border-border-subtle text-xs font-medium text-text-secondary">
                                {initials}
                            </div>
                        )}
                        <span className="hidden text-sm font-medium text-text-secondary sm:block">
                            {profile?.full_name?.split(' ')[0] || 'Usuário'}
                        </span>
                        <svg className={`h-4 w-4 text-text-muted transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-border-subtle bg-surface-raised p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-2">

                            <div className="px-3 py-2 border-b border-border/50 mb-2">
                                <p className="text-sm font-medium text-text-primary truncate">
                                    {profile?.full_name}
                                </p>
                                <p className="text-xs text-text-muted truncate mt-0.5">
                                    {profile?.role}
                                </p>
                            </div>

                            <Link
                                to="/perfil"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-overlay hover:text-text-primary"
                            >
                                <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Configurações e Tema
                            </Link>

                            <button
                                onClick={handleSignOut}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 mt-1 text-sm text-danger transition-colors hover:bg-danger/10 hover:text-danger"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sair da sessão
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </header>
    )
}
