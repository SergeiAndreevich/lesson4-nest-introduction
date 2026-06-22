import {UnauthorizedException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {JwtService} from "@nestjs/jwt";
import {SecurityDevicesRepository} from "../../securityDevices/securityDevices.repository";
import { addSeconds} from "date-fns";
import {
    ACCESS_SECRET,
    ACCESS_TOKEN_TTL_SEC,
    REFRESH_SECRET,
    REFRESH_TOKEN_TTL_SEC
} from "../../../../setup/globalVariables";
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
        //пришел рефреш Токен: прошло 10 секунд, аксесс протух, чтобы получить новый аксесс нужно активировать эндпоинт
        //рефреш-аксесс и по рефрешТокену получить новую пару AT и RT
        let decodedRefresh: JwtPayload;
        try {
            decodedRefresh = this.jwtService.verify(command.refreshToken, {secret: REFRESH_SECRET});
        } catch (e) {
            throw new UnauthorizedException({
                field: 'refreshToken',
                message: 'Invalid or expired token come in refreshAccess'
            });
        }
        //достаем содержимое рефреш-токена
        const userId = decodedRefresh.userId;
        const userLogin = decodedRefresh.userLogin;
        const deviceId = decodedRefresh.deviceId;
        let sessionVersion = decodedRefresh.sessionVersion;
        const session = await this.sessionsRepo.findSessionForRefresh(userId, deviceId);
        if(!session){
            throw new UnauthorizedException({field: 'userId or deviceId is failed', message: 'No session found'})
        }
        //проверяем версию сессии
        if(session.version !== sessionVersion) {
            throw new UnauthorizedException({field: 'session version', message: 'Wrong version'})
        }
        // //проверяем, не истек ли срок сессии
        // const now = new Date();
        // if(session.expiresAt.getTime() < now.getTime()){
        //     throw new UnauthorizedException({field: 'session expiration time', message: 'Session expired'})
        // }

        //дипсик говорит что jwt.verify и проверка номера сессии уже гарантирует консистентность

        //обновляем версию сессии
        const newSessionVersion = sessionVersion + 1;

        //ищем сессию по userId и deviceId, затем обновляем три поля, а именно последняя активность, время жизни и версию сессии

        //новая логика: ищу по юзер Айди, девайс Айди и версию сессии - затем обновляю ревокед и ласт активити
        // const updated = await this.sessionsRepo.updateRevokedSession(userId, deviceId, new Date(),sessionVersion);
        // if (!updated) {
        //     throw new UnauthorizedException({
        //         field: 'session',
        //         message: 'Session update failed - Здесь чтоль проблема?'
        //     });
        // }
        //еще новее логика. Удаляю сессию, затем создаю новую
        await this.sessionsRepo.closeSession(userId,deviceId);
        //создаю новую сессию
        const createdSession = Session.createSession( userId, deviceId,session.ip,session.deviceName, new Date(),
            addSeconds(new Date(), REFRESH_TOKEN_TTL_SEC), newSessionVersion);
        //записываю новую сессию в БД
        await this.sessionsRepo.createSession(createdSession);

        //создаем новые аксес рефреш токены
        const newAccessToken = this.jwtService.sign({userId: userId, userLogin: userLogin}, {secret: ACCESS_SECRET, expiresIn: `${ACCESS_TOKEN_TTL_SEC}s`});
        const newRefreshToken = this.jwtService.sign({userId: userId, userLogin: userLogin, deviceId: deviceId, sessionVersion: newSessionVersion}, {secret: REFRESH_SECRET, expiresIn:  `${REFRESH_TOKEN_TTL_SEC}s`});

        //и возвращаем пользователю новые AT и RT
        return  {accessToken: newAccessToken, refreshToken: newRefreshToken}
    }


}