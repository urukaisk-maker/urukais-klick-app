import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;
  private readonly appUrl: string;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
    this.from = this.config.get<string>('EMAIL_FROM') ?? 'onboarding@resend.dev';
    this.appUrl = this.config.get<string>('APP_URL') ?? 'http://localhost';
  }

  async sendVerificationEmail(email: string, token: string, username: string) {
    if (!this.resend) {
      this.logger.warn('Resend no configurado, saltando email');
      return { sent: false, reason: 'no_api_key' };
    }

    const verifyUrl = `${this.appUrl}/verify-email?token=${token}`;

    try {
      const { data, error } = await this.resend.emails.send({
        from: `Urukais Klick <${this.from}>`,
        to: [email],
        subject: '🎌 Verifica tu cuenta de Urukais Klick',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: system-ui, sans-serif; background: #0a0a14; color: #f1f5f9; padding: 40px 20px; }
              .container { max-width: 500px; margin: 0 auto; background: #12121f; border-radius: 20px; padding: 40px; border: 1px solid rgba(255,255,255,0.1); }
              h1 { color: #FF4D79; font-size: 24px; margin-bottom: 10px; }
              .btn { display: inline-block; background: linear-gradient(135deg, #FF4D79, #A855F7); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0; }
              .code { background: #1a1a2e; padding: 10px 16px; border-radius: 8px; font-family: monospace; font-size: 13px; word-break: break-all; }
              .footer { color: #64748b; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div style="text-align: center; font-size: 48px; margin-bottom: 10px;">⛩️</div>
              <h1>¡Bienvenido a Urukais Klick, ${username}!</h1>
              <p>Para activar tu cuenta, haz clic en el siguiente botón:</p>

              <div style="text-align: center;">
                <a href="${verifyUrl}" class="btn">✅ Verificar mi cuenta</a>
              </div>

              <p style="color: #94a3b8; font-size: 14px;">O copia este enlace en tu navegador:</p>
              <div class="code">${verifyUrl}</div>

              <p style="color: #94a3b8; font-size: 14px; margin-top: 20px;">
                Este enlace caduca en <strong>24 horas</strong>. Si no te registraste tú, ignora este email.
              </p>

              <div class="footer">
                Urukais Klick · Tu agenda personal anime 🎌
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (error) {
        this.logger.error('Error enviando email:', error);
        return { sent: false, error };
      }

      this.logger.log(`📧 Email de verificación enviado a ${email}`);
      return { sent: true, id: data?.id };
    } catch (err: any) {
      this.logger.error('Error enviando email:', err?.message);
      return { sent: false, error: err?.message };
    }
  }

  async sendPasswordResetEmail(email: string, token: string, username: string) {
    if (!this.resend) return { sent: false, reason: 'no_api_key' };

    const resetUrl = `${this.appUrl}/reset-password?token=${token}`;

    try {
      const { data, error } = await this.resend.emails.send({
        from: `Urukais Klick <${this.from}>`,
        to: [email],
        subject: '🔐 Restablecer contraseña de Urukais Klick',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: system-ui, sans-serif; background: #0a0a14; color: #f1f5f9; padding: 40px 20px; }
              .container { max-width: 500px; margin: 0 auto; background: #12121f; border-radius: 20px; padding: 40px; border: 1px solid rgba(255,255,255,0.1); }
              h1 { color: #FF4D79; font-size: 24px; }
              .btn { display: inline-block; background: linear-gradient(135deg, #FF4D79, #A855F7); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0; }
              .footer { color: #64748b; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div style="text-align: center; font-size: 48px; margin-bottom: 10px;">🔐</div>
              <h1>Hola ${username}</h1>
              <p>Has solicitado restablecer tu contraseña.</p>

              <div style="text-align: center;">
                <a href="${resetUrl}" class="btn">🔑 Cambiar contraseña</a>
              </div>

              <p style="color: #94a3b8; font-size: 14px;">
                Este enlace caduca en <strong>1 hora</strong>. Si no lo pediste, ignora este email.
              </p>

              <div class="footer">
                Urukais Klick · Tu agenda personal anime 🎌
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (error) return { sent: false, error };
      return { sent: true, id: data?.id };
    } catch (err: any) {
      return { sent: false, error: err?.message };
    }
  }
}
