import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { AuthGuard } from '../auth/auth.guard';

describe('ServicesController', () => {
  let controller: ServicesController;
  let servicesService: {
    findActive: jest.Mock;
    findAll: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
    reorder: jest.Mock;
  };

  beforeEach(async () => {
    servicesService = {
      findActive: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      reorder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ServicesController],
      providers: [{ provide: ServicesService, useValue: servicesService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ServicesController>(ServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findActive (GET /services)', () => {
    it('should return active services array', async () => {
      const expected = [
        { id: '1', titulo: 'Test', descripcion: 'Desc', icono: 'FaTag', orden: 1 },
      ];
      servicesService.findActive.mockResolvedValue(expected);

      const result = await controller.findActive();

      expect(result).toEqual(expected);
      expect(servicesService.findActive).toHaveBeenCalled();
    });

    it('should propagate InternalServerErrorException from service', async () => {
      servicesService.findActive.mockRejectedValue(
        new InternalServerErrorException(),
      );

      await expect(controller.findActive()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll (GET /services/admin)', () => {
    it('should return paginated services', async () => {
      const expected = {
        data: [{ id: '1', titulo: 'Test' }],
        total: 1,
        page: 1,
        limit: 20,
      };
      servicesService.findAll.mockResolvedValue(expected);

      const query = { page: 1, limit: 20 };
      const result = await controller.findAll(query);

      expect(result).toEqual(expected);
      expect(servicesService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('create (POST /services)', () => {
    const createDto = {
      titulo: 'Nuevo Servicio',
      descripcion: 'Descripción del servicio',
      icono: 'FaStar',
    };

    it('should return { success: true } on valid creation', async () => {
      servicesService.create.mockResolvedValue({ success: true });

      const result = await controller.create(createDto);

      expect(result).toEqual({ success: true });
      expect(servicesService.create).toHaveBeenCalledWith(createDto);
    });

    it('should propagate InternalServerErrorException from service', async () => {
      servicesService.create.mockRejectedValue(
        new InternalServerErrorException(),
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update (PATCH /services/:id)', () => {
    it('should return { success: true } on valid update', async () => {
      servicesService.update.mockResolvedValue({ success: true });

      const result = await controller.update('uuid-123', {
        titulo: 'Actualizado',
      });

      expect(result).toEqual({ success: true });
      expect(servicesService.update).toHaveBeenCalledWith('uuid-123', {
        titulo: 'Actualizado',
      });
    });
  });

  describe('remove (DELETE /services/:id)', () => {
    it('should return { success: true } on valid deletion', async () => {
      servicesService.remove.mockResolvedValue({ success: true });

      const result = await controller.remove('uuid-123');

      expect(result).toEqual({ success: true });
      expect(servicesService.remove).toHaveBeenCalledWith('uuid-123');
    });

    it('should propagate InternalServerErrorException from service', async () => {
      servicesService.remove.mockRejectedValue(
        new InternalServerErrorException(),
      );

      await expect(controller.remove('uuid-123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('reorder (PATCH /services/reorder)', () => {
    it('should return { success: true } on valid reorder', async () => {
      servicesService.reorder.mockResolvedValue({ success: true });

      const items = [
        { id: 'uuid-1', orden: 2 },
        { id: 'uuid-2', orden: 1 },
      ];
      const result = await controller.reorder(items);

      expect(result).toEqual({ success: true });
      expect(servicesService.reorder).toHaveBeenCalledWith(items);
    });
  });
});
