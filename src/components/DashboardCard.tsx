import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface DashboardCardProps {
    to: string
    icon: ReactNode
    title: string
    subtitle: string
    style?: React.CSSProperties
    stat?: {
        label: string
        value: number | null  // null = carregando
    }
}

export function DashboardCard({ to, icon, title, subtitle, style, stat }: DashboardCardProps) {
    return (
        <Link
            to={to}
            className="card group flex flex-col bg-gradient-to-br from-brand/10 to-brand-hover/10 !border-border p-6 transition-all hover:!bg-brand/20 hover:!border-border-subtle hover:shadow-brand/20 gap-4"
            style={style}
        >
            {/* Header: ícone + título + subtítulo lado a lado */}
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/20 text-brand-muted ring-1 ring-brand-hover/30 transition-transform duration-300 group-hover:scale-110">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-text-primary leading-tight">
                        {title}
                    </h3>
                    <p className="mt-0.5 text-sm text-text-muted">
                        {subtitle}
                    </p>
                </div>
            </div>

            {/* Stat (opcional) */}
            {stat && (
                <div className="border-t border-border-subtle/50 pt-3">
                    <p className="text-xs text-text-muted">{stat.label}</p>
                    <p className="mt-0.5 text-2xl font-bold text-text-primary tabular-nums">
                        {stat.value === null ? (
                            <span className="inline-block h-6 w-8 animate-pulse rounded bg-brand/20" />
                        ) : (
                            stat.value
                        )}
                    </p>
                </div>
            )}
        </Link>
    )
}
