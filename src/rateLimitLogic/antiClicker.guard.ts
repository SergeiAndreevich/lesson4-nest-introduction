// anti-clicker.guard.ts

import {
    CanActivate,
    ExecutionContext, HttpException, HttpStatus,
    Injectable,
} from '@nestjs/common';

import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Request} from 'express';
import {RateLimitRepository} from "./rateLimit.repository";


const MAX_REQUESTS = 5;
export const WINDOW_SECONDS = 10.5;

@Injectable()
export class AntiClickerGuard implements CanActivate {
    constructor(
        private rateLimitRepository: RateLimitRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();

        const forwarded = req.headers['x-forwarded-for'];

        // const IP =
        //     typeof forwarded === 'string'
        //         ? forwarded.split(',')[0].trim()
        //         : req.ip || req.socket.remoteAddress || 'unknown';
        const IP =
            (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
            req.ip ||
            req.socket.remoteAddress ||
            'unknown';

        //const URL = req.path;
        const URL = req.originalUrl || req.url;

        //получаем записи запросов из БД
        const count = await this.rateLimitRepository.countInWindow(IP, URL);

        if (count >= MAX_REQUESTS) {
            throw new HttpException(
                {field: 'requests', message: 'too many requests error' },
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }
        await this.rateLimitRepository.create(IP, URL);
        return true;

    }
}