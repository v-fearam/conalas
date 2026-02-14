import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './create-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) { }

  @Post()
  async create(@Body() dto: CreateContactDto): Promise<{ success: boolean; error?: string }> {
    return await this.contactService.create(dto);
  }
}
