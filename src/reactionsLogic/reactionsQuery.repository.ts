import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Injectable, NotFoundException} from "@nestjs/common";
import {Reaction, ReactionDocument} from "./schema/reaction.schema";
import {EntitiesForReaction, ReactionType, TypeLikeDetails} from "../types/reaction.types";


@Injectable()
export class ReactionsQueryRepository {
    constructor(
        @InjectModel(Reaction.name) private readonly reactionModel: Model<ReactionDocument>
    ) {}

    async findReactionById_EntityType_UserId_OrFail(entityId:string, entityType:EntitiesForReaction, userId:string):Promise<ReactionDocument>{
        const reaction = await this.reactionModel.findOne({ entityId, entityType, userId }).lean();
        if(!reaction){
            throw new NotFoundException({message: 'Reaction not found', field: 'entityId, entityType or userId'});
        }
        return reaction
    }

    async getMyStatus(entityType: EntitiesForReaction, entityId: string, userId:string):Promise<ReactionType>{
        const reaction = await this.reactionModel.findOne({
            entityType: entityType,
            entityId: entityId,
            userId: userId
        }).lean();

        // если реакции нет → значит None
        if (!reaction) {
            return ReactionType.none;
        }
        return reaction.status;
    }

    async getNewestLikes(entityId: string, entityType:EntitiesForReaction):Promise<TypeLikeDetails[]> {
        const newestLikes = await this.reactionModel
            .find({
                entityId: entityId,
                entityType: entityType,
                status: ReactionType.like
            })
            .sort({ addedAt: -1 }) // сначала новые
            .limit(3)
            .lean();

        return newestLikes.map(like => ({
            addedAt: like.addedAt.toISOString(),
            userId: like.userId,
            login: like.userLogin
        }));
    }
}