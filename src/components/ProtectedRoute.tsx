import { Navigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth'

interface ProtectedRouteProps {
    children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-surface">
                <div className="h-8 w-8 rounded-full border-4 border-border border-t-brand" />
            </div>
        )
    }

    if (!user) {
        return <Navigate to={ROUTES.LOGIN} replace />
    }

    return <>{children}</>
}
