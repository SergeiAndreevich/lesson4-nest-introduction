import {TypeLikesInfoView} from "./reaction.types";

export type TypeCommentInput = {
    content:string;
}
export type TypeCommentatorInfo = {
    userId:string;
    userLogin:string
}

export type TypeComment = {
    postId: string;
    content:string;
    commentatorInfo:TypeCommentatorInfo;
    createdAt: Date;
}
export type TypeCommentFrontView = {
    id: string;
    content: string;
    commentatorInfo:TypeCommentatorInfo;
    createdAt: string;
    likesInfo: TypeLikesInfoView
}