import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreateCommentDto} from "../dto/create-comment.dto";
import {PostsQueryRepository} from "../../posts/postsQuery.reposiroty";
import {CommentsRepository} from "../comments.repository";
import {BadRequestException} from "@nestjs/common";
import {Comment} from "../schema/comment.schema";


export class CreateCommentForPostCommand{
    constructor(
        public userId: string,
        public userLogin: string,
        public postId: string,
        public dto: CreateCommentDto
    ){}
}

@CommandHandler(CreateCommentForPostCommand)
export class CreateCommentForPostUseCase implements ICommandHandler<CreateCommentForPostCommand>{
    constructor(
        private readonly postsQueryRepository: PostsQueryRepository,
        private readonly commentsRepo: CommentsRepository
    ) {}
    async execute(command: CreateCommentForPostCommand){
        const post = await this.postsQueryRepository.findPostByIdOrFail(command.postId);
        const comment = Comment.createCommentForPost(command.userId, command.userLogin, command.dto, post);
        const createdCommentId = await this.commentsRepo.createComment(comment);
        if(!createdCommentId){
            throw new BadRequestException({message: 'Comment has not been created', field: 'comment'});
        }
        return createdCommentId
    }
}

