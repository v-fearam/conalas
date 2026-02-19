import { IsOptional, IsInt, Min, IsString, IsBoolean, IsDateString, IsEnum } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export class FindAllContactsDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    sortField?: string = 'created_at';

    @IsOptional()
    @IsEnum(SortOrder)
    sortOrder?: SortOrder = SortOrder.DESC;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    respondido?: boolean;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;
}
