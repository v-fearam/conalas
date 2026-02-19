import { IsBoolean } from 'class-validator';

export class UpdateContactDto {
  @IsBoolean({ message: 'El campo respondido debe ser booleano' })
  respondido: boolean;
}
