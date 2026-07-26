import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CommentsRepository} from "../no-sql/comments.repository";
import {BadRequestException, ForbiddenException, NotFoundException} from "@nestjs/common";
import {UpdateCommentDto} from "../dto/update-comment.dto";
import {CommentsSQLRepository} from "../commentsSA.repository";


export class UpdateCommentSACommand{
    constructor(
        public userId: string,
        public userLogin: string,
        public commentId: string,
        public dto: UpdateCommentDto
    ){}
}

@CommandHandler(UpdateCommentSACommand)
export class UpdateCommentSAUseCase implements ICommandHandler<UpdateCommentSACommand>{
    constructor(
        private readonly commentsSQLRepo: CommentsSQLRepository
    ) {}
    async execute(command: UpdateCommentSACommand){
        const comment = await this.commentsSQLRepo.findCommentById(command.commentId);
        if(!comment){
            throw new NotFoundException({message: 'Comment not found', field: 'commentId'})
        }
        if(comment.user_id !== command.userId){
            throw new ForbiddenException({message: 'Wrong access, comment wont be changed', field: 'comment authorization'})
        }
        const isUpdatedComment = await this.commentsSQLRepo.updateComment(command.commentId, command.dto);
        if(!isUpdatedComment){
            throw new BadRequestException({message: 'Comment not updated', field: 'commentId'})

        }
        return
    }
}