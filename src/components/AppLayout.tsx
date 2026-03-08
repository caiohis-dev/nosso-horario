import type { ReactNode } from 'react'
import { Header } from './Header'

interface AppLayoutProps {
    children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    return (
        <div className="min-h-screen bg-surface">
            <Header />
            <main>{children}</main>
        </div>
    )
}
