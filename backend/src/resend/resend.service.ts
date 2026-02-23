import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

interface ContactNotification {
  nombre: string;
  email: string;
  telefono: string;
  mensaje?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private readonly resend: Resend | null;
  private readonly notificationEmail: string | undefined;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.notificationEmail = this.configService.get<string>(
      'NOTIFICATION_EMAIL',
    );

    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.resend = null;
      this.logger.warn(
        'RESEND_API_KEY no configurada — las notificaciones por email están deshabilitadas',
      );
    }
  }

  async sendContactNotification(contact: ContactNotification): Promise<void> {
    if (!this.resend || !this.notificationEmail) {
      this.logger.warn(
        'Email de notificación no enviado: configuración incompleta',
      );
      return;
    }

    const safeName = escapeHtml(contact.nombre);
    const safeEmail = escapeHtml(contact.email);
    const safePhone = escapeHtml(contact.telefono);
    const safeMessage = contact.mensaje ? escapeHtml(contact.mensaje) : '';

    const { error } = await this.resend.emails.send({
      from: 'Diseño con Alas <onboarding@resend.dev>',
      to: this.notificationEmail,
      subject: `Nueva consulta de ${safeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2B3A67; border-bottom: 2px solid #E91E7B; padding-bottom: 10px;">
            Nueva consulta recibida
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #2B3A67; width: 120px;">Nombre</td>
              <td style="padding: 8px 12px;">${safeName}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 8px 12px; font-weight: bold; color: #2B3A67;">Email</td>
              <td style="padding: 8px 12px;">
                <a href="mailto:${safeEmail}" style="color: #E91E7B;">${safeEmail}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #2B3A67;">Teléfono</td>
              <td style="padding: 8px 12px;">
                <a href="tel:${safePhone}" style="color: #E91E7B;">${safePhone}</a>
              </td>
            </tr>
            ${
              safeMessage
                ? `
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 8px 12px; font-weight: bold; color: #2B3A67; vertical-align: top;">Mensaje</td>
              <td style="padding: 8px 12px; white-space: pre-wrap;">${safeMessage}</td>
            </tr>`
                : ''
            }
          </table>
          <p style="margin-top: 24px; font-size: 12px; color: #999;">
            Este email fue enviado automáticamente desde el formulario de contacto de Diseño con Alas.
          </p>
        </div>
      `,
    });

    if (error) {
      this.logger.error('Error enviando email de notificación', error.message);
      return;
    }

    this.logger.log(`Notificación enviada a ${this.notificationEmail}`);
  }
}
