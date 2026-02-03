import { IsOptional, IsNumberString, IsString } from 'class-validator';

export class PaginationQueryDto {
    @IsOptional()
    @IsNumberString()
    pageNumber = 1;

    @IsOptional()
    @IsNumberString()
    pageSize = 10;

    @IsOptional()
    @IsString()
    searchNameTerm?: string;

    @IsOptional()
    @IsString()
    sortBy: string = 'createdAt';

    @IsOptional()
    @IsString()
    sortDirection: 'asc' | 'desc' = 'desc';
}
