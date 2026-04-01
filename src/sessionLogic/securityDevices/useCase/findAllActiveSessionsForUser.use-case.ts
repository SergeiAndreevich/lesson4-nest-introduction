import {UnauthorizedException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {JwtService} from "@nestjs/jwt";


export class FindAllActiveSessionsForUserCommand{
    constructor(
        public refreshToken: string
    ){}
}

@CommandHandler(FindAllActiveSessionsForUserCommand)
export class FindAllActiveSessionsForUserUseCase implements ICommandHandler<FindAllActiveSessionsForUserCommand>{
    constructor(
        private readonly jwtService: JwtService,
    ) {}
    async execute(command: FindAllActiveSessionsForUserCommand){
        const userId = req.userId;
        if(userId === undefined || userId === null || userId.length === 0) {
            res.sendStatus(httpStatus.Unauthorized)
            return
        }
        const sessionsList = await this.sessionsService.findAllSessions(userId);
        res.status(httpStatus.Ok).send(sessionsList)
    }
}