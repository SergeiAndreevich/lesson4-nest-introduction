// guards/ip-rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class IpRateLimitGuard implements CanActivate {
    private requests = new Map<string, number[]>();
    private readonly ttl = 10000;
    private readonly limit = 5;

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest();

        // Получаем IP всегда одинаково
        let ip: string;
        const forwarded = req.headers['x-forwarded-for'];

        if (forwarded) {
            const ips = Array.isArray(forwarded) ? forwarded : forwarded.split(',');
            ip = ips[0].trim();
        } else {
            ip = req.ip || req.socket?.remoteAddress || 'unknown';
        }

        // Убираем проверку на test! Всегда используем реальный IP
        console.log(`[RateLimit] IP: ${ip}`);

        const now = Date.now();
        let timestamps = this.requests.get(ip) || [];

        // Очищаем старые записи
        timestamps = timestamps.filter(t => now - t < this.ttl);

        // Проверяем лимит
        if (timestamps.length >= this.limit) {
            console.log(`[RateLimit] BLOCKED ${ip}`);
            throw new HttpException(
                'Too Many Requests',
                HttpStatus.TOO_MANY_REQUESTS,
            );
        }

        timestamps.push(now);
        this.requests.set(ip, timestamps);

        console.log(`[RateLimit] ALLOWED ${ip}: ${timestamps.length}/${this.limit}`);
        return true;
    }
}