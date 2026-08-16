import { IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {PaginationQueryDto} from "../../../dto/pagination-query.dto";
import {paginationHelper} from "../../../helpers/paginationQuery.helper";
import {IPaginationAndSorting, TypePaginatorObject} from "../../../types/pagination.types";
import {UsersQuerySqlRepository} from "../usersQuery.sql.repository";
import { TypeUserToView} from "../../../types/user.types";



export class FindUsersByQuerySAQuery{
    constructor(
        public query: PaginationQueryDto
    ){}
}

@QueryHandler(FindUsersByQuerySAQuery)
export class FindUsersByQuerySAUseCase implements IQueryHandler<FindUsersByQuerySAQuery>{
    constructor(
        private readonly usersSQLQueryRepo: UsersQuerySqlRepository,
    ) {}
    async execute(query: FindUsersByQuerySAQuery):Promise<TypePaginatorObject<TypeUserToView[]>>{
        const pagination:IPaginationAndSorting = paginationHelper(query.query);
        return await this.usersSQLQueryRepo.findAllUsersByQueryORM(pagination)
    }
}