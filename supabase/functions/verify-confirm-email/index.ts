import { corsHeaders, handleCors } from '../_shared/cors.ts'
import { supabaseAdmin } from '../_shared/supabase-admin.ts'

Deno.serve(async (req: Request) => {
    const corsResponse = handleCors(req)
    if (corsResponse) return corsResponse

    try {
        const { token } = await req.json() as { token: string }

        if (!token) {
            return new Response(
                JSON.stringify({ error: 'Token é obrigatório' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
            )
        }

        // Reconstrói o hash do token recebido
        const tokenBytes = new Uint8Array(token.match(/.{2}/g)!.map((b) => parseInt(b, 16)))
        const hashBuffer = await crypto.subtle.digest('SHA-256', tokenBytes)
        const tokenHash = Array.from(new Uint8Array(hashBuffer), (b) => b.toString(16).padStart(2, '0')).join('')

        // Busca o token válido (não expirado) na tabela
        const { data: verification, error: lookupError } = await supabaseAdmin
            .from('email_verifications')
            .select('user_id, expires_at')
            .eq('token_hash', tokenHash)
            .gt('expires_at', new Date().toISOString())
            .maybeSingle()

        if (lookupError) {
            console.error('Erro ao buscar token:', lookupError.message)
            return new Response(
                JSON.stringify({ error: 'Erro ao validar token' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
            )
        }

        if (!verification) {
            return new Response(
                JSON.stringify({ error: 'Token inválido ou expirado' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
            )
        }

        // Confirma o email do usuário via admin API
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            verification.user_id,
            { email_confirm: true },
        )

        if (updateError) {
            console.error('Erro ao confirmar email do usuário:', updateError.message)
            return new Response(
                JSON.stringify({ error: 'Falha ao confirmar e-mail' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
            )
        }

        // Remove o token usado para evitar reutilização
        await supabaseAdmin
            .from('email_verifications')
            .delete()
            .eq('token_hash', tokenHash)

        return new Response(
            JSON.stringify({ success: true }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (err) {
        console.error('Erro inesperado em verify-confirm-email:', err)
        return new Response(
            JSON.stringify({ error: 'Erro interno do servidor' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
