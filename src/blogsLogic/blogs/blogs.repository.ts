import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {CreateBlogDto} from "./dto/create-blog.dto";
import {mapBlogToView} from "../../mappers/blog.mapper";
import {UpdateBlogDto} from "./dto/update-blog.dto";
import {CreatePostForBlogDto} from "./dto/create-post-for-blog.dto";
import {Injectable, Post} from "@nestjs/common";
import {mapNewPostToView} from "../../mappers/post.mapper";
import {Blog, BlogDocument} from "./schema/blog.schema";
import {PostDocument} from "../posts/shema/post.schema";

@Injectable()
export class BlogsRepository {
    constructor(
        @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
        @InjectModel(Post.name) private postModel: Model<PostDocument>,
    ) {}
    async createBlog(blog: Blog) {
        const created: BlogDocument = await this.blogModel.create(blog);
        return created._id.toString()
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