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
export enum SortDirection {
    DESC = 'desc',
    ASC = 'asc',
}

export enum SortFields {
    createdAt = 'createdAt',
    login = 'login'
}
