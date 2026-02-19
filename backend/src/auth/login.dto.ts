import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(254, { message: 'El email no puede superar los 254 caracteres' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString()
  @MaxLength(128, { message: 'La contraseña no puede superar los 128 caracteres' })
  password: string;
}
