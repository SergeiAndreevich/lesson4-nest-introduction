import {InjectModel} from "@nestjs/mongoose";
import {Model, Types} from "mongoose";
import {Inject, Injectable, NotFoundException} from "@nestjs/common";
import {UpdatePostDto} from "./dto/update-post.dto";
import {Post, PostDocument} from "./shema/post.schema";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";

@Injectable()
export class PostsSQLRepository {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool
    ) {}
    async createPostSA(post: any): Promise<string> {
        const result = await this.pool.query(`
        INSERT INTO posts ()
        VALUES ($1,$2,)
        RETURNING *
        `,[]);
        return result.rows[0]
    }

    async findPostSAById(id: string): Promise<any | null> {
        // if (!Types.ObjectId.isValid(id)) {
        //     throw new NotFoundException({ message: 'PostId must be ObjectId', field: 'postId' });
        // }
        const result = await this.pool.query(`
        SELECT * FROM posts
        WHERE id = $1
        `, [id]);
        return result.rows[0] ?? null
    }

    async updatePostSAById(id: string, dto: UpdatePostDto):Promise<boolean> {
        const result = await this.pool.query(`
        
        `,[]);
        // const result = await this.postModel.updateOne(
        //     { _id: id },
        //     {
        //         $set: {
        //             title: dto.title,
        //             shortDescription: dto.shortDescription,
        //             content: dto.content,
        //             blogId: dto.blogId,
        //         },
        //     },
        // );

        return result.rowCount === 1
    }

    async updatePostSACounters(postId:string, likesCount: number, dislikesCount: number) {
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