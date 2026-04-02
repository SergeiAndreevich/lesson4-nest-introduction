import {ForbiddenException, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {JwtService} from "@nestjs/jwt";
import {SecurityDevicesRepository} from "../securityDevices.repository";


export class CloseSessionForCurrentUserCommand{
    constructor(
        public deviceId: string,
        public userId: string,
    ){}
}

@CommandHandler(CloseSessionForCurrentUserCommand)
export class CloseSessionForCurrentUserUseCase implements ICommandHandler<CloseSessionForCurrentUserCommand>{
    constructor(
        private readonly sessionsRepo: SecurityDevicesRepository,
    ) {}
    async execute(command: CloseSessionForCurrentUserCommand){
        const session = await this.sessionsRepo.findSessionByDeviceId(command.deviceId);
        if(!session){
            throw new NotFoundException({field: 'deviceId', message: 'Device not found'});
        }
        const result = await this.sessionsRepo.closeSession(command.userId, command.deviceId)
        if(!result){
            throw new ForbiddenException({field: 'deviceId', message: 'Invalid deviceId or userId'});
        }
        return
    }
}