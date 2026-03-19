import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";
import {EntitiesForReaction, ReactionType} from "../../types/reaction.types";


@Schema()
export class Reaction {
    @Prop({ required: true })
    entityId: string;

    @Prop({ required: true, enum: EntitiesForReaction })
    entityType: string;

    @Prop({ required: true })
    userId:  string;

    @Prop({ required: true, enum: ReactionType })
    status: string;

    @Prop({ required: true })
    addedAt:  Date;


    static createReaction(entityId: string, entityType: EntitiesForReaction, userId: string, status: ReactionType): Reaction {
        return {
            entityId: entityId,
            entityType: entityType,
            userId:  userId,
            status:  status,
            addedAt:  new Date()
        } as Reaction
    }

}

export const ReactionSchema = SchemaFactory.createForClass(Reaction);
export type ReactionDocument = HydratedDocument<Reaction>;