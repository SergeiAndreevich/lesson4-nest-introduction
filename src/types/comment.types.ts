import {TypeLikesInfoView} from "./reaction.types";
import {CreateCommentDto} from "../blogsLogic/comments/dto/create-comment.dto";
import {TypePostView} from "./post.types";
import {Prop} from "@nestjs/mongoose";
import {CommentatorInfo} from "../blogsLogic/comments/schema/comment.schema";
import {v4 as uuidv4} from "uuid";

export type TypeCommentInput = {
    content:string;
}
export type TypeCommentatorInfo = {
    userId:string;
    userLogin:string
}

export type TypeComment = {
    id:string;
    post_id: string;
    user_id:string;
    content:string;
    created_at: Date;
    likes_count: number;
    dislikes_count: number;
}

export type TypeCommentFrontView = {
    id: string;
    content: string;
    commentatorInfo:TypeCommentatorInfo;
    createdAt: string;
    likesInfo: TypeLikesInfoView
}

export function createComment(userId: string, dto: CreateCommentDto, postId: string):TypeComment {
    return{
        id: uuidv4(),
        post_id: postId,
        user_id:userId,
        content:dto.content,
        created_at: new Date(),
        likes_count: 0,
        dislikes_count: 0,
    } as TypeComment;
}