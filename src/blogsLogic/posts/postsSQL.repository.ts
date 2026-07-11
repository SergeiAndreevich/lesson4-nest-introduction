import {InjectModel} from "@nestjs/mongoose";
import {Model, Types} from "mongoose";
import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {UpdatePostDto} from "./dto/update-post.dto";
import {Post, PostDocument} from "./shema/post.schema";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";
import {TypePost} from "../../types/post.types";

@Injectable()
export class PostsSQLRepository {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool
    ) {}
    async createPostSA(post: TypePost): Promise<TypePost> {
        const result = await this.pool.query(`
        INSERT INTO posts (id, title, short_description, content, blog_id, blog_name, created_at, likes_count, dislikes_count)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *
        `,[post.id,post.title,post.short_description,post.content,post.blog_id,post.blog_name,post.created_at,post.likes_count,post.dislikes_count]);
        return result.rows[0]
    }

    async findPostSAById(id: string): Promise<any | null> {
        const result = await this.pool.query(`
        SELECT * FROM posts
        WHERE id = $1
        `, [id]);
        return result.rows[0] ?? null
    }

    async updatePostSAById(id: string, dto: UpdatePostDto):Promise<boolean> {
        const result = await this.pool.query(`
        UPDATE posts
        SET title = $1, short_description = $2, content = $3, blog_id = $4
        WHERE id = $5
        `,[dto.title, dto.shortDescription, dto.content, dto.blogId, id]);
        return result.rowCount === 1
    }

    async updatePostSACounters(postId:string, likesCount: number, dislikesCount: number) {

        const result = await this.pool.query(`
        UPDATE posts
        SET likes_count = $1, dislikes_count = $2
        WHERE id = $3
        `, [likesCount, dislikesCount, postId]);
        return result.rowCount === 1
    }

    async removePostSAById(id: string){
        const result = await this.pool.query(`
        DELETE FROM posts WHERE id = $1`, [id]);
        return result.rowCount === 1
    }
    async removeAllPostsForTest(){
        await this.pool.query(`
        TRUNCATE TABLE posts CASCADE;
        `);
    }
}