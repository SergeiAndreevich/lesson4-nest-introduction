import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {UpdateBlogDto} from "./dto/update-blog.dto";
import {Injectable} from "@nestjs/common";
import {Blog, BlogDocument} from "./schema/blog.schema";

@Injectable()
export class BlogsRepository {
    constructor(
        @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    ) {}
    async createBlog(blog: Blog) {
        const created: BlogDocument = await this.blogModel.create(blog);
        return created._id.toString()
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
        const result = await this.blogModel.deleteOne({ _id: id });
        return result.deletedCount === 1;
    }
    async removeAllBlogsForTest(){
        await this.blogModel.deleteMany({});
        return
    }
}