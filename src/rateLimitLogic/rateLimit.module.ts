// security.module.ts

import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {RateLimit, RateLimitSchema} from "./schema/rateLimit.schema";
import {AntiClickerGuard} from "./antiClicker.guard";
import {RateLimitRepository} from "./rateLimit.repository";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: RateLimit.name,
                schema: RateLimitSchema,
            },
        ]),
    ],
    providers: [AntiClickerGuard, RateLimitRepository],
    exports: [AntiClickerGuard, RateLimitRepository],
})
export class AntiClickerModule {}