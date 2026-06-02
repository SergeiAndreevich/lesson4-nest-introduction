import {InjectModel} from "@nestjs/mongoose";
import {Injectable} from "@nestjs/common";
import {RateLimit, RateLimitDocument} from "./schema/rateLimit.schema";
import {Model} from "mongoose";

@Injectable()
export class RateLimitRepository {
    constructor(
        @InjectModel(RateLimit.name) private rateLimitModel: Model<RateLimitDocument>,
    ) {}

    async count(IP: string, URL: string) {
        return this.rateLimitModel.countDocuments({
            IP,
            URL,
        });
    }

    async create(IP: string, URL: string) {
        return this.rateLimitModel.create({
            IP,
            URL,
            createdAt: new Date(),
        });
    }

    async clearAll() {
        await this.rateLimitModel.deleteMany({})
        return
    }
}