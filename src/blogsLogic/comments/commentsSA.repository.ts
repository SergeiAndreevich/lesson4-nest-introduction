import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model, Types} from "mongoose";
import {Comment, CommentDocument} from "./schema/comment.schema";
import {UpdateCommentDto} from "./dto/update-comment.dto";
import {TypeComment, TypeCommentatorInfo} from "../../types/comment.types";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";

@Injectable()
export class CommentsSQLRepository{
    constructor(
        @InjectModel(Comment.name) private readonly commentModel: Model<CommentDocument>,
        @Inject(PG_CONNECTION) private readonly pool:Pool
    ){}

    async createComment(comment: TypeComment): Promise<TypeComment> {
        const result = await this.pool.query(`
        INSERT INTO comments(id, post_id, user_id, content, created_at, likes_count, dislikes_count)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
        `,[comment.id, comment.post_id, comment.user_id, comment.content, comment.created_at, comment.likes_count, comment.dislikes_count]);
        return result.rows[0]
    }
    //хороший вопрос: а как должны быть связаны комментарии и данные о комментаторе
    //мне приходит на ум связка через ключ с таблицей юзеров

    async findCommentByIdOrFail(id:string):Promise<Comment> {
        if (!Types.ObjectId.isValid(id)) {
            throw new NotFoundException({ message: 'CommentId must be ObjectId', field: 'commentId' });
        }
        const comment = await this.commentModel.findById(id).lean();
        if(!comment){
            throw new NotFoundException({message:"Comment not found" , field: 'commentId'});
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
    async removeAllCommentsForTest(){
        await this.pool.query(`
        TRUNCATE TABLE comments
        `);

    }
}