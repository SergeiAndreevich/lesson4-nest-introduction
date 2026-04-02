import {BadRequestException, UnauthorizedException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {JwtService} from "@nestjs/jwt";
import {SecurityDevicesRepository} from "../../securityDevices/securityDevices.repository";


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
        const decodedRefresh = this.jwtService.decode(command.refreshToken);
        if(!decodedRefresh){
            throw new UnauthorizedException({field: 'refreshToken', message: 'Invalid decoded'});
        }
        const userId = decodedRefresh.userId;
        const deviceId = decodedRefresh.deviceId;
        // вносим изменения в БД, т.е. протухаем существующий токен
        const result = await this.sessionsRepo.closeSession(userId, deviceId);
        //проверяем статус того че пришло из БД
        if(!result){
            throw new BadRequestException({field: 'session', message: 'Not deleted'});
        }
        return
    }
}