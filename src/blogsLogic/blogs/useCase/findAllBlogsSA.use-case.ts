import {CommandHandler, ICommandHandler, IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {PaginationQueryDto} from "../../../dto/pagination-query.dto";
import {BlogsQueryRepository} from "../no-sql/blogsQuery.repository";
import {paginationHelper} from "../../../helpers/paginationQuery.helper";
import {IPaginationAndSorting, TypePaginatorObject} from "../../../types/pagination.types";
import {TypeBlogToView} from "../../../types/blog.types";
import {BlogsSQLQueryRepository} from "../blogsSAQuery.repository";



export class FindAllBlogsSAQuery{
    constructor(
        public dto: PaginationQueryDto
    ){}
}

@QueryHandler(FindAllBlogsSAQuery)
export class FindAllBlogsSAUseCase implements IQueryHandler<FindAllBlogsSAQuery>{
    constructor(
        private readonly blogsSQLQueryRepo: BlogsSQLQueryRepository,
    ) {}
    async execute(query: FindAllBlogsSAQuery):Promise<TypePaginatorObject<TypeBlogToView[]>>{
        const pagination:IPaginationAndSorting = paginationHelper(query.dto);
        return await this.blogsSQLQueryRepo.findBlogsByQuery(pagination)
    }
}