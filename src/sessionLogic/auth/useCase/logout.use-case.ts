import {UnauthorizedException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {JwtService} from "@nestjs/jwt";


export class LogoutCommand{
    constructor(
        public refreshToken: string
    ){}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand>{
    constructor(
        private readonly jwtService: JwtService,
    ) {}
    async execute(command: LogoutCommand){
        // check actual token
        if(!command.refreshToken) {
            throw new UnauthorizedException({field: 'refreshToken',  message: 'No refresh token'});
        }
        // вносим изменения в БД, т.е. протухаем существующий токен
        //const result = await this.authService.closeSession(refreshToken);
        //проверяем статус того че пришло из БД
        // if(result.status !== httpStatus.NoContent){
        //     res.sendStatus(httpStatus.Unauthorized);
        //     return
        // }
        return
    }
}