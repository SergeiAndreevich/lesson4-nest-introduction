import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";


@Schema({timestamps: true})
export class Blog {
    @Prop()
    name: string;

    @Prop()
    description: string;

    @Prop()
    websiteUrl: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
export type BlogDocument = HydratedDocument<Blog>;
