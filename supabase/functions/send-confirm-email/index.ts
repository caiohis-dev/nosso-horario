import { render } from 'npm:@react-email/render'
import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { resend } from '../_shared/resend.ts'
import { supabaseAdmin } from '../_shared/supabase-admin.ts'
import { ConfirmEmailTemplate } from '../_shared/emails/ConfirmEmailTemplate.tsx'

const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL')!
const SITE_URL = Deno.env.get('SITE_URL') ?? 'http://localhost:5173'
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MINUTES = 60
const TOKEN_EXPIRY_HOURS = 24

async function generateToken(): Promise<{ raw: string; hash: string }> {
    const bytes = crypto.getRandomValues(new Uint8Array(32))
    const raw = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
    const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
    const hash = Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, '0')).join('')
    return { raw, hash }
}

Deno.serve(async (req: Request) => {
    const corsResponse = handleCors(req)
    if (corsResponse) return corsResponse

    try {
        const { userId, email, userName } = await req.json() as {
            userId: string
            email: string
            userName?: string
        }

        if (!userId || !email) {
            return new Response(
                JSON.stringify({ error: 'userId e email são obrigatórios' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
            )
        }

        // Rate limiting: máximo de envios por usuário por hora
        const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString()
        const { count } = await supabaseAdmin
            .from('email_verifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('created_at', windowStart)

        if ((count ?? 0) >= RATE_LIMIT_MAX) {
            console.warn(`Rate limit atingido para user_id: ${userId}`)
            return new Response(
                JSON.stringify({ error: 'Muitas tentativas. Aguarde antes de solicitar novamente.' }),
                { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
            )
        }

        // Gera e armazena o token customizado
        const { raw: rawToken, hash: tokenHash } = await generateToken()
        const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toISOString()

        const { error: insertError } = await supabaseAdmin
            .from('email_verifications')
            .insert({ user_id: userId, token_hash: tokenHash, expires_at: expiresAt })

        if (insertError) {
            console.error('Erro ao armazenar token de verificação:', insertError.message)
            return new Response(
                JSON.stringify({ error: 'Falha ao gerar token de confirmação' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
            )
        }

        // Monta o link de confirmação apontando para o frontend
        const confirmationUrl = `${SITE_URL}/confirm-email?token=${rawToken}`

        // Renderiza e envia o email via Resend
        const html = await render(ConfirmEmailTemplate({ confirmationUrl, userName }))
        const { error: sendError } = await resend.emails.send({
            from: FROM_EMAIL,
            to: [email],
            subject: 'Confirme seu e-mail',
            html,
        })

        if (sendError) {
            console.error('Erro ao enviar email via Resend:', sendError)
            return new Response(
                JSON.stringify({ error: 'Falha ao enviar e-mail de confirmação' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
            )
        }

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (err) {
        console.error('Erro inesperado em send-confirm-email:', err)
        return new Response(
            JSON.stringify({ error: 'Erro interno do servidor' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
