import {IsOptional, IsNumberString, IsString, IsEnum} from 'class-validator';
import {SortDirection, SortFields} from "../types/pagination.types";

export class PaginationQueryDto {
    @IsOptional()
    @IsNumberString()
    pageNumber?: string;

    @IsOptional()
    @IsNumberString()
    pageSize?: string;

    @IsOptional()
    @IsString()
    searchNameTerm?: string;

    @IsOptional()
    @IsString()
    searchLoginTerm?: string;

    @IsOptional()
    @IsString()
    searchEmailTerm?: string;

    @IsOptional()
    @IsEnum(SortFields)
    sortBy?: SortFields;

    @IsOptional()
    @IsEnum(SortDirection)
    sortDirection?: SortDirection;
}
