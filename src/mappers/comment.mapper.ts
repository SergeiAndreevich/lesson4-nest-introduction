import {CommentDocument} from "../comments/schemas/comment.schema";
import {ReactionType} from "../types/reaction.types";

export function mapCommentToView(dto){
        return{
            id: dto._id.toString(),
            content: dto.content,
            commentatorInfo: {
                userId: dto.commentatorInfo.userId,
                userLogin: dto.commentatorInfo.userLogin
            },
            createdAt: dto.createdAt.toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: ReactionType.none
            }
        }
    }