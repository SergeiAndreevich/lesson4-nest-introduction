import {CommandHandler, ICommandHandler, IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {PaginationQueryDto} from "../../../dto/pagination-query.dto";
import {BlogsQueryRepository} from "../no-sql/blogsQuery.repository";
import {paginationHelper} from "../../../helpers/paginationQuery.helper";
import {IPaginationAndSorting, TypePaginatorObject} from "../../../types/pagination.types";
import {TypeBlogToView} from "../../../types/blog.types";
import {BlogsSQLQueryRepository} from "../blogsSAQuery.repository";
import {BadRequestException, NotFoundException} from "@nestjs/common";
import {mapBlogToViewSA} from "../../../mappers/blog.mapper";



export class FindBlogSAQuery{
    constructor(
        public id: string
    ){}
}

@QueryHandler(FindBlogSAQuery)
export class FindBlogSAUseCase implements IQueryHandler<FindBlogSAQuery>{
    constructor(
        private readonly blogsSQLQueryRepo: BlogsSQLQueryRepository,
    ) {}
    async execute(query: FindBlogSAQuery):Promise<TypeBlogToView>{
        const blog = await this.blogsSQLQueryRepo.findBlogById(query.id);
        if(!blog){
            throw new NotFoundException({message: 'Blog not found', field: 'blogId'});
        }
        return mapBlogToViewSA(blog)
    }
}