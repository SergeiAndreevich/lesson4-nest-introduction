import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {CreateCommentDto} from "../dto/create-comment.dto";
import {PostsQueryRepository} from "../../posts/no-sql/postsQuery.reposiroty";
import {CommentsRepository} from "../no-sql/comments.repository";
import {BadRequestException, NotFoundException} from "@nestjs/common";
import {Comment} from "../schema/comment.schema";
import {CommentsQueryRepository} from "../no-sql/commentQuery.repository";
import {PostsSQLQueryRepository} from "../../posts/postsSQLQuery.reposiroty";
import {CommentsSQLRepository} from "../commentsSA.repository";
import {CommentsSQLQueryRepository} from "../commentSAQuery.repository";
import {createComment} from "../../../types/comment.types";
import {mapCommentToView} from "../../../mappers/comment.mapper";


export class CreateCommentForPostSACommand{
    constructor(
        public userId: string,
        public userLogin: string,
        public postId: string,
        public dto: CreateCommentDto
    ){}
}

@CommandHandler(CreateCommentForPostSACommand)
export class CreateCommentForPostSAUseCase implements ICommandHandler<CreateCommentForPostSACommand>{
    constructor(
        private readonly postsSQLQueryRepository: PostsSQLQueryRepository,
        private readonly commentsSQLRepo: CommentsSQLRepository,
    ) {}
    async execute(command: CreateCommentForPostSACommand){
        const post = await this.postsSQLQueryRepository.findPostById(command.postId);
        if(!post){
            throw new NotFoundException({message: 'Comment has not been created', field: 'comment'});
        }
        const comment = createComment(command.userId, command.dto, post.id);
        const createdComment = await this.commentsSQLRepo.createComment(comment);
        if(!createdComment){
            throw new BadRequestException({message: 'Comment has not been created', field: 'comment'});
        }
        return mapCommentToView(createdComment, command.userLogin)
    }
}

