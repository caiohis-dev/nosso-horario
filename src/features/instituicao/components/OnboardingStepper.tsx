interface OnboardingStepperProps {
    currentStep: number // 1 (Instituição) ou 2 (Escola)
}

export function OnboardingStepper({ currentStep }: OnboardingStepperProps) {
    return (
        <div className="mb-8 flex items-center justify-center space-x-4">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
                <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300 ${currentStep === 1
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/20'
                            : 'bg-indigo-500/20 text-indigo-300'
                        }`}
                >
                    {currentStep > 1 ? '✓' : '1'}
                </div>
                <span className="mt-2 text-xs font-medium text-gray-400">Instituição</span>
            </div>

            {/* Line connector */}
            <div className="h-[2px] w-12 rounded-full bg-gray-700 mt-[-1rem]">
                <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: currentStep > 1 ? '100%' : '0%' }}
                />
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
                <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300 ${currentStep === 2
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-600/20'
                            : 'bg-gray-800 text-gray-500 ring-1 ring-gray-700'
                        }`}
                >
                    2
                </div>
                <span className="mt-2 text-xs font-medium text-gray-400">Primeira Escola</span>
            </div>
        </div>
    )
}
