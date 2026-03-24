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

    @Prop({ required: true })
    userLogin:  string;

    @Prop({ required: true, enum: ReactionType })
    status: ReactionType;

    @Prop({ required: true })
    addedAt:  Date;


    static createReaction(entityId: string, entityType: EntitiesForReaction, userId: string, userLogin: string, status: ReactionType): Reaction {
        return {
            entityId: entityId,
            entityType: entityType,
            userId:  userId,
            userLogin: userLogin,
            status:  status,
            addedAt:  new Date()
        } as Reaction
    }

}

export const ReactionSchema = SchemaFactory.createForClass(Reaction);
export type ReactionDocument = HydratedDocument<Reaction>;