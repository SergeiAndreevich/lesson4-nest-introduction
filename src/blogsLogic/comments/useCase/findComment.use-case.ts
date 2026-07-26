import {CommandHandler, ICommandHandler, IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {PaginationQueryDto} from "../../../dto/pagination-query.dto";
import {CommentsQueryRepository} from "../no-sql/commentQuery.repository";
import {PostsRepository} from "../../posts/no-sql/posts.repository";
import {PostsSQLRepository} from "../../posts/postsSQL.repository";
import {CommentsSQLQueryRepository} from "../commentSAQuery.repository";
import {NotFoundException} from "@nestjs/common";
import {mapCommentSAToFront, mapCommentToFront, mapCommentToView} from "../../../mappers/comment.mapper";
import {EntitiesForReaction, ReactionType} from "../../../types/reaction.types";
import {ReactionsSQLQueryRepository} from "../../../reactionsLogic/reactionsSQLQuery.repository";


export class FindCommentSAQuery{
    constructor(
        public id: string,
        public userId?: string
    ){}
}

@QueryHandler(FindCommentSAQuery)
export class FindCommentSAUseCase implements IQueryHandler<FindCommentSAQuery>{
    constructor(
        private readonly commentsSQLQueryRepo: CommentsSQLQueryRepository,
        private readonly reactionsSQLQueryRepo: ReactionsSQLQueryRepository
    ) {}
    async execute(query: FindCommentSAQuery){
        const comment = await this.commentsSQLQueryRepo.findCommentById(query.id);
        if(!comment){
            throw new NotFoundException({message:'Comment not found' , field: 'commentId'});
        }
        const myStatus = query.userId ? await this.reactionsSQLQueryRepo.getMyStatus(EntitiesForReaction.comment, query.id, query.userId) : ReactionType.none;
        return mapCommentSAToFront(comment, myStatus);
    }
}