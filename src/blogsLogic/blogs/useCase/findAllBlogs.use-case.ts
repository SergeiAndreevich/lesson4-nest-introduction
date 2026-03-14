import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {PaginationQueryDto} from "../../../dto/pagination-query.dto";
import {BlogsQueryRepository} from "../blogsQuery.repository";
import {paginationHelper} from "../../../helpers/paginationQuery.helper";
import {IPaginationAndSorting, TypePaginatorObject} from "../../../types/pagination.types";
import {TypeBlogToView} from "../../../types/blog.types";



export class FindAllBlogsCommand{
    constructor(
        public query: PaginationQueryDto
    ){}
}

@CommandHandler(FindAllBlogsCommand)
export class FindAllBlogsUseCase implements ICommandHandler<FindAllBlogsCommand>{
    constructor(
        private readonly blogsQueryRepo: BlogsQueryRepository,
    ) {}
    async execute(command: FindAllBlogsCommand):Promise<TypePaginatorObject<TypeBlogToView[]>>{
        const pagination:IPaginationAndSorting = paginationHelper(command.query);
        return await this.blogsQueryRepo.findAllBlogsByQuery(pagination);
    }
}