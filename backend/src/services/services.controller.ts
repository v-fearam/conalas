import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './create-service.dto';
import { UpdateServiceDto } from './update-service.dto';
import { FindAllServicesDto } from './find-all-services.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  /** Público: solo servicios activos, ordenados por orden */
  @Get()
  async findActive() {
    return this.servicesService.findActive();
  }

  /** Admin: todos los servicios con paginación */
  @Get('admin')
  @UseGuards(AuthGuard)
  async findAll(@Query() query: FindAllServicesDto) {
    return this.servicesService.findAll(query);
  }

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() dto: CreateServiceDto,
  ): Promise<{ success: boolean }> {
    return this.servicesService.create(dto);
  }

  /** Batch reorder — debe estar ANTES de :id */
  @Patch('reorder')
  @UseGuards(AuthGuard)
  async reorder(
    @Body() items: { id: string; orden: number }[],
  ): Promise<{ success: boolean }> {
    return this.servicesService.reorder(items);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateServiceDto,
  ): Promise<{ success: boolean }> {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean }> {
    return this.servicesService.remove(id);
  }
}
