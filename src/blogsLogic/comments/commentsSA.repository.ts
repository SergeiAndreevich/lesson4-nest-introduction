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

    async findCommentById(id:string):Promise<TypeComment | null> {
        const result = await this.pool.query(`
        SELECT * FROM comments
        WHERE id = $1
        `,[id]);
        return result.rows[0] ?? null
    }

    async updateComment(commentId: string, dto:UpdateCommentDto): Promise<boolean> {
        const result = await this.pool.query(`
        UPDATE comments
        SET content = $1
        WHERE id = $2
        `,[dto.content, commentId]);
        return result.rowCount === 1
    }
    async updateCommentsCounters(commentId:string, likesCount: number, dislikesCount: number):Promise<boolean>{
        const result = await this.pool.query(`
        UPDATE comments
        SET likes_count = $1, dislikes_count = $2
        WHERE id = $3
        `, [likesCount, dislikesCount, commentId]);
        return result.rowCount === 1
    }

    async removeCommentSAByCommentId(commentId: string): Promise<boolean> {
        const result = await this.pool.query(`
        DELETE FROM comments WHERE id = $1`, [commentId]);
        return result.rowCount === 1
    }
    async removeAllCommentsForTest(){
        await this.pool.query(`
        TRUNCATE TABLE comments
        `);

    }

}