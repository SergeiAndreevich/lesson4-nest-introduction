import {UnauthorizedException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {JwtService} from "@nestjs/jwt";


export class CloseAllSessionsForUserExcludeCurrentCommand{
    constructor(
        public refreshToken: string
    ){}
}

@CommandHandler(CloseAllSessionsForUserExcludeCurrentCommand)
export class CloseAllSessionsForUserExcludeCurrentUseCase implements ICommandHandler<CloseAllSessionsForUserExcludeCurrentCommand>{
    constructor(
        private readonly jwtService: JwtService,
    ) {}
    async execute(command: CloseAllSessionsForUserExcludeCurrentCommand){
        const userId = req.userId;
        if(userId === undefined || userId === null || userId.length === 0) {
            res.sendStatus(httpStatus.Unauthorized)
            return
        }
        const deviceId = req.deviceId;
        if(deviceId === undefined || deviceId === null || deviceId.length === 0) {
            res.sendStatus(httpStatus.Unauthorized)
            return
        }
        await this.sessionsService.closeAllSessionsBesidesCurrent(userId, deviceId);
        res.sendStatus(httpStatus.NoContent)
    }
}