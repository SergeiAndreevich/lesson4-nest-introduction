import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {ReactionsRepository} from "../../../reactionsLogic/reactions.repository";
import {ReactionInputDto} from "../../../reactionsLogic/dto/reaction-input.dto";
import {ReactionsQueryRepository} from "../../../reactionsLogic/reactionsQuery.repository";
import {EntitiesForReaction, ReactionType} from "../../../types/reaction.types";
import {Reaction} from "../../../reactionsLogic/schema/reaction.schema";
import {PostsRepository} from "../posts.repository";


export class ChangePostLikeStatusCommand{
    constructor(
        public userId: string,
        public userLogin: string,
        public postId: string,
        public dto: ReactionInputDto
    ){}
}

@CommandHandler(ChangePostLikeStatusCommand)
export class ChangePostLikeStatusUseCase implements ICommandHandler<ChangePostLikeStatusCommand>{
    constructor(
        private readonly reactionsRepo: ReactionsRepository,
        private readonly postsRepo: PostsRepository,
    ) {}
    async execute(command: ChangePostLikeStatusCommand){
        //check post by postId
        const post = await this.postsRepo.findPostByIdOrFail(command.postId);
        let likesCount = post.likesCount;
        let dislikesCount = post.dislikesCount;
        //find reaction
        const reaction = await this.reactionsRepo.findReactionById_EntityType_UserId_OrNull(
            command.postId, EntitiesForReaction.post, command.userId
        )
        //check status
        const oldStatus = reaction?.status ?? ReactionType.none;
        const newStatus = command.dto.likeStatus;
        if (oldStatus === newStatus) return;

        //if new reaction is none
        if(reaction && newStatus === ReactionType.none) {
            await this.reactionsRepo.removeReactionByIdOrFail(reaction._id.toString())
        }
        //if reaction is toggled
        if (reaction && newStatus !== ReactionType.none) {
            await this.reactionsRepo.updateReactionByIdOrFail(reaction._id.toString(), newStatus);
        }

        //if no reaction
        if (!reaction && newStatus !== ReactionType.none) {
            const newReaction = Reaction.createReaction(command.postId, EntitiesForReaction.post, command.userId, command.userLogin, command.dto.likeStatus)
            const newReactionId = await this.reactionsRepo.createReaction(newReaction);
        }

        //change counters
        if (oldStatus === ReactionType.like) likesCount--;
        if (oldStatus === ReactionType.dislike) dislikesCount--;

        if (newStatus === ReactionType.like) likesCount++;
        if (newStatus === ReactionType.dislike) dislikesCount++;

        //save changes
        await this.postsRepo.updatePostCounters(command.postId,likesCount,dislikesCount);
        return
    }

}

