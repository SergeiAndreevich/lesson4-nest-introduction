import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";
const WINDOW_SECONDS = 10;


@Schema()
export class RateLimit {
    @Prop({required: true})
    IP: string;

    @Prop({required: true})
    URL: string;

    @Prop({
        required: true,
        default: Date.now
    })
    createdAt: Date;
}

export const RateLimitSchema = SchemaFactory.createForClass(RateLimit);
export type RateLimitDocument = HydratedDocument<RateLimit>;

RateLimitSchema.index(
    {createdAt: 1},
    {expireAfterSeconds: WINDOW_SECONDS},
);
RateLimitSchema.index({
    IP: 1,
    URL: 1,
});