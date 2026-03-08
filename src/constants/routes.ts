export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    CONFIRM_EMAIL: '/confirm-email',
    DASHBOARD: '/dashboard',
    EQUIPE: '/equipe',
    EQUIPE_LOTE: '/equipe/importar',
    DISCIPLINAS: '/disciplinas',
    SERIES: '/series',
    ESCOLAS_GERENCIAMENTO: '/escolas-admin',
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]
