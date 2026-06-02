import {BadRequestException, UnauthorizedException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {JwtService} from "@nestjs/jwt";
import {SecurityDevicesRepository} from "../../securityDevices/securityDevices.repository";
import {JwtPayload} from "../../../types/session.types";


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
        console.log('LOGOUT TOKEN:', command.refreshToken);
        let decodedRefresh: JwtPayload;
        try {
            decodedRefresh = this.jwtService.verify(command.refreshToken);
        } catch (e) {
            throw new UnauthorizedException({field: 'token', message: 'Invalid token' });
        }        console.log('LOGOUT Decoded', decodedRefresh);
        const deviceId = decodedRefresh.deviceId;
        console.log('LOGOUT deviceId:', deviceId);
        const session = await this.sessionsRepo.findFrontSessionByDeviceId(deviceId);
        if (!session) {
            throw new UnauthorizedException({field: 'deviceId', message: 'No session found'});
        }
        //Ключевая проверка: является ли этот токен валидным, актуальным, самым последним изданным
        if (Math.floor(new Date(session.lastActivity).getTime() / 1000) !== decodedRefresh.iat) {
            throw new UnauthorizedException({field: 'token', message: 'Wrong refresh token'});
        }
        console.log('Decoded refresh iat', decodedRefresh.iat);
        // вносим изменения в БД, т.е. протухаем существующий токен
        const result = await this.sessionsRepo.closeSession(deviceId);
        //проверяем статус того че пришло из БД
        if(!result){
            throw new UnauthorizedException({field: 'session', message: 'Not deleted'});
        }
        return
    }
}