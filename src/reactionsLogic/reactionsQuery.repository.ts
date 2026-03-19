import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Injectable, NotFoundException} from "@nestjs/common";
import {Reaction, ReactionDocument} from "./schema/reaction.schema";
import {EntitiesForReaction} from "../types/reaction.types";


@Injectable()
export class ReactionsQueryRepository {
    constructor(
        @InjectModel(Reaction.name) private readonly reactionModel: Model<ReactionDocument>
    ) {}

    async findReactionById_EntityType_UserId_OrFail(entityId:string, entityType:EntitiesForReaction, userId:string){
        const reaction = await this.reactionModel.findOne({ entityId, entityType, userId }).lean();
        if(!reaction){
            throw new NotFoundException({message: 'Reaction not found', field: 'entityId, entityType or userId'});
        }
        return reaction
    }
}