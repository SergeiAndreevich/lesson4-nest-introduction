import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from "@nestjs/common";
import {Observable} from "rxjs";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class BasicGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const auth = request.headers.authorization;
        if(!auth) {
            throw new UnauthorizedException("No Auth");
        }
        //Basic-авторизация это строка Basic gfsladfasj:sfhdksdfh
        const [header,  body] = auth.split(' ');
        if(header !== 'Basic' || !body){
            throw new UnauthorizedException()
        }
        const decodedBody = Buffer.from(body, 'base64').toString('utf-8');
        const [login, password] = decodedBody.split(':');
        if(login !== 'admin' || password !== 'qwerty'){
            throw new UnauthorizedException()
        }
        return true
    }
}