import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { SupabaseService } from '../supabase/supabase.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let supabaseService: { getAdminClient: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  const mockUser = {
    id: 'uuid-123',
    email: 'admin@test.com',
    password_hash: '$2b$10$hashedpassword',
    nombre: 'Admin',
  };

  beforeEach(async () => {
    const singleMock = jest.fn();
    const eqMock = jest.fn().mockReturnValue({ single: singleMock });
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock });
    const fromMock = jest.fn().mockReturnValue({ select: selectMock });

    supabaseService = {
      getAdminClient: jest.fn().mockReturnValue({ from: fromMock }),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue('jwt-token-123'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: SupabaseService, useValue: supabaseService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Store references for per-test control
    (service as any)._singleMock = singleMock;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return access_token and user on valid credentials', async () => {
      (service as any)._singleMock.mockResolvedValue({
        data: mockUser,
        error: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'admin@test.com',
        password: 'correct-password',
      });

      expect(result).toEqual({
        access_token: 'jwt-token-123',
        user: { id: 'uuid-123', email: 'admin@test.com', nombre: 'Admin' },
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'uuid-123',
        email: 'admin@test.com',
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      (service as any)._singleMock.mockResolvedValue({
        data: null,
        error: { message: 'not found' },
      });

      await expect(
        service.login({ email: 'wrong@test.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      (service as any)._singleMock.mockResolvedValue({
        data: mockUser,
        error: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'admin@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
