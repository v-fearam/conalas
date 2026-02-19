import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: { verifyAsync: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    jwtService = {
      verifyAsync: jest.fn(),
    };
    configService = {
      get: jest.fn().mockReturnValue('test-jwt-secret'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  function createMockContext(authHeader?: string): ExecutionContext {
    const request = {
      headers: {
        authorization: authHeader,
      },
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access with a valid token', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'uuid-123',
      email: 'admin@test.com',
    });

    const context = createMockContext('Bearer valid-token');
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
      secret: 'test-jwt-secret',
    });
  });

  it('should set request.user from token payload', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 'uuid-123',
      email: 'admin@test.com',
    });

    const context = createMockContext('Bearer valid-token');
    await guard.canActivate(context);

    const request = context.switchToHttp().getRequest();
    expect((request as any).user).toEqual({
      id: 'uuid-123',
      email: 'admin@test.com',
    });
  });

  it('should throw UnauthorizedException when no token provided', async () => {
    const context = createMockContext(undefined);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException for non-Bearer token', async () => {
    const context = createMockContext('Basic some-token');

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when token is invalid', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

    const context = createMockContext('Bearer invalid-token');

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
