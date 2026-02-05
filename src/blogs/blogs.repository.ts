import {InjectModel} from "@nestjs/mongoose";
import {Blog, BlogDocument} from "./schemas/blog.schema";
import {Model} from "mongoose";
import {CreateBlogDto} from "./dto/create-blog.dto";
import {mapBlogToView} from "../mappers/blog.mapper";
import {UpdateBlogDto} from "./dto/update-blog.dto";
import {CreatePostForBlogDto} from "./dto/create-post-for-blog.dto";
import {PostDocument} from "../posts/schemas/post.schema";
import {Post} from "@nestjs/common";
import {mapNewPostToView} from "../mappers/post.mapper";

export class BlogsRepository {
    constructor(
        @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
        @InjectModel(Post.name) private postModel: Model<PostDocument>,
    ) {}
    async createBlog(dto: CreateBlogDto) {
        const created: BlogDocument = await this.blogModel.create({
            ...dto,
            createdAt: new Date(),
            isMembership: false,
        });
        return mapBlogToView(created);
    }
    async createPostForBlog(blogId: string, blogName: string, dto: CreatePostForBlogDto) {
        const created = await this.postModel.create({
            title: dto.title,
            shortDescription: dto.shortDescription,
            content: dto.content,
            blogId,
            blogName
        })
        return mapNewPostToView(created);
    }

    async updateBlogById(id: string, dto: UpdateBlogDto) {
        const result = await this.blogModel.updateOne(
            { _id: id },
            {
                $set: {
                    name: dto.name,
                    description: dto.description,
                    websiteUrl: dto.websiteUrl,
                },
            },
        );

        return result.matchedCount === 1 && result.modifiedCount === 1;
    }
    async removeBlogById(id: string){
        const result = await this.blogModel.deleteOne({ _id: id });
        return result.deletedCount === 1;
    }
}