import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export default function ConstructionPage() {
    return (
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-6 text-center">
            <div className="mb-8 p-6 rounded-full bg-brand/10 text-brand">
                <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-text-primary mb-4">
                Página em Construção
            </h1>
            <p className="text-lg text-text-muted max-w-lg mb-8">
                Esta funcionalidade está em desenvolvimento e estará disponível em breve.
            </p>
            <Link
                to={ROUTES.EQUIPE}
                className="btn-primary"
            >
                Voltar
            </Link>
        </div>
    )
}
