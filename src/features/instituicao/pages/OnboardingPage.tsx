import { CreateInstitutionForm } from '../components/CreateInstitutionForm'
import { CreateSchoolForm } from '../components/CreateSchoolForm'
import { OnboardingStepper } from '../components/OnboardingStepper'
import { useInstitutionValidation } from '../hooks/useInstitutionValidation'
import { APP_CONFIG } from '@/constants/app'
import { useState } from 'react'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'

export default function OnboardingPage() {
    const { currentStep, profile, refreshValidation, refreshProfile } = useInstitutionValidation()
    const [showConfetti, setShowConfetti] = useState(false)
    const { width, height } = useWindowSize()

    // Lança um confete estético quando a escola é criada com sucesso 
    // antes de desmontar (visto que o effect fará com que isFullyOnboarded=true remova a página inteira)
    const handleSchoolCreated = async () => {
        setShowConfetti(true)
        setTimeout(async () => {
            await refreshProfile()
            refreshValidation()

            // Forçamos um redirecionamento hard para o dashboard. 
            // Como OnboardingPage e DashboardPage dividem a mesma rota /dashboard mas 
            // possuem estados de hook isolados, o reload limpa o cache e reassenta a UI.
            window.location.href = '/dashboard'
        }, 1500) // Delay curto para o usuário sentir o sucesso da UI
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4 transition-all duration-700">
            {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}

            <div className="w-full max-w-md space-y-6 rounded-2xl bg-gray-900 p-8 shadow-2xl ring-1 ring-white/10 sm:p-10">
                <OnboardingStepper currentStep={currentStep} />

                {/* Header (Branding Moderno) */}
                <div className="text-center transition-opacity duration-300">
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 ring-1 ring-indigo-500/30">
                        {currentStep === 1 ? (
                            <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        ) : (
                            <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                        {currentStep === 1 ? `Bem-vindo ao ${APP_CONFIG.NAME}` : 'Primeira Escola'}
                    </h2>
                    <p className="mt-3 text-sm text-gray-400">
                        {currentStep === 1
                            ? 'Para começarmos a organizar seus horários, primeiro precisamos criar o ambiente digital da sua rede de ensino.'
                            : 'Excelente! O ambiente foi criado. Agora, qual é o nome da sua primeira unidade escolar / pólo matriz?'}
                    </p>
                </div>

                <div className="pt-2">
                    {currentStep === 1 ? (
                        <CreateInstitutionForm onSuccess={() => refreshProfile()} />
                    ) : (
                        <CreateSchoolForm
                            instituicaoId={profile?.instituicao_id ?? ''}
                            onSuccess={handleSchoolCreated}
                        />
                    )}
                </div>

                <div className="mt-6 text-center text-xs text-gray-500">
                    Você está configurando o {APP_CONFIG.NAME} como Administrador.
                </div>
            </div>
        </div>
    )
}
