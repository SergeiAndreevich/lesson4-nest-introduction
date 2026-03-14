import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {PaginationQueryDto} from "../../../dto/pagination-query.dto";
import {BlogsQueryRepository} from "../blogsQuery.repository";
import {paginationHelper} from "../../../helpers/paginationQuery.helper";
import {PostsQueryRepository} from "../../posts/postsQuery.reposiroty";
import {TypePaginatorObject} from "../../../types/pagination.types";
import {TypePostView} from "../../../types/post.types";



export class FindPostsForBlogCommand{
    constructor(
        public blogId: string,
        public query: PaginationQueryDto
    ){}
}

@CommandHandler(FindPostsForBlogCommand)
export class FindPostsForBlogUseCase implements ICommandHandler<FindPostsForBlogCommand>{
    constructor(
        private readonly blogsQueryRepo: BlogsQueryRepository,
        private readonly postsQueryRepo: PostsQueryRepository
    ) {}
    async execute(command: FindPostsForBlogCommand):Promise<TypePaginatorObject<TypePostView[]>>{
        await this.blogsQueryRepo.findBlogByIdOrFail(command.blogId);
        const pagination = paginationHelper(command.query);
        return await this.postsQueryRepo.findPostsForBlog(command.blogId, pagination);
    }
}