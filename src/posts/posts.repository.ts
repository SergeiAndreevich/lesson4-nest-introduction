import {InjectModel} from "@nestjs/mongoose";
import {Post, PostDocument} from "./schemas/post.schema";
import {Model} from "mongoose";
import {Injectable} from "@nestjs/common";
import {CreatePostDto} from "./dto/create-post.dto";
import {UpdatePostDto} from "./dto/update-post.dto";

@Injectable()
export class PostsRepository {
    constructor(
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>
    ) {}
    async createPost(dto: CreatePostDto) {
        const createdPost: PostDocument = await this.postModel.create({
            ...dto,
            blogName: dto.blogId,
            createdAt: new Date()
        })
        return createdPost;
    }
    async updatePostById(id: string, dto: UpdatePostDto) {
        const result = await this.postModel.updateOne(
            { _id: id },
            {
                $set: {
                    title: dto.title,
                    shortDescription: dto.shortDescription,
                    content: dto.content,
                    blogId: dto.blogId,
                },
            },
        );

        return result.matchedCount === 1 && result.modifiedCount === 1;
    }
    async removePostById(id: string){
        const result = await this.postModel.deleteOne({ _id: id });
        return result.deletedCount === 1;
    }
}