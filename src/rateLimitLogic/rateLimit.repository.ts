import {InjectModel} from "@nestjs/mongoose";
import {Injectable} from "@nestjs/common";
import {RateLimit, RateLimitDocument} from "./schema/rateLimit.schema";
import {Model} from "mongoose";
import {WINDOW_SECONDS} from "./antiClicker.guard";

@Injectable()
export class RateLimitRepository {
    constructor(
        @InjectModel(RateLimit.name) private rateLimitModel: Model<RateLimitDocument>,
    ) {}

    async countInWindow(IP: string, URL: string): Promise<number> {
        const windowStart = new Date(Date.now() - WINDOW_SECONDS * 1000);

        return this.rateLimitModel.countDocuments({
            IP,
            URL,
            createdAt: { $gte: windowStart }, // ✅ Явно ограничиваем временное окно
        });
    }

    async create(IP: string, URL: string): Promise<RateLimitDocument> {
        return this.rateLimitModel.create({
            IP,
            URL,
            createdAt: new Date(),
        });
    }
}