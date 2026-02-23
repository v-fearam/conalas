import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePortfolioDto } from './create-portfolio.dto';
import { UpdatePortfolioDto } from './update-portfolio.dto';
import { FindAllPortfolioDto, SortOrder } from './find-all-portfolio.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);
  private cache: { data: unknown[] | null; timestamp: number } = {
    data: null,
    timestamp: 0,
  };
  private static readonly CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas
  private static readonly BUCKET = 'portfolio';

  constructor(private readonly supabaseService: SupabaseService) {}

  private invalidateCache() {
    this.cache = { data: null, timestamp: 0 };
    this.logger.log('Caché de portfolio invalidada');
  }

  /** Sube imagen a Supabase Storage y devuelve la URL pública */
  private async uploadImage(
    file: Express.Multer.File,
  ): Promise<string> {
    const ext = file.originalname.split('.').pop() ?? 'jpg';
    const filePath = `${randomUUID()}.${ext}`;

    const { error } = await this.supabaseService
      .getAdminClient()
      .storage.from(PortfolioService.BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error('Error subiendo imagen', error.message);
      throw new InternalServerErrorException('No se pudo subir la imagen.');
    }

    const { data } = this.supabaseService
      .getAdminClient()
      .storage.from(PortfolioService.BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /** Elimina imagen del storage a partir de su URL pública */
  private async deleteImage(publicUrl: string): Promise<void> {
    const parts = publicUrl.split(
      `/storage/v1/object/public/${PortfolioService.BUCKET}/`,
    );
    if (parts.length < 2) return;

    const filePath = parts[1];
    const { error } = await this.supabaseService
      .getAdminClient()
      .storage.from(PortfolioService.BUCKET)
      .remove([filePath]);

    if (error) {
      this.logger.warn(`Error eliminando imagen ${filePath}`, error.message);
    }
  }

  /** Público: portfolio activo con join a services (con caché) */
  async findActive() {
    const now = Date.now();
    if (
      this.cache.data &&
      now - this.cache.timestamp < PortfolioService.CACHE_TTL_MS
    ) {
      return this.cache.data;
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('portfolio')
      .select('id, titulo, descripcion, foto_url, fecha, services(titulo)')
      .eq('activo', true)
      .order('fecha', { ascending: false });

    if (error) {
      this.logger.error(
        'Error obteniendo portfolio activo',
        error.message,
      );
      throw new InternalServerErrorException(
        'No se pudo obtener el portfolio.',
      );
    }

    const mapped = (data ?? []).map((item: Record<string, unknown>) => ({
      id: item.id,
      titulo: item.titulo,
      descripcion: item.descripcion,
      foto_url: item.foto_url,
      fecha: item.fecha,
      categoria: (item.services as Record<string, unknown>)?.titulo ?? '',
    }));

    this.cache = { data: mapped, timestamp: now };
    return mapped;
  }

  /** Admin: todos con paginación y filtros */
  async findAll(query: FindAllPortfolioDto) {
    const {
      page = 1,
      limit = 20,
      sortField = 'fecha',
      sortOrder = SortOrder.DESC,
      activo,
      service_id,
      search,
    } = query;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let supabaseQuery = this.supabaseService
      .getAdminClient()
      .from('portfolio')
      .select('*, services(titulo)', { count: 'exact' });

    if (activo !== undefined) {
      supabaseQuery = supabaseQuery.eq('activo', activo);
    }

    if (service_id) {
      supabaseQuery = supabaseQuery.eq('service_id', service_id);
    }

    if (search) {
      supabaseQuery = supabaseQuery.ilike('titulo', `%${search}%`);
    }

    supabaseQuery = supabaseQuery
      .order(sortField, { ascending: sortOrder === SortOrder.ASC })
      .range(from, to);

    const { data, error, count } = await supabaseQuery;

    if (error) {
      this.logger.error('Error obteniendo portfolio', error.message);
      throw new InternalServerErrorException(
        'No se pudo obtener el portfolio.',
      );
    }

    return { data, total: count, page, limit };
  }

  async create(
    dto: CreatePortfolioDto,
    file?: Express.Multer.File,
  ): Promise<{ success: boolean }> {
    let foto_url: string | null = null;
    if (file) {
      foto_url = await this.uploadImage(file);
    }

    const { error } = await this.supabaseService
      .getAdminClient()
      .from('portfolio')
      .insert([
        {
          titulo: dto.titulo,
          descripcion: dto.descripcion ?? null,
          service_id: dto.service_id,
          fecha: dto.fecha,
          foto_url,
          activo: dto.activo ?? true,
        },
      ]);

    if (error) {
      this.logger.error('Error creando portfolio', error.message);
      throw new InternalServerErrorException(
        'No se pudo crear el item de portfolio.',
      );
    }

    this.invalidateCache();
    this.logger.log(`Portfolio creado: ${dto.titulo}`);
    return { success: true };
  }

  async update(
    id: string,
    dto: UpdatePortfolioDto,
    file?: Express.Multer.File,
  ): Promise<{ success: boolean }> {
    const updateData: Record<string, unknown> = {};
    if (dto.titulo !== undefined) updateData.titulo = dto.titulo;
    if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion;
    if (dto.service_id !== undefined) updateData.service_id = dto.service_id;
    if (dto.fecha !== undefined) updateData.fecha = dto.fecha;
    if (dto.activo !== undefined) updateData.activo = dto.activo;

    // Si hay nueva foto, subir y borrar la anterior
    if (file) {
      // Obtener la URL actual para borrarla después
      const { data: current } = await this.supabaseService
        .getAdminClient()
        .from('portfolio')
        .select('foto_url')
        .eq('id', id)
        .single();

      updateData.foto_url = await this.uploadImage(file);

      if (current?.foto_url) {
        await this.deleteImage(current.foto_url as string);
      }
    }

    if (Object.keys(updateData).length === 0) {
      return { success: true };
    }

    updateData.updated_at = new Date().toISOString();

    const { error } = await this.supabaseService
      .getAdminClient()
      .from('portfolio')
      .update(updateData)
      .eq('id', id);

    if (error) {
      this.logger.error(`Error actualizando portfolio ${id}`, error.message);
      throw new InternalServerErrorException(
        'No se pudo actualizar el item de portfolio.',
      );
    }

    this.invalidateCache();
    this.logger.log(`Portfolio ${id} actualizado`);
    return { success: true };
  }

  async remove(id: string): Promise<{ success: boolean }> {
    // Obtener URL de la foto para borrarla del storage
    const { data: current } = await this.supabaseService
      .getAdminClient()
      .from('portfolio')
      .select('foto_url')
      .eq('id', id)
      .single();

    const { error } = await this.supabaseService
      .getAdminClient()
      .from('portfolio')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error(`Error eliminando portfolio ${id}`, error.message);
      throw new InternalServerErrorException(
        'No se pudo eliminar el item de portfolio.',
      );
    }

    if (current?.foto_url) {
      await this.deleteImage(current.foto_url as string);
    }

    this.invalidateCache();
    this.logger.log(`Portfolio ${id} eliminado`);
    return { success: true };
  }
}
