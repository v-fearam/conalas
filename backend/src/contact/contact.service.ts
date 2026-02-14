import { Injectable, Logger } from '@nestjs/common';
import { CreateContactDto } from './create-contact.dto';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  create(dto: CreateContactDto): { success: boolean } {
    this.logger.log('--- Nuevo mensaje de contacto ---');
    this.logger.log(`Nombre:   ${dto.nombre}`);
    this.logger.log(`Email:    ${dto.email}`);
    this.logger.log(`Teléfono: ${dto.telefono}`);
    this.logger.log(`Mensaje:  ${dto.mensaje ?? '(vacío)'}`);
    this.logger.log('--- Fin del mensaje ---');

    return { success: true };
  }
}
