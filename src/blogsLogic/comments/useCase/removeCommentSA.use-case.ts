import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CommentsRepository} from "../no-sql/comments.repository";
import {BadRequestException, ForbiddenException, NotFoundException} from "@nestjs/common";
import {CommentsSQLRepository} from "../commentsSA.repository";



export class RemoveCommentSACommand{
    constructor(
        public userId: string,
        public userLogin: string,
        public commentId: string
    ){}
}

@CommandHandler(RemoveCommentSACommand)
export class RemoveCommentSAUseCase implements ICommandHandler<RemoveCommentSACommand>{
    constructor(
        private readonly commentsSQLRepo: CommentsSQLRepository
    ) {}
    async execute(command: RemoveCommentSACommand){
        const comment = await this.commentsSQLRepo.findCommentById(command.commentId);
        if(!comment){
            throw new NotFoundException({message: 'Comment not found', field: 'commentId'})
        }
        if(comment.user_id !== command.userId){
            throw new ForbiddenException({message: 'Wrong access, comment wont be changed', field: 'comment authorization'})
        }
        const deleted = await this.commentsSQLRepo.removeCommentSAByCommentId(command.commentId);
        if (!deleted) {
            throw new BadRequestException('Comment was not deleted');
        }
        return
    }
}