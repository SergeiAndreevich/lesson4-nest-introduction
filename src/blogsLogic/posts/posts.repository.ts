import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Injectable, NotFoundException} from "@nestjs/common";
import {UpdatePostDto} from "./dto/update-post.dto";
import {Post, PostDocument} from "./shema/post.schema";
import {mapPostToView} from "../../mappers/post.mapper";

@Injectable()
export class PostsRepository {
    constructor(
        @InjectModel(Post.name) private readonly postModel: Model<PostDocument>
    ) {}
    async createPost(post: Post): Promise<string> {
        const createdPost: PostDocument = await this.postModel.create(post)
        return createdPost._id.toString();
    }

    async findPostByIdOrFail(id: string): Promise<Post> {
        const post = await this.postModel.findById(id).lean();
        if(!post){
            throw new NotFoundException("Post not found");
        }
        return post;    }

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
    async updatePostLikesCount(id: string, dto: number) {
        const result = await this.postModel.updateOne(
            { _id: id },
            {
                $set: {
                    likesCount: dto
                },
            },
        );

        return result.matchedCount === 1 && result.modifiedCount === 1;
    }
    async updatePostDislikesCount(id: string, dto: number) {
        const result = await this.postModel.updateOne(
            { _id: id },
            {
                $set: {
                    dislikesCount: dto
                },
            },
        );

        return result.matchedCount === 1 && result.modifiedCount === 1;
    }
    async updatePostCounters(postId:string, likesCount: number, dislikesCount: number) {
        const result = await this.postModel.updateOne(
            { _id: postId },
            {
                $set: {
                    likesCount: likesCount,
                    dislikesCount: dislikesCount
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