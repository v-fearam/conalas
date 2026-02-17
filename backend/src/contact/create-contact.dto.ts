import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  nombre: string;

  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'Email inválido' })
  @MaxLength(254, { message: 'El email no puede superar los 254 caracteres' })
  email: string;

  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @Matches(/^[\d\s\-+()]{7,20}$/, { message: 'Número de teléfono inválido' })
  telefono: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'El mensaje no puede superar los 2000 caracteres' })
  mensaje?: string;

  @IsNotEmpty({ message: 'La verificación CAPTCHA es obligatoria' })
  @IsString()
  turnstileToken: string;
}
