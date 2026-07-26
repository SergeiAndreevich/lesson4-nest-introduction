import {CommandHandler, ICommandHandler, IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {PaginationQueryDto} from "../../../dto/pagination-query.dto";
import {CommentsQueryRepository} from "../no-sql/commentQuery.repository";
import {PostsRepository} from "../../posts/no-sql/posts.repository";
import {PostsSQLRepository} from "../../posts/postsSQL.repository";
import {CommentsSQLQueryRepository} from "../commentSAQuery.repository";
import {NotFoundException} from "@nestjs/common";
import {paginationHelper} from "../../../helpers/paginationQuery.helper";


export class FindCommentsForPostSAQuery{
    constructor(
        public postId: string,
        public dto: PaginationQueryDto,
        public userId?: string
    ){}
}

@QueryHandler(FindCommentsForPostSAQuery)
export class FindCommentsForPostSAUseCase implements IQueryHandler<FindCommentsForPostSAQuery>{
    constructor(
        private readonly postsRepo: PostsRepository,
        private readonly commentsQueryRepo: CommentsQueryRepository,
        private readonly postsSQLRepo: PostsSQLRepository,
        private readonly commentsSQLQueryRepo: CommentsSQLQueryRepository
    ) {}
    async execute(query: FindCommentsForPostSAQuery){
        const pagination = paginationHelper(query.dto)
        const post = await this.postsSQLRepo.findPostSAById(query.postId);
        if(!post){
            throw new NotFoundException({message: 'Comment has not been created', field: 'comment'});
        }
        const comments = await this.commentsSQLQueryRepo.findCommentsForPostSA(post.id,pagination, query.userId);
        return comments;
    }
}