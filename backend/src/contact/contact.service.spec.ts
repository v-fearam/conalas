import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContactService } from './contact.service';
import { SupabaseService } from '../supabase/supabase.service';
import { ResendService } from '../resend/resend.service';
import { SortOrder } from './find-all-contacts.dto';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ContactService', () => {
  let service: ContactService;
  let configService: { get: jest.Mock };
  let resendService: { sendContactNotification: jest.Mock };

  // Supabase chain mocks
  let insertMock: jest.Mock;
  let fromMock: jest.Mock;
  let rangeMock: jest.Mock;
  let orderMock: jest.Mock;
  let eqFilterMock: jest.Mock;
  let gteMock: jest.Mock;
  let lteMock: jest.Mock;
  let selectMock: jest.Mock;
  let updateEqMock: jest.Mock;
  let updateMock: jest.Mock;

  const validCreateDto = {
    nombre: 'Juan',
    email: 'juan@test.com',
    telefono: '11-1234-5678',
    mensaje: 'Hola',
    turnstileToken: 'valid-token',
  };

  beforeEach(async () => {
    // Build chainable query mock for findAll
    rangeMock = jest.fn();
    orderMock = jest.fn().mockReturnValue({ range: rangeMock });
    lteMock = jest.fn().mockReturnThis();
    gteMock = jest.fn().mockReturnThis();
    eqFilterMock = jest.fn().mockReturnThis();
    selectMock = jest.fn().mockReturnValue({
      eq: eqFilterMock,
      gte: gteMock,
      lte: lteMock,
      order: orderMock,
      range: rangeMock,
    });

    // For chaining after eq/gte/lte, return the same chain
    eqFilterMock.mockReturnValue({
      eq: eqFilterMock,
      gte: gteMock,
      lte: lteMock,
      order: orderMock,
      range: rangeMock,
    });
    gteMock.mockReturnValue({
      eq: eqFilterMock,
      gte: gteMock,
      lte: lteMock,
      order: orderMock,
      range: rangeMock,
    });
    lteMock.mockReturnValue({
      eq: eqFilterMock,
      gte: gteMock,
      lte: lteMock,
      order: orderMock,
      range: rangeMock,
    });
    orderMock.mockReturnValue({
      range: rangeMock,
    });

    // Insert mock for create
    insertMock = jest.fn();

    // Update mock
    updateEqMock = jest.fn();
    updateMock = jest.fn().mockReturnValue({ eq: updateEqMock });

    fromMock = jest.fn().mockImplementation(() => ({
      insert: insertMock,
      select: selectMock,
      update: updateMock,
    }));

    const supabaseService = {
      getClient: jest.fn().mockReturnValue({ from: fromMock }),
      getAdminClient: jest.fn().mockReturnValue({ from: fromMock }),
    };

    configService = {
      get: jest.fn().mockReturnValue('test-turnstile-secret'),
    };

    resendService = {
      sendContactNotification: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        { provide: SupabaseService, useValue: supabaseService },
        { provide: ConfigService, useValue: configService },
        { provide: ResendService, useValue: resendService },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a contact when turnstile is valid', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ success: true }),
      });
      insertMock.mockResolvedValue({ error: null });

      const result = await service.create(validCreateDto);

      expect(result).toEqual({ success: true });
      expect(fromMock).toHaveBeenCalledWith('contacts');
      expect(insertMock).toHaveBeenCalledWith([
        {
          nombre: 'Juan',
          email: 'juan@test.com',
          telefono: '11-1234-5678',
          mensaje: 'Hola',
        },
      ]);
    });

    it('should trigger email notification after successful create', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ success: true }),
      });
      insertMock.mockResolvedValue({ error: null });

      await service.create(validCreateDto);

      expect(resendService.sendContactNotification).toHaveBeenCalledWith({
        nombre: 'Juan',
        email: 'juan@test.com',
        telefono: '11-1234-5678',
        mensaje: 'Hola',
      });
    });

    it('should not fail if email notification throws', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ success: true }),
      });
      insertMock.mockResolvedValue({ error: null });
      resendService.sendContactNotification.mockRejectedValue(
        new Error('Email failed'),
      );

      const result = await service.create(validCreateDto);

      expect(result).toEqual({ success: true });
    });

    it('should throw BadRequestException when turnstile fails', async () => {
      mockFetch.mockResolvedValue({
        json: () =>
          Promise.resolve({ success: false, 'error-codes': ['invalid'] }),
      });

      await expect(service.create(validCreateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when TURNSTILE_SECRET_KEY is missing', async () => {
      configService.get.mockReturnValue(undefined);

      await expect(service.create(validCreateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException on Supabase insert error', async () => {
      mockFetch.mockResolvedValue({
        json: () => Promise.resolve({ success: true }),
      });
      insertMock.mockResolvedValue({ error: { message: 'DB error' } });

      await expect(service.create(validCreateDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw BadRequestException when fetch throws (Turnstile API down)', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(service.create(validCreateDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated contacts with defaults', async () => {
      const mockData = [{ id: '1', nombre: 'Test' }];
      rangeMock.mockResolvedValue({
        data: mockData,
        error: null,
        count: 1,
      });

      const result = await service.findAll({});

      expect(result).toEqual({
        data: mockData,
        total: 1,
        page: 1,
        limit: 10,
      });
    });

    it('should apply respondido filter when provided', async () => {
      rangeMock.mockResolvedValue({ data: [], error: null, count: 0 });

      await service.findAll({ respondido: true });

      expect(eqFilterMock).toHaveBeenCalledWith('respondido', true);
    });

    it('should apply date range filters', async () => {
      rangeMock.mockResolvedValue({ data: [], error: null, count: 0 });

      await service.findAll({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        respondido: true,
      });

      expect(gteMock).toHaveBeenCalledWith('created_at', '2025-01-01');
      expect(lteMock).toHaveBeenCalledWith('created_at', '2025-12-31');
    });

    it('should apply custom sorting', async () => {
      rangeMock.mockResolvedValue({ data: [], error: null, count: 0 });

      await service.findAll({
        sortField: 'nombre',
        sortOrder: SortOrder.ASC,
      });

      expect(orderMock).toHaveBeenCalledWith('nombre', { ascending: true });
    });

    it('should throw InternalServerErrorException on Supabase error', async () => {
      rangeMock.mockResolvedValue({
        data: null,
        error: { message: 'DB error' },
        count: null,
      });

      await expect(service.findAll({})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update contact respondido to true', async () => {
      updateEqMock.mockResolvedValue({ error: null });

      const result = await service.update('uuid-123', { respondido: true });

      expect(result).toEqual({ success: true });
      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          respondido: true,
          respondido_at: expect.any(String),
        }),
      );
    });

    it('should set respondido_at to null when respondido is false', async () => {
      updateEqMock.mockResolvedValue({ error: null });

      await service.update('uuid-123', { respondido: false });

      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          respondido: false,
          respondido_at: null,
        }),
      );
    });

    it('should throw InternalServerErrorException on Supabase error', async () => {
      updateEqMock.mockResolvedValue({ error: { message: 'DB error' } });

      await expect(
        service.update('uuid-123', { respondido: true }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
