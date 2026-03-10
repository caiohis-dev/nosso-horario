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

interface ConfirmEmailTemplateProps {
    confirmationUrl: string
    userName?: string
}

export function ConfirmEmailTemplate({ confirmationUrl, userName }: ConfirmEmailTemplateProps) {
    return (
        <Html lang="pt-BR">
            <Head />
            <Preview>Confirme seu endereço de e-mail</Preview>
            <Body style={{ backgroundColor: '#0f0f0f', fontFamily: 'sans-serif' }}>
                <Container style={{ maxWidth: '560px', margin: '40px auto', padding: '0 20px' }}>
                    <Heading style={{ color: '#ffffff', fontSize: '24px', marginBottom: '8px' }}>
                        Confirme seu e-mail
                    </Heading>
                    <Text style={{ color: '#a3a3a3', fontSize: '15px', margin: '0 0 24px' }}>
                        {userName ? `Olá, ${userName}!` : 'Olá!'} Clique no botão abaixo para confirmar seu endereço de e-mail.
                    </Text>
                    <Section style={{ textAlign: 'center', margin: '32px 0' }}>
                        <Button
                            href={confirmationUrl}
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
                            Confirmar e-mail
                        </Button>
                    </Section>
                    <Text style={{ color: '#737373', fontSize: '13px' }}>
                        O link expira em 24 horas. Se você não criou esta conta, ignore este e-mail.
                    </Text>
                    <Hr style={{ borderColor: '#262626', margin: '24px 0' }} />
                    <Text style={{ color: '#525252', fontSize: '12px' }}>
                        Se o botão não funcionar, copie e cole este link no navegador:{' '}
                        <span style={{ color: '#4f46e5' }}>{confirmationUrl}</span>
                    </Text>
                </Container>
            </Body>
        </Html>
    )
}
