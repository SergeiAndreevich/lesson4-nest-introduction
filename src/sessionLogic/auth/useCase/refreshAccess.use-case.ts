import {UnauthorizedException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {JwtService} from "@nestjs/jwt";
import {SecurityDevicesRepository} from "../../securityDevices/securityDevices.repository";
import {addDays} from "date-fns";


export class RefreshAccessCommand{
    constructor(
        public refreshToken: string
    ){}
}

@CommandHandler(RefreshAccessCommand)
export class RefreshAccessUseCase implements ICommandHandler<RefreshAccessCommand>{
    constructor(
        private readonly jwtService: JwtService,
        private readonly sessionsRepo: SecurityDevicesRepository
    ) {}
    async execute(command: RefreshAccessCommand){
        // check actual token
        if(!command.refreshToken) {
            throw new UnauthorizedException({field: 'refreshToken',  message: 'No refresh token'});
        }
        const decodedRefresh = this.jwtService.decode(command.refreshToken);
        if(!decodedRefresh){
            throw new UnauthorizedException({field: 'refreshToken', message: 'Invalid decoded'});
        }
        const userId = decodedRefresh.userId;
        const userLogin = decodedRefresh.userLogin;
        const deviceId = decodedRefresh.deviceId;

        //создаем новые аксес рефреш токены, создаем сессию и возвращаем токен
        const newAccessToken = this.jwtService.sign({userId: userId, userLogin: userLogin, deviceId: deviceId});
        const newRefreshToken = this.jwtService.sign({userId: userId, userLogin: userLogin, deviceId: deviceId}, {expiresIn: '7d'});

        const now = new Date();
        await this.sessionsRepo.updateSession(userId,userLogin, now, addDays(now,7))
        return  {accessToken: newAccessToken, refreshToken: newRefreshToken}
    }
}