import { RegisterForm } from '../components/RegisterForm'

export default function RegisterPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
            <div className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-text-primary">Crie sua conta</h1>
                    <p className="mt-1 text-sm text-text-muted">Preencha os dados abaixo para começar</p>
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-8 shadow-xl backdrop-blur-sm">
                    <RegisterForm />
                </div>
            </div>
        </div>
    )
}
