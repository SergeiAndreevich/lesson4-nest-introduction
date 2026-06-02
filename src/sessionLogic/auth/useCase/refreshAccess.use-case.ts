import {UnauthorizedException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {JwtService} from "@nestjs/jwt";
import {SecurityDevicesRepository} from "../../securityDevices/securityDevices.repository";
import { addSeconds} from "date-fns";
import {REFRESH_TOKEN_TTL_SEC} from "../../../../setup/globalVariables";
import {Session} from "../../securityDevices/schema/session.schema";
import {JwtPayload} from "../../../types/session.types";


export class RefreshAccessCommand{
    constructor(
        public refreshToken: string
    ){}
}

@CommandHandler(RefreshAccessCommand)
export class RefreshAccessUseCase implements ICommandHandler<RefreshAccessCommand>{
    constructor(
        private readonly jwtService: JwtService,
        private readonly sessionsRepo: SecurityDevicesRepository
    ) {}
    async execute(command: RefreshAccessCommand){
        // check actual token
        if (!command.refreshToken) {
            throw new UnauthorizedException({
                field: 'refreshToken',
                message: 'No token'
            });
        }
        let decodedRefresh: any;
        try {
            decodedRefresh = this.jwtService.verify(command.refreshToken);
        } catch (e) {
            throw new UnauthorizedException({
                field: 'refreshToken',
                message: 'Invalid or expired token'
            });
        }
        //достаем содержимое рефреш-токена
        const userId = decodedRefresh.userId;
        const userLogin = decodedRefresh.userLogin;
        const deviceId = decodedRefresh.deviceId;
        const session = await this.sessionsRepo.findFrontSessionByDeviceId(deviceId);
        if(!session){
            throw new UnauthorizedException({field: 'deviceId', message: 'No session found'})
        }

        //Ключевая проверка: является ли этот токен валидным, актуальным, самым последним изданным
        if (Math.floor(new Date(session.lastActivity).getTime() / 1000) !== decodedRefresh.iat) {
            throw new UnauthorizedException({field: 'token', message: 'Wrong refresh token'});

        }

        //проверяем, не истек ли срок сессии
        const now = new Date();
        if(session.expiresAt.getTime() < now.getTime()){
            throw new UnauthorizedException({field: 'session', message: 'Session expired'})
        }

        //создаем новые аксес рефреш токены
        const newAccessToken = this.jwtService.sign({userId: userId, userLogin: userLogin});
        const newRefreshToken = this.jwtService.sign({userId: userId, userLogin: userLogin, deviceId: deviceId}, {expiresIn:  `${REFRESH_TOKEN_TTL_SEC}s`});
        const newRefreshDecoded = this.jwtService.decode(newRefreshToken) as JwtPayload;

        const updated = await this.sessionsRepo.updateSession(deviceId, new Date(newRefreshDecoded.iat*1000),addSeconds(now, REFRESH_TOKEN_TTL_SEC));

        if (!updated) {
            throw new UnauthorizedException({
                field: 'session',
                message: 'Session update failed'
            });
        }

        return  {accessToken: newAccessToken, refreshToken: newRefreshToken}
    }
}