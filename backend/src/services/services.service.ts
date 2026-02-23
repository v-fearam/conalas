import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateServiceDto } from './create-service.dto';
import { UpdateServiceDto } from './update-service.dto';
import { FindAllServicesDto, SortOrder } from './find-all-services.dto';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);
  private cache: { data: unknown[] | null; timestamp: number } = {
    data: null,
    timestamp: 0,
  };
  private static readonly CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 horas

  constructor(private readonly supabaseService: SupabaseService) {}

  private invalidateCache() {
    this.cache = { data: null, timestamp: 0 };
    this.logger.log('Caché de servicios invalidada');
  }

  /** Público: servicios activos ordenados por orden (con caché) */
  async findActive() {
    const now = Date.now();
    if (
      this.cache.data &&
      now - this.cache.timestamp < ServicesService.CACHE_TTL_MS
    ) {
      return this.cache.data;
    }

    const { data, error } = await this.supabaseService
      .getClient()
      .from('services')
      .select('id, titulo, descripcion, icono, orden')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error) {
      this.logger.error('Error obteniendo servicios activos', error.message);
      throw new InternalServerErrorException(
        'No se pudieron obtener los servicios.',
      );
    }

    this.cache = { data, timestamp: now };
    return data;
  }

  /** Admin: todos los servicios con paginación y filtros */
  async findAll(query: FindAllServicesDto) {
    const {
      page = 1,
      limit = 20,
      sortField = 'orden',
      sortOrder = SortOrder.ASC,
      activo,
    } = query;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let supabaseQuery = this.supabaseService
      .getAdminClient()
      .from('services')
      .select('*', { count: 'exact' });

    if (activo !== undefined) {
      supabaseQuery = supabaseQuery.eq('activo', activo);
    }

    supabaseQuery = supabaseQuery
      .order(sortField, { ascending: sortOrder === SortOrder.ASC })
      .range(from, to);

    const { data, error, count } = await supabaseQuery;

    if (error) {
      this.logger.error('Error obteniendo servicios', error.message);
      throw new InternalServerErrorException(
        'No se pudieron obtener los servicios.',
      );
    }

    return { data, total: count, page, limit };
  }

  async create(dto: CreateServiceDto): Promise<{ success: boolean }> {
    if (dto.orden === undefined) {
      const { data: maxRow } = await this.supabaseService
        .getAdminClient()
        .from('services')
        .select('orden')
        .order('orden', { ascending: false })
        .limit(1)
        .single();
      dto.orden = (maxRow?.orden ?? 0) + 1;
    }

    const { error } = await this.supabaseService
      .getAdminClient()
      .from('services')
      .insert([
        {
          titulo: dto.titulo,
          descripcion: dto.descripcion,
          icono: dto.icono,
          orden: dto.orden,
          activo: dto.activo ?? true,
        },
      ]);

    if (error) {
      this.logger.error('Error creando servicio', error.message);
      throw new InternalServerErrorException('No se pudo crear el servicio.');
    }

    this.invalidateCache();
    this.logger.log(`Servicio creado: ${dto.titulo}`);
    return { success: true };
  }

  async update(
    id: string,
    dto: UpdateServiceDto,
  ): Promise<{ success: boolean }> {
    const updateData: Record<string, unknown> = {};
    if (dto.titulo !== undefined) updateData.titulo = dto.titulo;
    if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion;
    if (dto.icono !== undefined) updateData.icono = dto.icono;
    if (dto.orden !== undefined) updateData.orden = dto.orden;
    if (dto.activo !== undefined) updateData.activo = dto.activo;

    if (Object.keys(updateData).length === 0) {
      return { success: true };
    }

    updateData.updated_at = new Date().toISOString();

    const { error } = await this.supabaseService
      .getAdminClient()
      .from('services')
      .update(updateData)
      .eq('id', id);

    if (error) {
      this.logger.error(`Error actualizando servicio ${id}`, error.message);
      throw new InternalServerErrorException(
        'No se pudo actualizar el servicio.',
      );
    }

    this.invalidateCache();
    this.logger.log(`Servicio ${id} actualizado`);
    return { success: true };
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      this.logger.error(`Error eliminando servicio ${id}`, error.message);
      throw new InternalServerErrorException(
        'No se pudo eliminar el servicio.',
      );
    }

    this.invalidateCache();
    this.logger.log(`Servicio ${id} eliminado`);
    return { success: true };
  }

  async reorder(
    items: { id: string; orden: number }[],
  ): Promise<{ success: boolean }> {
    const client = this.supabaseService.getAdminClient();

    const results = await Promise.all(
      items.map((item) =>
        client
          .from('services')
          .update({ orden: item.orden, updated_at: new Date().toISOString() })
          .eq('id', item.id),
      ),
    );

    const failed = results.find((r) => r.error);
    if (failed?.error) {
      this.logger.error('Error reordenando servicios', failed.error.message);
      throw new InternalServerErrorException(
        'No se pudieron reordenar los servicios.',
      );
    }

    this.invalidateCache();
    this.logger.log(`Servicios reordenados: ${items.length} items`);
    return { success: true };
  }
}
