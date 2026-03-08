import { Link } from 'react-router-dom'
import { useProfile } from '@/hooks/useProfile'
import { useTheme } from '@/components/ThemeProvider'

export default function PerfilPage() {
    const { profile, updateProfile } = useProfile()
    const { theme, setTheme } = useTheme()

    // Pega as iniciais do usuário caso não haja avatar
    const initials = profile?.full_name
        ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'US'

    // Troca o tema visual agora, e despacha update em plano de fundo pro DB
    const handleChangeTheme = (newTheme: 'light' | 'dark' | 'system') => {
        setTheme(newTheme)
        updateProfile({ theme: newTheme })
    }

    return (
        <div className="min-h-screen bg-surface p-6 sm:p-10">
            <div className="mx-auto max-w-3xl space-y-8">

                {/* Header de Navegação */}
                <header className="flex items-center gap-4 border-b border-border/50 pb-6">
                    <Link
                        to="/dashboard"
                        className="flex shrink-0 h-10 w-10 items-center justify-center rounded-full bg-surface-raised text-text-muted ring-1 ring-border-subtle hover:text-text-primary hover:bg-surface-overlay transition-all"
                        title="Voltar ao Dashboard"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-text-primary">
                            Minha Conta
                        </h1>
                        <p className="mt-1 text-sm text-text-muted">
                            Gerencie seu perfil e as preferências da aplicação
                        </p>
                    </div>
                </header>

                {/* Seção de Perfil */}
                <section className="card p-6">
                    <h2 className="text-lg font-semibold text-text-secondary mb-4">Informações Pessoais</h2>
                    <div className="flex items-center gap-6">
                        {profile?.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt="Avatar"
                                className="h-20 w-20 rounded-full border border-border-subtle object-cover shadow-sm"
                            />
                        ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-overlay border border-border-subtle text-xl font-medium text-text-secondary shadow-sm">
                                {initials}
                            </div>
                        )}
                        <div>
                            <p className="text-xl font-medium text-text-primary">{profile?.full_name}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="inline-flex items-center rounded-md bg-brand/10 px-2 py-1 text-xs font-medium text-brand ring-1 ring-inset ring-brand/20">
                                    {profile?.role}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Seção de Preferências de Tema */}
                <section className="card p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-text-secondary">Tema da Interface</h2>
                            <p className="text-sm text-text-muted mt-1">
                                Escolha como a plataforma AgilClass é exibida para você.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg bg-surface p-1 ring-1 ring-border-subtle">
                            <button
                                onClick={() => handleChangeTheme('light')}
                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${theme === 'light'
                                    ? 'bg-surface-raised text-text-primary shadow-sm ring-1 ring-border-subtle'
                                    : 'text-text-muted hover:text-text-primary'
                                    }`}
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Claro
                            </button>
                            <button
                                onClick={() => handleChangeTheme('dark')}
                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${theme === 'dark'
                                    ? 'bg-surface-raised text-text-primary shadow-sm ring-1 ring-border-subtle'
                                    : 'text-text-muted hover:text-text-primary'
                                    }`}
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                                Escuro
                            </button>
                            <button
                                onClick={() => handleChangeTheme('system')}
                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${theme === 'system'
                                    ? 'bg-surface-raised text-text-primary shadow-sm ring-1 ring-border-subtle'
                                    : 'text-text-muted hover:text-text-primary'
                                    }`}
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Auto
                            </button>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    )
}
