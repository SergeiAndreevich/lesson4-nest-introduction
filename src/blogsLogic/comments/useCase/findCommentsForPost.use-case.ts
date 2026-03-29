import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {PaginationQueryDto} from "../../../dto/pagination-query.dto";
import {CommentsQueryRepository} from "../commentQuery.repository";
import {PostsRepository} from "../../posts/posts.repository";


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
        private readonly postsRepo: PostsRepository,
        private readonly commentsQueryRepo: CommentsQueryRepository
    ) {}
    async execute(command: FindCommentsForPostCommand){
        console.log('Finding comments for post', command);
        await this.postsRepo.findPostByIdOrFail(command.postId);
        const comments = await this.commentsQueryRepo.findCommentsForPost(command.postId, command.query, command.userId);
        console.log('Found comments for post', comments);
        return comments;
    }
}