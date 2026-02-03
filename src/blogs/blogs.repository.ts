import {InjectModel} from "@nestjs/mongoose";
import {Blog, BlogDocument} from "./schemas/blog.schema";
import {Model} from "mongoose";
import {CreateBlogDto} from "./dto/create-blog.dto";
import {mapBlogToView} from "../mappers/blog.mapper";
import {UpdateBlogDto} from "./dto/update-blog.dto";

export class BlogsRepository {
    constructor(
        @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    ) {}
    async createBlog(dto: CreateBlogDto) {
        const created: BlogDocument = await this.blogModel.create({
            ...dto,
            createdAt: new Date(),
            isMembership: false,
        });
        return mapBlogToView(created);
    }


    async findBlogById(id: string){
        return this.blogModel.findById(id).lean();
    }

    async updateBlogById(id: string, dto: UpdateBlogDto) {
        const result = await this.blogModel.updateOne(
            { _id: id },
            {
                $set: {
                    name: dto.name,
                    description: dto.description,
                    websiteUrl: dto.websiteUrl,
                },
            },
        );

        return result.matchedCount === 1 && result.modifiedCount === 1;
    }
    async removeBlogById(id: string){

    }
}