import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";


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
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
export type BlogDocument = HydratedDocument<Blog>;
