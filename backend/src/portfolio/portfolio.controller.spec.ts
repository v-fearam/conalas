import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { AuthGuard } from '../auth/auth.guard';

describe('PortfolioController', () => {
  let controller: PortfolioController;
  let portfolioService: {
    findActive: jest.Mock;
    findAll: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    portfolioService = {
      findActive: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioController],
      providers: [{ provide: PortfolioService, useValue: portfolioService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PortfolioController>(PortfolioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findActive (GET /portfolio)', () => {
    it('should return active portfolio items', async () => {
      const expected = [
        {
          id: '1',
          titulo: 'Test',
          descripcion: 'Desc',
          foto_url: 'https://example.com/img.jpg',
          fecha: '2026-01-15',
          categoria: 'Etiquetas',
        },
      ];
      portfolioService.findActive.mockResolvedValue(expected);

      const result = await controller.findActive();

      expect(result).toEqual(expected);
      expect(portfolioService.findActive).toHaveBeenCalled();
    });

    it('should propagate InternalServerErrorException from service', async () => {
      portfolioService.findActive.mockRejectedValue(
        new InternalServerErrorException(),
      );

      await expect(controller.findActive()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAll (GET /portfolio/admin)', () => {
    it('should return paginated portfolio items', async () => {
      const expected = {
        data: [{ id: '1', titulo: 'Test' }],
        total: 1,
        page: 1,
        limit: 20,
      };
      portfolioService.findAll.mockResolvedValue(expected);

      const query = { page: 1, limit: 20 };
      const result = await controller.findAll(query);

      expect(result).toEqual(expected);
      expect(portfolioService.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('create (POST /portfolio)', () => {
    const createDto = {
      titulo: 'Nuevo Item',
      service_id: 'uuid-service',
      fecha: '2026-02-01',
    };

    it('should return { success: true } on valid creation', async () => {
      portfolioService.create.mockResolvedValue({ success: true });

      const result = await controller.create(createDto);

      expect(result).toEqual({ success: true });
      expect(portfolioService.create).toHaveBeenCalledWith(
        createDto,
        undefined,
      );
    });

    it('should propagate InternalServerErrorException from service', async () => {
      portfolioService.create.mockRejectedValue(
        new InternalServerErrorException(),
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update (PATCH /portfolio/:id)', () => {
    it('should return { success: true } on valid update', async () => {
      portfolioService.update.mockResolvedValue({ success: true });

      const result = await controller.update('uuid-123', {
        titulo: 'Actualizado',
      });

      expect(result).toEqual({ success: true });
      expect(portfolioService.update).toHaveBeenCalledWith(
        'uuid-123',
        { titulo: 'Actualizado' },
        undefined,
      );
    });
  });

  describe('remove (DELETE /portfolio/:id)', () => {
    it('should return { success: true } on valid deletion', async () => {
      portfolioService.remove.mockResolvedValue({ success: true });

      const result = await controller.remove('uuid-123');

      expect(result).toEqual({ success: true });
      expect(portfolioService.remove).toHaveBeenCalledWith('uuid-123');
    });

    it('should propagate InternalServerErrorException from service', async () => {
      portfolioService.remove.mockRejectedValue(
        new InternalServerErrorException(),
      );

      await expect(controller.remove('uuid-123')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
