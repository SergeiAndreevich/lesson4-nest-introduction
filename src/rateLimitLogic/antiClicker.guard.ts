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

@Injectable()
export class AntiClickerGuard implements CanActivate {
    constructor(
        private rateLimitRepository: RateLimitRepository,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();

        const IP =
 //           req.headers['x-forwarded-for'] ||
            req.ip ||
            req.socket.remoteAddress ||
            'unknown';

        const URL = req.path;

        const count = await this.rateLimitRepository.count(
            IP,
            URL,
        );

        if (count >= MAX_REQUESTS) {
            await this.rateLimitRepository.clearAll();
            throw new HttpException(
                {field: 'Server',  message: 'Too many requests'},
                HttpStatus.TOO_MANY_REQUESTS,
            )
        }


        await this.rateLimitRepository.create(
            IP,
            URL,
        );

        return true;
    }
}