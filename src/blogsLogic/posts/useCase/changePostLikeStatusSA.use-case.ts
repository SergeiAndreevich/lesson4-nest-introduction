import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {ReactionInputDto} from "../../../reactionsLogic/dto/reaction-input.dto";
import {createReaction, EntitiesForReaction, ReactionType} from "../../../types/reaction.types";
import {ReactionsSQLRepository} from "../../../reactionsLogic/reactionsSQL.repository";
import {PostsSQLRepository} from "../postsSQL.repository";
import {NotFoundException} from "@nestjs/common";


export class ChangePostLikeStatusSACommand{
    constructor(
        public userId: string,
        public userLogin: string,
        public postId: string,
        public dto: ReactionInputDto
    ){}
}

@CommandHandler(ChangePostLikeStatusSACommand)
export class ChangePostLikeStatusSAUseCase implements ICommandHandler<ChangePostLikeStatusSACommand>{
    constructor(
        private readonly reactionsSQLRepo: ReactionsSQLRepository,
        private readonly postsSQLRepo: PostsSQLRepository,
    ) {}
    async execute(command: ChangePostLikeStatusSACommand){
        //check post by postId
        const post = await this.postsSQLRepo.findPostSAById(command.postId);
        if(!post){
            throw new NotFoundException({message:'Post was not found' , field: 'postId'});
        }
        let likesCount = post.likes_count;
        let dislikesCount = post.dislikes_count;
        //find reaction
        const reaction = await this.reactionsSQLRepo.findReactionById_EntityType_UserId_OrNull(
            command.postId, EntitiesForReaction.post, command.userId
        )
        //check status
        const oldStatus = reaction?.status ?? ReactionType.none;
        const newStatus = command.dto.likeStatus;
        if (oldStatus === newStatus) return;

        //if new reaction is none
        if(reaction && newStatus === ReactionType.none) {
            await this.reactionsSQLRepo.removeReaction(post.id, EntitiesForReaction.post, command.userId);
        }
        //if reaction is toggled
        if (reaction && newStatus !== ReactionType.none) {
            await this.reactionsSQLRepo.updateReaction(post.id, EntitiesForReaction.post, command.userId, newStatus);
        }

        //if no reaction
        if (!reaction && newStatus !== ReactionType.none) {
            const newReaction = createReaction(post.id,EntitiesForReaction.post, command.userId, command.dto.likeStatus);
            const newReactionSQL = await this.reactionsSQLRepo.createReaction(newReaction);
        }

        //change counters
        if (oldStatus === ReactionType.like) likesCount--;
        if (oldStatus === ReactionType.dislike) dislikesCount--;

        if (newStatus === ReactionType.like) likesCount++;
        if (newStatus === ReactionType.dislike) dislikesCount++;

        //save changes
        await this.postsSQLRepo.updatePostSACounters(command.postId,likesCount,dislikesCount);
        return
    }

}

