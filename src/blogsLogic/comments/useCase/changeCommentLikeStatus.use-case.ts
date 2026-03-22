import {CommentsRepository} from "../comments.repository";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {ReactionInputDto} from "../../../reactionsLogic/dto/reaction-input.dto";
import {ReactionsRepository} from "../../../reactionsLogic/reactions.repository";
import {ReactionsQueryRepository} from "../../../reactionsLogic/reactionsQuery.repository";
import {EntitiesForReaction, ReactionType} from "../../../types/reaction.types";
import {Reaction} from "../../../reactionsLogic/schema/reaction.schema";

export class ChangeCommentLikeStatusCommand{
    constructor(
        public userId: string,
        public commentId: string,
        public dto: ReactionInputDto
    ){}
}

@CommandHandler(ChangeCommentLikeStatusCommand)
export class ChangeCommentLikeStatusUseCase implements ICommandHandler<ChangeCommentLikeStatusCommand>{
    constructor(
        private readonly reactionsRepo: ReactionsRepository,
        private readonly reactionsQueryRepo: ReactionsQueryRepository,
        private readonly commentsRepo: CommentsRepository,
    ) {}
    async execute(command: ChangeCommentLikeStatusCommand){
        //check comment by commentId
        const comment = await this.commentsRepo.findCommentByIdOrFail(command.commentId);
        let likesCount = comment.likesCount;
        let dislikesCount = comment.dislikesCount;
        //find reaction
        const reaction = await this.reactionsQueryRepo.findReactionById_EntityType_UserId_OrFail(
            command.commentId, EntitiesForReaction.comment, command.userId
        )
        //check status
        const oldStatus = reaction?.status ?? ReactionType.none;
        const newStatus = command.dto.likeStatus;
        if (oldStatus === newStatus) return;

        //if no reaction
        if (!reaction && newStatus !== ReactionType.none) {
            const newReaction = Reaction.createReaction(command.commentId, EntitiesForReaction.comment, command.userId, command.dto.likeStatus)
            const newReactionId = await this.reactionsRepo.createReaction(newReaction);
        }

        //if new reaction is none
        if(reaction && newStatus === ReactionType.none) {
            await this.reactionsRepo.removeReactionByIdOrFail(reaction._id.toString())
        }
        //if reaction is toggled
        if (reaction && newStatus !== ReactionType.none) {
            await this.reactionsRepo.updateReactionByIdOrFail(reaction._id.toString(), newStatus);
        }

        //change counters
        if (oldStatus === ReactionType.like) likesCount--;
        if (oldStatus === ReactionType.dislike) dislikesCount--;

        if (newStatus === ReactionType.like) likesCount++;
        if (newStatus === ReactionType.dislike) dislikesCount++;

        //save changes
        await this.commentsRepo.updateCommentsCounters(command.commentId,likesCount,dislikesCount);
        return
    }

}
