import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class OptionalBearerGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();

        const userAuth = request.headers.authorization;

        // 👉 если нет заголовка — просто пропускаем
        if (!userAuth) {
            return true;
        }

        const [authType, token] = userAuth.split(" ");

        // 👉 если не Bearer — тоже пропускаем
        if (authType !== "Bearer" || !token) {
            return true;
        }

        try {
            const payload = this.jwtService.verify(token);

            if (
                payload &&
                typeof payload === "object" &&
                "userId" in payload
            ) {
                request.user = {
                    userId: payload.userId,
                    userLogin: payload.userLogin,
                };
            }

            // 👉 даже если payload кривой — не падаем
            return true;
        } catch (e) {
            // ❗ ключевой момент — НЕ кидаем ошибку
            return true;
        }
    }
}