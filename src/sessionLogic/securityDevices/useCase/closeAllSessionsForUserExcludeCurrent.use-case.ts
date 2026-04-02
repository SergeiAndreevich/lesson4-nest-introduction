import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {SecurityDevicesRepository} from "../securityDevices.repository";


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
        await this.sessionsRepo.closeAllSessionsBesidesThisOne(command.userId, command.deviceId);
        return
    }
}