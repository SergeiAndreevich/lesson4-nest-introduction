export interface IPaginationAndSorting {
    pageNumber: number,
    pageSize: number,
    sortBy: SortFields,
    sortDirection: SortDirection,
    searchNameTerm?: string,
    searchLoginTerm?: string,
    searchEmailTerm?: string
}

export type TypePaginatorObject<T> = {
    pagesCount: number
    page: number
    pageSize: number
    totalCount: number
    items: T
}
//'asc'  'desc'
export enum SortDirection {
    DESC = 'desc',
    ASC = 'asc',
}

export enum SortFields {
    createdAt = 'createdAt',
    login = 'login',
    name = 'name'

}
export const allowedSortFields: SortFields[] = [
    SortFields.createdAt,
    SortFields.login,
    SortFields.name
];