import {BadRequestException, UnauthorizedException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {JwtService} from "@nestjs/jwt";
import {SecurityDevicesRepository} from "../../securityDevices/securityDevices.repository";
import {JwtPayload} from "../../../types/session.types";
import {REFRESH_SECRET} from "../../../../setup/globalVariables";


export class LogoutCommand{
    constructor(
        public refreshToken: string
    ){}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand>{
    constructor(
        private readonly jwtService: JwtService,
        private readonly sessionsRepo: SecurityDevicesRepository
    ) {}
    async execute(command: LogoutCommand){
        // check actual token
        if(!command.refreshToken) {
            throw new UnauthorizedException({field: 'refreshToken',  message: 'No refresh token'});
        }
        //получаем на вход рефрешТокен
        let decodedRefresh: JwtPayload;
        try {
            decodedRefresh = this.jwtService.verify(command.refreshToken, {secret: REFRESH_SECRET});
        }
        catch (e) {
            throw new UnauthorizedException({field: 'token come in logout', message: 'Invalid token in decoded refresh with verify' });
        }

        //достаем из рефреша уникальный Айди юзера, уникальный номер устройства и версию сессии
        const userId =  decodedRefresh.userId;
        const deviceId = decodedRefresh.deviceId;
        let sessionVersion = decodedRefresh.sessionVersion;
        //ищем сессию сразу по всем трём уникальным полям
        //const session = await this.sessionsRepo.findSession(userId,deviceId, sessionVersion);

        //по двум полям ищем. главное найти сессию
        const session = await this.sessionsRepo.findSessionForLogout(userId,deviceId);

        if (!session) {
            console.log('LOGOUT SESSION FAIL____________', session, sessionVersion)
            throw new UnauthorizedException({field: 'userId, deviceId is failed', message: 'No session found'});
        }

        if(session.version !== sessionVersion) {
            console.log('LOGOUT SESSION version FAIL____________',session, sessionVersion)
            throw new UnauthorizedException({field: 'sessionVersion is failed', message: 'No session found'});
        }
        // //проверяем, не истек ли срок сессии
        // const now = new Date();
        // if(session.expiresAt.getTime() < now.getTime()){
        //     throw new UnauthorizedException({field: 'session expiration time', message: 'Session expired'})
        // }
        // вносим изменения в БД, т.е. протухаем существующий токен
        await this.sessionsRepo.closeSession(userId, deviceId);

        // //проверяем статус того че пришло из БД
        // if(!result){
        //     throw new UnauthorizedException({field: 'session', message: 'Not deleted'});
        // }
        //возвращаем пустоту
        return

        //есть еще мысль вернуть "протухание" и протухать сессию в логауте, а в остальных местах делать проверку. Нахуя - не знаю, но идея есть идея
    }
}