import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { AuthGuard } from '../auth/auth.guard';

describe('ContactController', () => {
  let controller: ContactController;
  let contactService: {
    create: jest.Mock;
    findAll: jest.Mock;
    update: jest.Mock;
  };

  beforeEach(async () => {
    contactService = {
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactController],
      providers: [{ provide: ContactService, useValue: contactService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ContactController>(ContactController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create (POST /contact)', () => {
    const createDto = {
      nombre: 'Juan',
      email: 'juan@test.com',
      telefono: '11-1234-5678',
      mensaje: 'Hola',
      turnstileToken: 'token',
    };

    it('should return { success: true } on valid submission', async () => {
      contactService.create.mockResolvedValue({ success: true });

      const result = await controller.create(createDto);

      expect(result).toEqual({ success: true });
      expect(contactService.create).toHaveBeenCalledWith(createDto);
    });

    it('should propagate BadRequestException from service', async () => {
      contactService.create.mockRejectedValue(
        new BadRequestException('CAPTCHA falló'),
      );

      await expect(controller.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll (GET /contact)', () => {
    it('should return paginated contacts', async () => {
      const expected = {
        data: [{ id: '1', nombre: 'Test' }],
        total: 1,
        page: 1,
        limit: 10,
      };
      contactService.findAll.mockResolvedValue(expected);

      const query = { page: 1, limit: 10 };
      const result = await controller.findAll(query);

      expect(result).toEqual(expected);
      expect(contactService.findAll).toHaveBeenCalledWith(query);
    });

    it('should propagate InternalServerErrorException from service', async () => {
      contactService.findAll.mockRejectedValue(
        new InternalServerErrorException(),
      );

      await expect(controller.findAll({})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update (PATCH /contact/:id)', () => {
    it('should return { success: true } on valid update', async () => {
      contactService.update.mockResolvedValue({ success: true });

      const result = await controller.update('uuid-123', {
        respondido: true,
      });

      expect(result).toEqual({ success: true });
      expect(contactService.update).toHaveBeenCalledWith('uuid-123', {
        respondido: true,
      });
    });

    it('should propagate InternalServerErrorException from service', async () => {
      contactService.update.mockRejectedValue(
        new InternalServerErrorException(),
      );

      await expect(
        controller.update('uuid-123', { respondido: true }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
