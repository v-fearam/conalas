import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateContactDto } from './create-contact.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { FindAllContactsDto, SortOrder } from './find-all-contacts.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
  ) { }

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

  async findAll(query: FindAllContactsDto) {
    const {
      page = 1,
      limit = 10,
      sortField = 'created_at',
      sortOrder = SortOrder.DESC,
      respondido,
      startDate,
      endDate,
    } = query;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let supabaseQuery = this.supabaseService
      .getAdminClient()
      .from('contacts')
      .select('*', { count: 'exact' });

    // Status filter
    if (respondido !== undefined) {
      supabaseQuery = supabaseQuery.eq('respondido', respondido);
    } else if (!startDate && !endDate) {
      // Default behavior if no filters provided
      supabaseQuery = supabaseQuery.eq('respondido', false);
    }

    // Date range filters
    if (startDate) {
      supabaseQuery = supabaseQuery.gte('created_at', startDate);
    } else if (respondido === undefined && !endDate) {
      // Default: last 6 months if no other filters
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      supabaseQuery = supabaseQuery.gte('created_at', sixMonthsAgo.toISOString());
    }

    if (endDate) {
      supabaseQuery = supabaseQuery.lte('created_at', endDate);
    }

    // Sorting
    supabaseQuery = supabaseQuery.order(sortField, {
      ascending: sortOrder === SortOrder.ASC,
    });

    // Pagination
    supabaseQuery = supabaseQuery.range(from, to);

    const { data, error, count } = await supabaseQuery;

    if (error) {
      this.logger.error('Error obteniendo contactos', error.message);
      throw new InternalServerErrorException(
        'No se pudieron obtener los contactos.',
      );
    }

    return {
      data,
      total: count,
      page,
      limit,
    };
  }

  async update(
    id: string,
    dto: { respondido: boolean },
  ): Promise<{ success: boolean }> {
    const updateData: Record<string, unknown> = {
      respondido: dto.respondido,
      respondido_at: dto.respondido ? new Date().toISOString() : null,
    };

    const { error } = await this.supabaseService
      .getAdminClient()
      .from('contacts')
      .update(updateData)
      .eq('id', id);

    if (error) {
      this.logger.error('Error actualizando contacto', error.message);
      throw new InternalServerErrorException(
        'No se pudo actualizar el contacto.',
      );
    }

    this.logger.log(`Contacto ${id} actualizado: respondido=${dto.respondido}`);
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
