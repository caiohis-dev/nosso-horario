import React from 'npm:react'
import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from 'npm:@react-email/components'

interface ResetPasswordTemplateProps {
    resetUrl: string
    userName?: string
}

export function ResetPasswordTemplate({ resetUrl, userName }: ResetPasswordTemplateProps) {
    return (
        <Html lang="pt-BR">
            <Head />
            <Preview>Redefinição de senha solicitada</Preview>
            <Body style={{ backgroundColor: '#0f0f0f', fontFamily: 'sans-serif' }}>
                <Container style={{ maxWidth: '560px', margin: '40px auto', padding: '0 20px' }}>
                    <Heading style={{ color: '#ffffff', fontSize: '24px', marginBottom: '8px' }}>
                        Redefinir senha
                    </Heading>
                    <Text style={{ color: '#a3a3a3', fontSize: '15px', margin: '0 0 24px' }}>
                        {userName ? `Olá, ${userName}!` : 'Olá!'} Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para continuar.
                    </Text>
                    <Section style={{ textAlign: 'center', margin: '32px 0' }}>
                        <Button
                            href={resetUrl}
                            style={{
                                backgroundColor: '#4f46e5',
                                color: '#ffffff',
                                padding: '12px 28px',
                                borderRadius: '8px',
                                fontSize: '15px',
                                fontWeight: '600',
                                textDecoration: 'none',
                                display: 'inline-block',
                            }}
                        >
                            Redefinir senha
                        </Button>
                    </Section>
                    <Text style={{ color: '#737373', fontSize: '13px' }}>
                        O link expira em 1 hora. Se você não fez esta solicitação, ignore este e-mail — sua senha permanece a mesma.
                    </Text>
                    <Hr style={{ borderColor: '#262626', margin: '24px 0' }} />
                    <Text style={{ color: '#525252', fontSize: '12px' }}>
                        Se o botão não funcionar, copie e cole este link no navegador:{' '}
                        <span style={{ color: '#4f46e5' }}>{resetUrl}</span>
                    </Text>
                </Container>
            </Body>
        </Html>
    )
}
