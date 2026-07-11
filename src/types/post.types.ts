import {TypeExtendedLikesInfo, TypeLikeDetails} from "./reaction.types";
import {v4 as uuidv4} from "uuid";
import {CreatePostForBlogDto} from "../blogsLogic/blogs/dto/create-post-for-blog.dto";

export type TypePostView = {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt:  string;
    extendedLikesInfo: TypeExtendedLikesInfo
}

export type TypePostInputForBlog = {
    title: string,
    shortDescription: string,
    content: string
}
export type TypePostInput = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
}

export type TypePost = {
    id: string;
    title: string;
    short_description: string;
    content: string;
    blog_id: string;
    blog_name: string;
    created_at:  Date;
    likes_count: number;
    dislikes_count: number;
}

export function createPost(dto: CreatePostForBlogDto, blogId: string, blogName: string): TypePost{
    return{
        id: uuidv4(),
        title: dto.title,
        short_description: dto.shortDescription,
        content: dto.content,
        blog_id: blogId,
        blog_name: blogName,
        created_at:  new Date(),
        likes_count: 0,
        dislikes_count: 0
    }
}