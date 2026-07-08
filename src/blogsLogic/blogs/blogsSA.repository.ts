import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Inject, Injectable} from "@nestjs/common";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";
import {TypeBlog} from "../../types/blog.types";
import {UpdateBlogDto} from "./dto/update-blog.dto";

@Injectable()
export class BlogsSQLRepository {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool
    ) {}
    async createBlog(blog: TypeBlog):Promise<TypeBlog> {
        const result = await this.pool.query(`
        INSERT INTO blogs (id,name,description,website_url,created_at,is_membership)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `, [blog.id, blog.name, blog.description, blog.website_url,  blog.created_at, blog.is_membership]);
        return result.rows[0]
    }

    async updateBlogById(id: string, dto: UpdateBlogDto) {
        const result = await this.pool.query(`
        UPDATE blogs SET  name = $1, description = $2, website_url = $3, created_at = NOW()
        WHERE id = $4`)
        return result.rowCount === 1
    }
    async removeBlogById(id: string){
        const result = await this.pool.query(`
        DELETE FROM blogs WHERE id = $1`, [id]);
        return result.rowCount === 1;
    }
    async removeAllBlogsForTest(){
        await this.pool.query(`
        TRUNCATE TABLE blogs CASCADE;
        `);
    }
}