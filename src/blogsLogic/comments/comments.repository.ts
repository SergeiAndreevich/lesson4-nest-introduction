import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Comment, CommentDocument} from "./schema/comment.schema";

@Injectable()
export class CommentsRepository{
    constructor(
        @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>
    ){}

    async createComment(comment: Comment): Promise<string> {
        const createdComment: CommentDocument = await this.commentModel.create(comment)
        return createdComment._id.toString();
    }
}