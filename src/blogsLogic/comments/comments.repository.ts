import {Injectable, NotFoundException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Comment, CommentDocument} from "./schema/comment.schema";
import {UpdateCommentDto} from "./dto/update-comment.dto";

@Injectable()
export class CommentsRepository{
    constructor(
        @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>
    ){}

    async createComment(comment: Comment): Promise<string> {
        const createdComment: CommentDocument = await this.commentModel.create(comment)
        return createdComment._id.toString();
    }

    async findCommentByIdOrFail(id:string):Promise<Comment> {
        const comment = await this.commentModel.findById(id).lean();
        if(!comment){
            throw new NotFoundException("Post not found");
        }
        return comment
    }

    async updateComment(commentId: string, dto:UpdateCommentDto): Promise<boolean> {
        const result = await this.commentModel.updateOne(
            { _id: commentId },
            {
                $set: {
                    content: dto.content
                },
            },
        );

        return result.matchedCount === 1 && result.modifiedCount === 1;
    }
    async updateCommentsCounters(commentId:string, likesCount: number, dislikesCount: number):Promise<boolean>{
        const result = await this.commentModel.updateOne(
            { _id: commentId },
            {
                $set: {
                    likesCount: likesCount,
                    dislikesCount: dislikesCount
                },
            },
        );

        return result.matchedCount === 1 && result.modifiedCount === 1;
    }

    async removeCommentByCommentId(commentId: string): Promise<boolean> {
        const result = await this.commentModel.deleteOne({ _id: commentId });
        return result.deletedCount === 1;
    }
}