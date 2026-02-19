import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ContactService } from './contact.service';
import { CreateContactDto } from './create-contact.dto';
import { UpdateContactDto } from './update-contact.dto';
import { AuthGuard } from '../auth/auth.guard';
import { FindAllContactsDto } from './find-all-contacts.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) { }

  @Post()
  @Throttle({
    short: { ttl: 60000, limit: 3 },
    long: { ttl: 3600000, limit: 10 },
  })
  async create(@Body() dto: CreateContactDto): Promise<{ success: boolean }> {
    return await this.contactService.create(dto);
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(@Query() query: FindAllContactsDto) {
    return this.contactService.findAll(query);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactDto,
  ): Promise<{ success: boolean }> {
    return this.contactService.update(id, dto);
  }
}
