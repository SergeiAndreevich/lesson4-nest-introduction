import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";

export class CommentatorInfo {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    userLogin: string;
}


@Schema()
export class Comment {
    @Prop({required: true})
    postId: string;

    @Prop({ required: true })
    content: string;

    @Prop({ required: true, type: CommentatorInfo })
    commentatorInfo: CommentatorInfo;

    @Prop({ default: Date.now })
    createdAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
export type CommentDocument = HydratedDocument<Comment>;
