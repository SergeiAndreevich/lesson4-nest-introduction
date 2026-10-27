import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {Inject, Injectable} from "@nestjs/common";
import {PG_CONNECTION} from "../../../setup/database/database.constants";
import {Pool} from "pg";
import {TypeBlog, TypeBlogSQL} from "../../types/blog.types";
import {UpdateBlogDto} from "./dto/update-blog.dto";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../../sessionLogic/auth/Entity/user.entity";
import {Repository} from "typeorm";
import {Blog} from "./Entity/blog.entity";

@Injectable()
export class BlogsSQLRepository {
    constructor(
        @Inject(PG_CONNECTION) private readonly pool: Pool,
        @InjectRepository(Blog) private readonly blogRepo: Repository<Blog>,
    ) {}
    async createBlog(blog: TypeBlog):Promise<TypeBlog> {
        const result = await this.pool.query(`
        INSERT INTO blogs (id,name,description,website_url,created_at,is_membership)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        `, [blog.id, blog.name, blog.description, blog.website_url,  blog.created_at, blog.is_membership]);
        return result.rows[0]
    }
    async createBlogSQL(blog: TypeBlogSQL):Promise<TypeBlogSQL> {
        const newBlog = this.blogRepo.create({
            id: blog.id,
            name: blog.name,
            description: blog.description,
            website_url: blog.website_url,
            created_at: blog.created_at,
            is_membership: blog.is_membership
        });

        return this.blogRepo.save(newBlog);
    }

    async updateBlogById(id: string, dto: UpdateBlogDto) {
        const result = await this.pool.query(`
        UPDATE blogs SET name = $1, description = $2, website_url = $3
        WHERE id = $4`, [dto.name,dto.description, dto.websiteUrl, id]);
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