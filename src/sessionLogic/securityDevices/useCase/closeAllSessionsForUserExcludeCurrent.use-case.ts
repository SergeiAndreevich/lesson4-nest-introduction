import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {SecurityDevicesRepository} from "../securityDevices.repository";
import {UnauthorizedException} from "@nestjs/common";


export class CloseAllSessionsForUserExcludeCurrentCommand{
    constructor(
        public userId: string,
        public deviceId: string,
    ){}
}

@CommandHandler(CloseAllSessionsForUserExcludeCurrentCommand)
export class CloseAllSessionsForUserExcludeCurrentUseCase implements ICommandHandler<CloseAllSessionsForUserExcludeCurrentCommand>{
    constructor(
        private readonly sessionsRepo: SecurityDevicesRepository,
    ) {}
    async execute(command: CloseAllSessionsForUserExcludeCurrentCommand){
        const currentSession = await this.sessionsRepo.findSessionByDeviceIdAndUserIdORM(command.deviceId, command.userId);

        if (!currentSession) {
            throw new UnauthorizedException({
                field: 'deviceId or userId is wrong in close sessions',
                message: 'Session not found'
            });
        }
        await this.sessionsRepo.closeAllSessionsBesidesThisOneORM(command.userId, command.deviceId);
        return
    }
}