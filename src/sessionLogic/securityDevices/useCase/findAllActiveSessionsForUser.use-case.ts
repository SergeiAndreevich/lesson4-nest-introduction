import { IQueryHandler, QueryHandler} from "@nestjs/cqrs";
import {SecurityDevicesRepository} from "../securityDevices.repository";
import {SecurityDevicesQueryRepository} from "../securityDevicesQuery.repository";


export class FindAllActiveSessionsForUserQuery{
    constructor(
        public userId: string
    ){}
}

@QueryHandler(FindAllActiveSessionsForUserQuery)
export class FindAllActiveSessionsForUserUseCase implements IQueryHandler<FindAllActiveSessionsForUserQuery>{
    constructor(
        private readonly sessionsQueryRepo: SecurityDevicesQueryRepository
    ) {}
    async execute(query: FindAllActiveSessionsForUserQuery){
        const sessionsList = await this.sessionsQueryRepo.findAllSessions(query.userId);
        return sessionsList
    }
}