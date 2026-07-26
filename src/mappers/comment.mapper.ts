import {ReactionType} from "../types/reaction.types";
import {CommentDocument} from "../blogsLogic/comments/schema/comment.schema";
import {TypeComment} from "../types/comment.types";

export function mapCommentToView(dto:TypeComment, userLogin: string){
        return{
            id: dto.id,
            content: dto.content,
            commentatorInfo: {
                userId: dto.user_id,
                userLogin: userLogin
            },
            createdAt: dto.created_at.toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: ReactionType.none
            }
        }
}


export function mapCommentToFront(dto: CommentDocument, myStatus: ReactionType) {
    return{
        id: dto._id.toString(),
        content: dto.content,
        commentatorInfo: {
            userId: dto.commentatorInfo.userId,
            userLogin: dto.commentatorInfo.userLogin
        },
        createdAt: dto.createdAt.toISOString(),
        likesInfo: {
            likesCount: dto.likesCount,
            dislikesCount: dto.dislikesCount,
            myStatus: myStatus
        }
    }
}

export function mapCommentSAToFront(dto: TypeComment & {login: string}, myStatus: ReactionType) {
    return{
        id: dto.id,
        content: dto.content,
        commentatorInfo: {
            userId: dto.user_id,
            userLogin: dto.login
        },
        createdAt: dto.created_at.toISOString(),
        likesInfo: {
            likesCount: dto.likes_count,
            dislikesCount: dto.dislikes_count,
            myStatus: myStatus
        }
    }
}
