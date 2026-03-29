import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CommentsRepository} from "../comments.repository";
import {BadRequestException, ForbiddenException} from "@nestjs/common";



export class RemoveCommentCommand{
    constructor(
        public userId: string,
        public userLogin: string,
        public commentId: string
    ){}
}

@CommandHandler(RemoveCommentCommand)
export class RemoveCommentUseCase implements ICommandHandler<RemoveCommentCommand>{
    constructor(
        private readonly commentsRepo: CommentsRepository
    ) {}
    async execute(command: RemoveCommentCommand){
        const comment = await this.commentsRepo.findCommentByIdOrFail(command.commentId);
        //const comment = Comment.createCommentForPost(command.userId, command.userLogin, command.dto, post);
        if(comment.commentatorInfo.userId !== command.userId && comment.commentatorInfo.userLogin !== command.userLogin){
            throw new ForbiddenException({message: 'Wrong access, comment wont be changed', field: 'comment authorization'})
        }
        const deleted = await this.commentsRepo.removeCommentByCommentId(command.commentId);
        if (!deleted) {
            //if deletedCount = 0
            throw new BadRequestException('Post was not deleted');
        }
        return
    }
}