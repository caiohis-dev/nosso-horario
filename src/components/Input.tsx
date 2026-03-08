import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: string
}

export function Input({ label, error, id, className, ...props }: InputProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-medium text-text-secondary">
                {label}
            </label>
            <input
                id={id}
                className={['input-base', error ? 'input-error' : 'input-default', className].filter(Boolean).join(' ')}
                {...props}
            />
            {error && <span className="text-xs text-danger">{error}</span>}
        </div>
    )
}
