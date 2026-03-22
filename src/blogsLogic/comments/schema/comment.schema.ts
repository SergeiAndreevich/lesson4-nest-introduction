import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";
import {CreateCommentDto} from "../dto/create-comment.dto";
import {TypePostView} from "../../../types/post.types";

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

    @Prop({ default: 0 })
    likesCount: number;

    @Prop({ default: 0 })
    dislikesCount: number;

    static createCommentForPost(userId: string, userLogin: string, dto: CreateCommentDto, post: TypePostView): Comment {
        return {
            postId: post.id,
            content: dto.content,
            commentatorInfo: {
                userId: userId,
                userLogin: userLogin,
            },
            createdAt: new Date(),
            likesCount: 0,
            dislikesCount: 0
        } as Comment
    }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
export type CommentDocument = HydratedDocument<Comment>;
