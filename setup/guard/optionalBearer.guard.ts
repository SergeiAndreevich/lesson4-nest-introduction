import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {Observable} from "rxjs";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class OptionalBearerGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        //проверяем, пришел ли токен
        const userAuth = request.headers.authorization;
        if(!userAuth) {
            return true
        }

        //если пришло что-то в headers, надо это оттуда достать
        const [authType, token] = userAuth.split(' ');
        //проверяем, какая это авторизация. Нам нужна именно bearer, другая идет лесом
        //если не токен-авторизация, то не выдадим доступ
        if(authType !== 'Bearer') {
            return true;
        }
        //если не извлекся токен
        if (!token){
            return true;
        }


        try {
            const payload = this.jwtService.verify(token);
            if (!payload || typeof payload !== 'object' || !('userId' in payload)) {
                return true;
            }
            request.user = { userId: payload.userId, userLogin: payload.userLogin };
            return true
        } catch (e) {
            console.error(e);
            return true
        }
    }
}