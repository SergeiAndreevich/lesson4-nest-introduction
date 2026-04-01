import {UnauthorizedException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {JwtService} from "@nestjs/jwt";


export class RefreshAccessCommand{
    constructor(
        public refreshToken: string
    ){}
}

@CommandHandler(RefreshAccessCommand)
export class RefreshAccessUseCase implements ICommandHandler<RefreshAccessCommand>{
    constructor(
        private readonly jwtService: JwtService,
    ) {}
    async execute(command: RefreshAccessCommand){
        const decodedRefresh = this.jwtService.decode(command.refreshToken);
        if(!decodedRefresh){
            throw new UnauthorizedException({field: 'refreshToken', message: 'Invalid decoded'});
        }
        const userId = decodedRefresh.userId;
        const userLogin = decodedRefresh.userLogin;

        //создаем новын аксес рефреш токены, создаем сессию и возвращаем токен
        const newAccessToken = this.jwtService.sign({userId: userId, userLogin: userLogin});
        const newRefreshToken = this.jwtService.sign({userId: userId, userLogin: userLogin}, {
            expiresIn: '7d'
        })
        return  {accessToken: newAccessToken, refreshToken: newRefreshToken}
    }
}