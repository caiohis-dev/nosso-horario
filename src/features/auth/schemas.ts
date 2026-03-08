import { z } from 'zod'

export const signInSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(1, 'Senha obrigatória'),
})

export const signUpSchema = z.object({
    fullName: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(100),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
})

export type SignInSchema = z.infer<typeof signInSchema>
export type SignUpSchema = z.infer<typeof signUpSchema>
