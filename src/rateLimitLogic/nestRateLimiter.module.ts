import { Module } from '@nestjs/common';
import {RateLimiterModule} from "nestjs-rate-limiter";
@Module({
    imports: [
        RateLimiterModule.register({
            points: 5,        // 5 запросов
            duration: 10,     // за 10 секунд
            keyPrefix: 'anti-clicker',
        }),
    ],
    exports: [RateLimiterModule],
})
export class NestRateLimiterModule {}