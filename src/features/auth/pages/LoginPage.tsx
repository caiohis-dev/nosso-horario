import { LoginForm } from '../components/LoginForm'

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-surface px-4">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-text-primary">Bem-vindo de volta</h1>
                    <p className="mt-1 text-sm text-text-muted">Entre na sua conta para continuar</p>
                </div>
                <div className="card p-8">
                    <LoginForm />
                </div>
            </div>
        </div>
    )
}
