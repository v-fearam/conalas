import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto } from './login.dto';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
  ) { }

  async login(
    dto: LoginDto,
  ): Promise<{
    access_token: string;
    user: { id: string; email: string; nombre: string };
  }> {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('admin_users')
      .select('id, email, password_hash, nombre')
      .eq('email', dto.email)
      .single();

    if (error || !data) {
      this.logger.warn('Intento de login fallido: usuario no encontrado');
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValid = await bcrypt.compare(
      dto.password,
      data.password_hash,
    );
    if (!passwordValid) {
      this.logger.warn('Intento de login fallido: contraseña incorrecta');
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = { sub: data.id, email: data.email };
    const access_token = await this.jwtService.signAsync(payload);

    this.logger.log(`Login admin exitoso: ${data.email}`);

    return {
      access_token,
      user: { id: data.id, email: data.email, nombre: data.nombre },
    };
  }
}
