import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";


@Schema()
export class Post {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    shortDescription: string;

    @Prop({ required: true })
    content: string;

    @Prop({ required: true })
    blogId: string;

    @Prop({ required: true })
    blogName: string;

    @Prop({ default: Date.now })
    createdAt: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
export type PostDocument = HydratedDocument<Post>;
