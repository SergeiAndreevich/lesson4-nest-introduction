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
import {createSession, createSessionORM, JwtPayload} from "../../../types/session.types";
import { v4 as uuidv4 } from "uuid";


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
        const session = await this.sessionsRepo.findSessionForRefreshORM(userId, deviceId);
        if(!session){
            throw new UnauthorizedException({field: 'userId or deviceId is failed', message: 'No session found'})
        }
        //проверяем версию сессии
        if(session.version !== sessionVersion) {
            throw new UnauthorizedException({field: 'session version', message: 'Wrong version'})
        }
        //дипсик говорит что jwt.verify и проверка номера сессии уже гарантирует консистентность

        //обновляем версию сессии
        const newSessionVersion = sessionVersion + 1;

        //ищем сессию по userId и deviceId, затем обновляем три поля, а именно последняя активность, время жизни и версию сессии
        //еще новее логика. Удаляю сессию, затем создаю новую
        // await this.sessionsRepo.closeSessionORM(userId,deviceId);
        // //создаю новую сессию
        // //const createdSession = Session.createSession( userId, deviceId,session.ip,session.device_name, new Date(),
        // const createdSession = createSessionORM( uuidv4(), deviceId,session.ip,session.device_name, new Date(),
        //     addSeconds(new Date(), REFRESH_TOKEN_TTL_SEC), newSessionVersion, session.user);
        // //записываю новую сессию в БД
        // await this.sessionsRepo.createSessionORM(createdSession);
        const updated = await this.sessionsRepo.updateRefreshSessionORM(
            userId,
            deviceId,
            sessionVersion,
            addSeconds(new Date(), REFRESH_TOKEN_TTL_SEC),
        );


        if (!updated) {
            throw new UnauthorizedException({
                field: 'session',
                message: 'Session update failed',
            });
        }

        //создаем новые аксес рефреш токены
        const newAccessToken = this.jwtService.sign({userId: userId, userLogin: userLogin}, {secret: ACCESS_SECRET, expiresIn: `${ACCESS_TOKEN_TTL_SEC}s`});
        const newRefreshToken = this.jwtService.sign({userId: userId, userLogin: userLogin, deviceId: deviceId, sessionVersion: newSessionVersion}, {secret: REFRESH_SECRET, expiresIn:  `${REFRESH_TOKEN_TTL_SEC}s`});

        //и возвращаем пользователю новые AT и RT
        return  {accessToken: newAccessToken, refreshToken: newRefreshToken}
    }

    //я так понимаю, что раз у меня логика сессий лежит в Монго, то и трогать тут ничего не надо
}