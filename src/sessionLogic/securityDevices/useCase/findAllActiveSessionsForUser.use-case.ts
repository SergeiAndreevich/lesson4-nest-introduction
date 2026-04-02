import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {SecurityDevicesRepository} from "../securityDevices.repository";
import {SecurityDevicesQueryRepository} from "../securityDevicesQuery.repository";


export class FindAllActiveSessionsForUserCommand{
    constructor(
        public userId: string
    ){}
}

@CommandHandler(FindAllActiveSessionsForUserCommand)
export class FindAllActiveSessionsForUserUseCase implements ICommandHandler<FindAllActiveSessionsForUserCommand>{
    constructor(
        private readonly sessionsRepo: SecurityDevicesRepository,
        private readonly sessionsQueryRepo: SecurityDevicesQueryRepository
    ) {}
    async execute(command: FindAllActiveSessionsForUserCommand){
        const sessionsList = await this.sessionsQueryRepo.findAllSessions(command.userId);
        return sessionsList
    }
}