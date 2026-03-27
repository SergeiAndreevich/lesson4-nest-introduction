import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {BadRequestException, Injectable, NotFoundException} from "@nestjs/common";
import {Reaction, ReactionDocument} from "./schema/reaction.schema";
import {EntitiesForReaction, ReactionType} from "../types/reaction.types";


@Injectable()
export class ReactionsRepository {
    constructor(
        @InjectModel(Reaction.name) private readonly reactionModel: Model<ReactionDocument>
    ) {}
    async createReaction(reaction:Reaction):Promise<string>{
        const createdReaction:ReactionDocument = await this.reactionModel.create(reaction)
        return createdReaction._id.toString()
    }

    async findReactionById_EntityType_UserId_OrNull(entityId: string,entityType:EntitiesForReaction, userId:string):Promise<ReactionDocument | null> {
        const reaction = await this.reactionModel.findOne({ entityId, entityType, userId }).lean();
        if(!reaction){
            return null
        }
        return reaction
    }

    async updateReactionByIdOrFail(id:string, dto: ReactionType):Promise<void>{
        const result = await this.reactionModel.updateOne({ _id: id },
                {
                    $set: {
                        status: dto,
                        createdAt: new Date(),
                    },
                },
        );
            if(result.matchedCount === 1 && result.modifiedCount === 1){
                return
            }
            throw new BadRequestException({message:'The reaction was not updated' , field: 'reactionId'});
    }

    async removeReactionByIdOrFail(id:string):Promise<void>{
        const result = await this.reactionModel.deleteOne({ _id: id });
        if(result.deletedCount !== 1){
            throw new BadRequestException({message:'The reaction was not deleted' , field: 'reactionId'});
        }
        return
    }


}