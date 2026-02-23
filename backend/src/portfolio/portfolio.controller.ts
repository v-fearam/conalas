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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './create-portfolio.dto';
import { UpdatePortfolioDto } from './update-portfolio.dto';
import { FindAllPortfolioDto } from './find-all-portfolio.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  /** Público: portfolio activo con categoría, ordenado por fecha DESC */
  @Get()
  async findActive() {
    return this.portfolioService.findActive();
  }

  /** Admin: todos con paginación y filtros */
  @Get('admin')
  @UseGuards(AuthGuard)
  async findAll(@Query() query: FindAllPortfolioDto) {
    return this.portfolioService.findAll(query);
  }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('foto'))
  async create(
    @Body() dto: CreatePortfolioDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<{ success: boolean }> {
    return this.portfolioService.create(dto, file);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('foto'))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePortfolioDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<{ success: boolean }> {
    return this.portfolioService.update(id, dto, file);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean }> {
    return this.portfolioService.remove(id);
  }
}
