import {CommandHandler, ICommandHandler, IQueryHandler} from "@nestjs/cqrs";
import {PaginationQueryDto} from "../../../dto/pagination-query.dto";
import {BlogsQueryRepository} from "../../blogs/no-sql/blogsQuery.repository";
import {paginationHelper} from "../../../helpers/paginationQuery.helper";
import {PostsQueryRepository} from "../no-sql/postsQuery.reposiroty";
import {TypePaginatorObject} from "../../../types/pagination.types";
import {TypePostView} from "../../../types/post.types";
import {BlogsSQLQueryRepository} from "../../blogs/blogsSAQuery.repository";
import {BadRequestException} from "@nestjs/common";
import {PostsSQLQueryRepository} from "../postsSQLQuery.reposiroty";



export class FindPostsForBlogSAQuery{
    constructor(
        public blogId: string,
        public query: PaginationQueryDto,
        public userId?:string,
    ){}
}

@CommandHandler(FindPostsForBlogSAQuery)
export class FindPostsForBlogSAUseCase implements IQueryHandler<FindPostsForBlogSAQuery>{
    constructor(
        private readonly blogsSQLQueryRepo: BlogsSQLQueryRepository,
        private readonly postsSQLQueryRepo: PostsSQLQueryRepository
    ) {}
    async execute(query: FindPostsForBlogSAQuery):Promise<TypePaginatorObject<TypePostView[]>>{
        const blog = await this.blogsSQLQueryRepo.findBlogById(query.blogId);
        if(!blog){
            throw new BadRequestException({message: 'Blog not found', field: 'blogId'});
        }
        const pagination = paginationHelper(query.query);
        return await this.postsSQLQueryRepo.findPostsForBlogSA(query.blogId, pagination, query.userId);
    }
}