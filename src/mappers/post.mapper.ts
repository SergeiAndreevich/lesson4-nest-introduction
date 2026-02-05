import {TypePostView} from "../types/post.types";
import {ReactionType} from "../types/reaction.types";
import {PostDocument} from "../posts/schemas/post.schema";

export function mapNewPostToView(dto: PostDocument):TypePostView {
    return {
        id: dto.id,
        title: dto.title,
        shortDescription: dto.shortDescription,
        content: dto.content,
        blogId: dto.blogId,
        blogName: dto.blogName,
        createdAt: dto.createdAt.toISOString(),
        extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: ReactionType.none,
            newestLikes: []
    }
    }
}

export function mapPostToView(dto: PostDocument):TypePostView {
    return {
        id: dto._id.toString(),
        title: dto.title,
        shortDescription: dto.shortDescription,
        content: dto.content,
        blogId: dto.blogId,
        blogName: dto.blogName,
        createdAt: dto.createdAt.toISOString(),
        extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: ReactionType.none,
            newestLikes: []
        }
    }
}