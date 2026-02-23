import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreatePortfolioDto {
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @IsString()
  @MaxLength(150, {
    message: 'El título no puede superar los 150 caracteres',
  })
  titulo: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'La descripción no puede superar los 500 caracteres',
  })
  descripcion?: string;

  @IsNotEmpty({ message: 'El servicio es obligatorio' })
  @IsUUID('4', { message: 'El servicio debe ser un UUID válido' })
  service_id: string;

  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  @IsDateString({}, { message: 'Fecha inválida' })
  fecha: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser booleano' })
  activo?: boolean;
}
