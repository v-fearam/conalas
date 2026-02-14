import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateContactDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString()
  nombre: string;

  @IsNotEmpty({ message: 'El email es obligatorio' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @Matches(/^[\d\s\-+()]{7,20}$/, { message: 'Número de teléfono inválido' })
  telefono: string;

  @IsOptional()
  @IsString()
  mensaje?: string;
}
