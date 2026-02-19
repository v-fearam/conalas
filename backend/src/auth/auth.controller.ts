import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Throttle({
    short: { ttl: 60000, limit: 5 },
    long: { ttl: 3600000, limit: 20 },
  })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
