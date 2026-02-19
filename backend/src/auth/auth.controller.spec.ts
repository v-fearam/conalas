import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const loginDto = { email: 'admin@test.com', password: 'password123' };

    it('should return access_token and user on success', async () => {
      const expected = {
        access_token: 'jwt-token',
        user: { id: '1', email: 'admin@test.com', nombre: 'Admin' },
      };
      authService.login.mockResolvedValue(expected);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expected);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should propagate UnauthorizedException from service', async () => {
      authService.login.mockRejectedValue(
        new UnauthorizedException('Credenciales inválidas'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
