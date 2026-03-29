import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CommentsRepository} from "../comments.repository";
import {BadRequestException, ForbiddenException} from "@nestjs/common";
import {UpdateCommentDto} from "../dto/update-comment.dto";


export class UpdateCommentCommand{
    constructor(
        public userId: string,
        public userLogin: string,
        public commentId: string,
        public dto: UpdateCommentDto
    ){}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand>{
    constructor(
        private readonly commentsRepo: CommentsRepository
    ) {}
    async execute(command: UpdateCommentCommand){
        const comment = await this.commentsRepo.findCommentByIdOrFail(command.commentId);
        //const comment = Comment.createCommentForPost(command.userId, command.userLogin, command.dto, post);
        if(comment.commentatorInfo.userId !== command.userId){
            throw new ForbiddenException({message: 'Wrong access, comment wont be changed', field: 'comment authorization'})
        }
        await this.commentsRepo.updateComment(command.commentId, command.dto);
        return
    }
}