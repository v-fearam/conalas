import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateContactDto } from './create-contact.dto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateContactDto): Promise<{ success: boolean }> {
    const turnstileValid = await this.verifyTurnstile(dto.turnstileToken);
    if (!turnstileValid) {
      throw new BadRequestException(
        'La verificación CAPTCHA falló. Intentá de nuevo.',
      );
    }

    this.logger.log('Nuevo mensaje de contacto recibido');

    const { error } = await this.supabaseService
      .getClient()
      .from('contacts')
      .insert([
        {
          nombre: dto.nombre,
          email: dto.email,
          telefono: dto.telefono,
          mensaje: dto.mensaje,
        },
      ]);

    if (error) {
      this.logger.error('Error guardando contacto en Supabase', error.message);
      throw new InternalServerErrorException(
        'No se pudo enviar el mensaje. Intentá de nuevo más tarde.',
      );
    }

    this.logger.log('Contacto guardado exitosamente');
    return { success: true };
  }

  private async verifyTurnstile(token: string): Promise<boolean> {
    const secret = this.configService.get<string>('TURNSTILE_SECRET_KEY');
    if (!secret) {
      this.logger.error('TURNSTILE_SECRET_KEY no configurada');
      return false;
    }

    try {
      const response = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ secret, response: token }),
        },
      );

      const result = (await response.json()) as {
        success: boolean;
        'error-codes'?: string[];
      };

      if (!result.success) {
        this.logger.warn(
          'Turnstile verification failed',
          result['error-codes'],
        );
      }

      return result.success;
    } catch (err) {
      this.logger.error('Error calling Turnstile API', err);
      return false;
    }
  }
}
