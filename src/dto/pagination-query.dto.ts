import {IsOptional, IsNumberString, IsString, IsEnum} from 'class-validator';
import {SortDirection, SortFields} from "../types/pagination.types";
import {EmptyStringToUndefined} from "../customDecorators/emptyStringToUndefined.decorator";

export class PaginationQueryDto {
    @IsOptional()
    @IsNumberString()
    @EmptyStringToUndefined()
    pageNumber?: string;

    @IsOptional()
    @IsNumberString()
    @EmptyStringToUndefined()
    pageSize?: string;

    @IsOptional()
    @IsString()
    @EmptyStringToUndefined()
    searchNameTerm?: string;

    @IsOptional()
    @IsString()
    @EmptyStringToUndefined()
    searchLoginTerm?: string;

    @IsOptional()
    @IsString()
    @EmptyStringToUndefined()
    searchEmailTerm?: string;

    @IsOptional()
    @IsString()
    @EmptyStringToUndefined()
    sortBy?: string;

    @IsOptional()
    @IsString()
    @EmptyStringToUndefined()
    sortDirection?: string;
}
