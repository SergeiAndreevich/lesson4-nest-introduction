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
        const currentSession = await this.sessionsRepo.findSessionByDeviceId(command.deviceId);

        if (!currentSession) {
            throw new UnauthorizedException({
                field: 'deviceId',
                message: 'Session not found'
            });
        }

        if (currentSession.userId !== command.userId) {
            throw new UnauthorizedException({
                field: 'userId',
                message: 'Not your session'
            });
        }


        if (currentSession.expiresAt.getTime() < Date.now()) {
            throw new UnauthorizedException({
                field: 'session',
                message: 'Session expired'
            });
        }


        await this.sessionsRepo.closeAllSessionsBesidesThisOne(command.userId, command.deviceId);
        return
    }
}