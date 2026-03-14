import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";
import {CreatePostForBlogDto} from "../../blogs/dto/create-post-for-blog.dto";
import {TypeBlogToView} from "../../../types/blog.types";

export type TypePostInput = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: Date
}

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

    static createNewPostForBlog(dto: CreatePostForBlogDto, blog: TypeBlogToView): Post {
        return {
            title: dto.title,
            shortDescription: dto.shortDescription,
            content: dto.content,
            blogId: blog.id,
            blogName: blog.name,
            createdAt: new Date()
        } as Post
    }

}

export const PostSchema = SchemaFactory.createForClass(Post);
export type PostDocument = HydratedDocument<Post>;