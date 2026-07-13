import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {PaginationQueryDto} from "../../../dto/pagination-query.dto";
import {BlogsQueryRepository} from "../../blogs/no-sql/blogsQuery.repository";
import {paginationHelper} from "../../../helpers/paginationQuery.helper";
import {PostsQueryRepository} from "../no-sql/postsQuery.reposiroty";
import {TypePaginatorObject} from "../../../types/pagination.types";
import {TypePostView} from "../../../types/post.types";
import {BlogsSQLQueryRepository} from "../../blogs/blogsSAQuery.repository";
import {BadRequestException} from "@nestjs/common";
import {PostsSQLQueryRepository} from "../postsSQLQuery.reposiroty";



export class FindPostsForBlogSACommand{
    constructor(
        public blogId: string,
        public query: PaginationQueryDto,
        public userId?:string,
    ){}
}

@CommandHandler(FindPostsForBlogSACommand)
export class FindPostsForBlogSAUseCase implements ICommandHandler<FindPostsForBlogSACommand>{
    constructor(
        private readonly blogsSQLQueryRepo: BlogsSQLQueryRepository,
        private readonly postsSQLQueryRepo: PostsSQLQueryRepository
    ) {}
    async execute(command: FindPostsForBlogSACommand):Promise<TypePaginatorObject<TypePostView[]>>{
        const blog = await this.blogsSQLQueryRepo.findBlogById(command.blogId);
        if(!blog){
            throw new BadRequestException({message: 'Blog not found', field: 'blogId'});
        }
        const pagination = paginationHelper(command.query);
        return await this.postsSQLQueryRepo.findPostsForBlogSA(command.blogId, pagination, command.userId);
    }
}