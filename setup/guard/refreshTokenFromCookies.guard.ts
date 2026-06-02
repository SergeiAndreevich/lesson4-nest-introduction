import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {Observable} from "rxjs";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class RefreshTokenCookieGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const refreshToken = request.cookies.refreshToken;
        console.log('COOKIE', request.cookies);
        if(!refreshToken) {
            throw new UnauthorizedException("No Token");
        }

        try {
            const payload = this.jwtService.verify(refreshToken);
            if (!payload || typeof payload !== 'object' || !('userId' in payload) || !('userLogin' in payload) || !('deviceId' in payload)) {
                throw new UnauthorizedException();
            }
            request.user = { userId: payload.userId, userLogin: payload.userLogin, deviceId: payload.deviceId };
            return true
        } catch (e) {
            console.error(e);
            throw new UnauthorizedException()
        }
    }
}