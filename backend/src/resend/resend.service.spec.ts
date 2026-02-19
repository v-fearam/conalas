import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

const mockSend = jest.fn();

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

import { ResendService } from './resend.service';

describe('ResendService', () => {
  function createModule(envVars: Record<string, string | undefined>) {
    const configService = {
      get: jest.fn((key: string) => envVars[key]),
    };

    return Test.createTestingModule({
      providers: [
        ResendService,
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();
  }

  const contact = {
    nombre: 'Juan',
    email: 'juan@test.com',
    telefono: '11-1234-5678',
    mensaje: 'Hola',
  };

  beforeEach(() => {
    mockSend.mockReset();
  });

  it('should be defined', async () => {
    const module = await createModule({
      RESEND_API_KEY: 'test-key',
      NOTIFICATION_EMAIL: 'admin@test.com',
    });
    const service = module.get<ResendService>(ResendService);
    expect(service).toBeDefined();
  });

  it('should send email on valid config', async () => {
    const module = await createModule({
      RESEND_API_KEY: 'test-key',
      NOTIFICATION_EMAIL: 'admin@test.com',
    });
    const service = module.get<ResendService>(ResendService);
    mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });

    await service.sendContactNotification(contact);

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'admin@test.com',
        subject: 'Nueva consulta de Juan',
      }),
    );
  });

  it('should not throw when RESEND_API_KEY is missing', async () => {
    const module = await createModule({
      RESEND_API_KEY: undefined,
      NOTIFICATION_EMAIL: 'admin@test.com',
    });
    const service = module.get<ResendService>(ResendService);

    await expect(
      service.sendContactNotification(contact),
    ).resolves.toBeUndefined();
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should not throw when NOTIFICATION_EMAIL is missing', async () => {
    const module = await createModule({
      RESEND_API_KEY: 'test-key',
      NOTIFICATION_EMAIL: undefined,
    });
    const service = module.get<ResendService>(ResendService);

    await expect(
      service.sendContactNotification(contact),
    ).resolves.toBeUndefined();
  });

  it('should not throw when Resend API returns an error', async () => {
    const module = await createModule({
      RESEND_API_KEY: 'test-key',
      NOTIFICATION_EMAIL: 'admin@test.com',
    });
    const service = module.get<ResendService>(ResendService);
    mockSend.mockResolvedValue({
      data: null,
      error: { message: 'Invalid API key' },
    });

    await expect(
      service.sendContactNotification(contact),
    ).resolves.toBeUndefined();
  });

  it('should include mensaje in email when provided', async () => {
    const module = await createModule({
      RESEND_API_KEY: 'test-key',
      NOTIFICATION_EMAIL: 'admin@test.com',
    });
    const service = module.get<ResendService>(ResendService);
    mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });

    await service.sendContactNotification(contact);

    const htmlArg = mockSend.mock.calls[0][0].html;
    expect(htmlArg).toContain('Hola');
    expect(htmlArg).toContain('Mensaje');
  });

  it('should omit mensaje row when not provided', async () => {
    const module = await createModule({
      RESEND_API_KEY: 'test-key',
      NOTIFICATION_EMAIL: 'admin@test.com',
    });
    const service = module.get<ResendService>(ResendService);
    mockSend.mockResolvedValue({ data: { id: 'email-1' }, error: null });

    await service.sendContactNotification({
      nombre: 'Juan',
      email: 'juan@test.com',
      telefono: '11-1234-5678',
    });

    const htmlArg = mockSend.mock.calls[0][0].html;
    expect(htmlArg).not.toContain('Mensaje');
  });
});
