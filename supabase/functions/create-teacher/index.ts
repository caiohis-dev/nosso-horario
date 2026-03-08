import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Tratamento de preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Validar Token e obter role do requisitante
    const authHeader = req.headers.get('Authorization')
    console.log("Recebendo Request. Header de Auth:", authHeader ? "Presente" : "Ausente")

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      console.error("Erro no getUser:", userError)
      return new Response(JSON.stringify({ error: 'Não autorizado ou Token Inválido' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log("Usuário autenticado:", user.id)

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, instituicao_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'Admin') {
      console.error("Usuário não tem perfil Admin ou profileError:", profileError, profile)
      return new Response(JSON.stringify({ error: 'Acesso negado. Apenas Admins podem criar professores.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Extrair dados do Body
    const bodyArgs = await req.json()
    console.log("Dados do Body parseados:", bodyArgs.email)
    const { email, password, nome_completo, matricula, numero_aulas_semanais, telefone, diretor_escola_id, data_admissao, data_demissao, disciplinas, escolas, ano_letivo } = bodyArgs

    if (!email || !password || !nome_completo || numero_aulas_semanais === undefined) {
      console.error("Campos insuficientes")
      return new Response(JSON.stringify({ error: 'Dados insuficientes fornecidos para a criação do professor.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Checagem prévia de Duplicidade (Opcional por conta do Auth, mas bom para garantir integridade do front)
    const { data: existingProfile } = await supabaseAdmin
      .from('ger_professor_diretor')
      .select('id')
      .eq('email', email)
      .single()

    if (existingProfile) {
      return new Response(JSON.stringify({ error: 'Este e-mail já está sendo utilizado por outro profissional.' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 4. Criação no Auth sem confirmação de email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Bypass explícito de confirmação
    })

    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: authError?.message || 'Erro ao criar conta no Supabase Auth' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const newUserId = authData.user.id

    // 5. Inserir Profile e Funcionario (se falhar, removemos o user via rollback)
    try {
      // Como pode haver Trigger de criação do Profile padrão via banco, faremos um Upset
      const { error: upsertProfileError } = await supabaseAdmin
        .from('profiles')
        .upsert({ id: newUserId, role: 'Professor', instituicao_id: profile.instituicao_id })

      if (upsertProfileError) throw upsertProfileError

      // Sanitize inputs vazios do frontend
      const cleanDiretorId = diretor_escola_id || null
      const cleanAdmissao = data_admissao || null
      const cleanDemissao = data_demissao || null
      const cleanMatricula = matricula || null
      const cleanTelefone = telefone || null

      const { error: rhError } = await supabaseAdmin
        .from('ger_professor_diretor')
        .insert({
          id: newUserId, // mantendo paridade com auth
          instituicao_id: profile.instituicao_id,
          nome_completo: nome_completo,
          matricula: cleanMatricula,
          numero_aulas_semanais: numero_aulas_semanais,
          email: email,
          telefone: cleanTelefone,
          diretor_escola_id: cleanDiretorId,
          data_admissao: cleanAdmissao,
          data_demissao: cleanDemissao
        })

      if (rhError) throw rhError

      // Inserir disciplinas selecionadas
      if (Array.isArray(disciplinas) && disciplinas.length > 0) {
        const disciplinasData = disciplinas.map((d_id: string) => ({
          professor_id: newUserId,
          disciplina_id: d_id,
          instituicao_id: profile.instituicao_id
        }))

        const { error: discError } = await supabaseAdmin
          .from('ger_professor_disciplinas')
          .insert(disciplinasData)

        if (discError) throw discError
      }

      // Inserir lotações escolares por ano letivo
      if (Array.isArray(escolas) && escolas.length > 0 && ano_letivo) {
        const escolasData = escolas.map((escola_id: string) => ({
          professor_id: newUserId,
          escola_id: escola_id,
          ano_letivo: String(ano_letivo),
          instituicao_id: profile.instituicao_id
        }))

        const { error: escolaError } = await supabaseAdmin
          .from('esp_professor_escola_ano')
          .insert(escolasData)

        if (escolaError) throw escolaError
      }
    } catch (dbError: any) {
      // Rollback
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
      return new Response(JSON.stringify({ error: 'Erro de transação no banco. Criação desfeita.', details: dbError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 6. Enviar Convite por E-mail via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'App Horários <onboarding@resend.dev>',
            to: [email],
            subject: 'Convite para Acesso ao Sistema de Horários',
            html: `
              <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #4F46E5;">Olá, ${nome_completo}!</h2>
                <p>Você foi cadastrado pela administração escolar na plataforma de Gestão de Horários.</p>
                <p>O seu e-mail já foi previamente confirmado e a sua conta está ativa.</p>
                <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold;">Suas credenciais de acesso:</p>
                  <p style="margin: 5px 0 0 0;"><strong>E-mail:</strong> ${email}</p>
                  <p style="margin: 5px 0 0 0;"><strong>Senha inicial:</strong> ${password}</p>
                </div>
                <p>Por questões de segurança, recomendamos que altere essa senha no seu primeiro acesso após realizar o login no painel.</p>
                <br/>
                <p>Atenciosamente,</p>
                <p>Equipe Diretiva.</p>
              </div>
            `
          })
        })
      } catch (emailError) {
        console.error('Falha ao enviar e-mail via resend', emailError)
        // Não quebrar a request se a única falha for de e-mail
      }
    } else {
      console.warn('RESEND_API_KEY não foi configurada nas variáveis da Edge Function.')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Professor criado com sucesso', user: newUserId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
