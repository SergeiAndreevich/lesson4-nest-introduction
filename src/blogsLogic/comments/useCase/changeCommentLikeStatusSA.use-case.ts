import {CommentsRepository} from "../no-sql/comments.repository";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {ReactionInputDto} from "../../../reactionsLogic/dto/reaction-input.dto";
import {ReactionsRepository} from "../../../reactionsLogic/reactions.repository";
import {ReactionsQueryRepository} from "../../../reactionsLogic/reactionsQuery.repository";
import {createReaction, EntitiesForReaction, ReactionType} from "../../../types/reaction.types";
import {Reaction} from "../../../reactionsLogic/schema/reaction.schema";
import {NotFoundException} from "@nestjs/common";
import {CommentsSQLRepository} from "../commentsSA.repository";
import {ReactionsSQLRepository} from "../../../reactionsLogic/reactionsSQL.repository";

export class ChangeCommentLikeStatusSACommand{
    constructor(
        public userId: string,
        public userLogin: string,
        public commentId: string,
        public dto: ReactionInputDto
    ){}
}

@CommandHandler(ChangeCommentLikeStatusSACommand)
export class ChangeCommentLikeStatusSAUseCase implements ICommandHandler<ChangeCommentLikeStatusSACommand>{
    constructor(
        private readonly reactionsSQLRepo: ReactionsSQLRepository,
        private readonly commentsSQLRepo: CommentsSQLRepository,
    ) {}
    async execute(command: ChangeCommentLikeStatusSACommand){
        //check comment by commentId
        const comment = await this.commentsSQLRepo.findCommentById(command.commentId);
        if(!comment){
            throw new NotFoundException({message:'Comment was not found' , field: 'commentId'});
        }
        let likesCount = comment.likes_count;
        let dislikesCount = comment.dislikes_count;
        //find reaction
        const reaction = await this.reactionsSQLRepo.findReactionById_EntityType_UserId_OrNull(
            command.commentId, EntitiesForReaction.comment, command.userId
        )
        //check status
        const oldStatus = reaction?.status ?? ReactionType.none;
        const newStatus = command.dto.likeStatus;
        if (oldStatus === newStatus) return;

        //if new reaction is none
        if(reaction && newStatus === ReactionType.none) {
            await this.reactionsSQLRepo.removeReaction(comment.id, EntitiesForReaction.comment, command.userId);
        }
        //if reaction is toggled
        if (reaction && newStatus !== ReactionType.none) {
            await this.reactionsSQLRepo.updateReaction(comment.id, EntitiesForReaction.comment, command.userId, newStatus);
        }

        //if no reaction
        if (!reaction && newStatus !== ReactionType.none) {
            const newReaction = createReaction(comment.id,EntitiesForReaction.comment, command.userId, command.dto.likeStatus);
            const newReactionSQL = await this.reactionsSQLRepo.createReaction(newReaction);
        }

        //change counters
        if (oldStatus === ReactionType.like) likesCount--;
        if (oldStatus === ReactionType.dislike) dislikesCount--;

        if (newStatus === ReactionType.like) likesCount++;
        if (newStatus === ReactionType.dislike) dislikesCount++;

        //save changes
        await this.commentsSQLRepo.updateCommentsCounters(command.commentId,likesCount,dislikesCount);
        return
    }

}
