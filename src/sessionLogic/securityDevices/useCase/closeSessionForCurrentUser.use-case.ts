import {UnauthorizedException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {JwtService} from "@nestjs/jwt";


export class CloseSessionForCurrentUserCommand{
    constructor(
        public refreshToken: string
    ){}
}

@CommandHandler(CloseSessionForCurrentUserCommand)
export class CloseSessionForCurrentUserUseCase implements ICommandHandler<CloseSessionForCurrentUserCommand>{
    constructor(
        private readonly jwtService: JwtService,
    ) {}
    async execute(command: CloseSessionForCurrentUserCommand){
        const userId = req.userId;
        if(userId === undefined || userId === null || userId.length === 0) {
            res.sendStatus(httpStatus.Unauthorized)
            return
        }
        const deviceId = req.params.deviceId;
        const result = await this.sessionsService.closeSpecificSessionByDeviceId(userId, deviceId)
        if(result.status !== httpStatus.NoContent){
            res.sendStatus(result.status);
            return
        }
        res.sendStatus(httpStatus.NoContent)
    }
}