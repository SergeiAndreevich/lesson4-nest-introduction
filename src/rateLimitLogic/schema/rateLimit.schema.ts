import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {HydratedDocument} from "mongoose";
import {WINDOW_SECONDS} from "../antiClicker.guard";


@Schema()
export class RateLimit {
    @Prop({required: true, index: true})
    IP: string;

    @Prop({required: true})
    URL: string;

    @Prop({ type: Date, default: Date.now, expires: WINDOW_SECONDS })
    createdAt: Date;
}

export const RateLimitSchema = SchemaFactory.createForClass(RateLimit);
export type RateLimitDocument = HydratedDocument<RateLimit>;

// Составной индекс для быстрых запросов
RateLimitSchema.index({ IP: 1, URL: 1, createdAt: -1 });

// RateLimitSchema.index(
//     {createdAt: 1},
//     {expireAfterSeconds: WINDOW_SECONDS},
// );
// RateLimitSchema.index({
//     IP: 1,
//     URL: 1,
// });