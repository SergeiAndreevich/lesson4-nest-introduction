import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {PostsQueryRepository} from "../../posts/postsQuery.reposiroty";
import {PaginationQueryDto} from "../../../dto/pagination-query.dto";
import {CommentsQueryRepository} from "../commentQuery.repository";


export class FindCommentsForPostCommand{
    constructor(
        public postId: string,
        public query: PaginationQueryDto,
        public userId?: string
    ){}
}

@CommandHandler(FindCommentsForPostCommand)
export class FindCommentsForPostUseCase implements ICommandHandler<FindCommentsForPostCommand>{
    constructor(
        private readonly postsQueryRepo: PostsQueryRepository,
        private readonly commentsQueryRepo: CommentsQueryRepository
    ) {}
    async execute(command: FindCommentsForPostCommand){
        const comment = await this.postsQueryRepo.findPostByIdOrFail(command.postId);
        return this.commentsQueryRepo.findCommentsForPost(command.postId, command.query, command.userId);
    }
}