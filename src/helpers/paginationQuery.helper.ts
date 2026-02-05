import {IPaginationAndSorting, SortDirection, SortFields} from "../types/pagination.types";
import {PaginationQueryDto} from "../dto/pagination-query.dto";

const PAGE_NUMBER = 1;
const PAGE_SIZE = 10;
const SORT_BY = SortFields.createdAt;
const SORT_DIRECTION = SortDirection.DESC;

export function paginationHelper(filter: PaginationQueryDto): IPaginationAndSorting {
    return {
        pageNumber: filter.pageNumber ? Number(filter.pageNumber) : PAGE_NUMBER,
        pageSize: filter.pageSize ? Number(filter.pageSize) : PAGE_SIZE,
        sortBy: filter.sortBy ? filter.sortBy : SORT_BY,
        sortDirection: filter.sortDirection ? filter.sortDirection : SORT_DIRECTION,
        searchNameTerm: filter.searchNameTerm ? filter.searchNameTerm : undefined,
        searchLoginTerm: filter.searchLoginTerm ?  filter.searchLoginTerm : undefined,
        searchEmailTerm: filter.searchEmailTerm ? filter.searchEmailTerm : undefined
    };
}
