import { Injectable, Logger } from '@nestjs/common';
import { CreateContactDto } from './create-contact.dto';
import { SupabaseService } from './supabase.service';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(private readonly supabaseService: SupabaseService) { }

  async create(dto: CreateContactDto): Promise<{ success: boolean; error?: string }> {
    this.logger.log('--- Nuevo mensaje de contacto ---');
    this.logger.log(`Nombre:   ${dto.nombre}`);
    this.logger.log(`Email:    ${dto.email}`);
    this.logger.log(`Teléfono: ${dto.telefono}`);
    this.logger.log(`Mensaje:  ${dto.mensaje ?? '(vacío)'}`);
    this.logger.log('--- Fin del mensaje ---');

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
      this.logger.error(`Error saving to Supabase: ${error.message}`);
      return { success: false, error: error.message };
    }

    return { success: true };
  }
}
