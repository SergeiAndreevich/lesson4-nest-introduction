import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";
import {v4 as uuidv4} from "uuid";
import {add} from "date-fns";
import {CreateBlogDto} from "../dto/create-blog.dto";


@Schema({timestamps: true})
export class Blog {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    websiteUrl: string;

    @Prop({ required: true, default: () => new Date() })
    createdAt: Date;

    @Prop({ required: true, default: false })
    isMembership: boolean;

    static createNewBlog(dto: CreateBlogDto): Blog {
        return {
            name: dto.name,
            description: dto.description,
            websiteUrl: dto.websiteUrl,
            createdAt: new Date(),
            isMembership: false
        } as Blog
    }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
export type BlogDocument = HydratedDocument<Blog>;
