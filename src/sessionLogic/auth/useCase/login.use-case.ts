import {BadRequestException, ForbiddenException, UnauthorizedException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {JwtService} from "@nestjs/jwt";
import {SecurityDevicesRepository} from "../../securityDevices/securityDevices.repository";
import {JwtPayload} from "../../../types/session.types";
import {
    ACCESS_SECRET,
    ACCESS_TOKEN_TTL_SEC,
    REFRESH_SECRET,
    REFRESH_TOKEN_TTL_SEC
} from "../../../../setup/globalVariables";
import {User} from "../../users/schema/user.schema";
import {mapUserToView} from "../../../mappers/user.mapper";
import {UsersQuerySqlRepository} from "../../users/usersQuery.sql.repository";
import {UsersSQLRepository} from "../../users/users.sql.repository";
import {CreateAuthDto} from "../dto/create-auth.dto";
import {createUserSQL} from "../../../types/user.types";
import {EmailConfirmationSQLRepository} from "../../users/email-confirmation.sql.repository";
import {PasswordRecoverySQLRepository} from "../../users/password-recovery.sql.repository";
import {LoginInputDto} from "../dto/login-input.dto";
import {v4 as uuidv4} from "uuid";
import {Session} from "../../securityDevices/schema/session.schema";
import {addSeconds} from "date-fns";


export class LoginCommand{
    constructor(
        public dto: LoginInputDto,
        public ip: string | undefined,
        public userAgent: string
    ){}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand>{
    constructor(
        private readonly usersSQLQueryRepo: UsersQuerySqlRepository,
        private readonly usersSQLRepo: UsersSQLRepository,
        private readonly emailConfirmationSQLRepo:EmailConfirmationSQLRepository,
        private readonly passwordRecoverySQLRepo: PasswordRecoverySQLRepository,
        private readonly jwtService: JwtService,
        private readonly sessionsRepo: SecurityDevicesRepository

    ) {}
    async execute(command: LoginCommand){
        if(!command.ip){
            throw new ForbiddenException({field: 'ip', message: 'invalid ip'})
        }
        const dto = command.dto;
        //ищем юзера по логину или почте, проверяя ИЛИ в обоих полях (так как юзер может логиниться введя
        // либо пару логин/пароль либо почта/пароль)
        const user = await this.usersSQLQueryRepo.findUserByLoginOrEmail(dto.loginOrEmail);
        if(!user){
            throw new UnauthorizedException({message: 'User not found', field: 'loginOrEmail'});
        }
        //проверяем пароль, совпадает ли (здесь без хэширования делал)
        if(user.password !== dto.password) {
            throw new UnauthorizedException({message: 'Invalid password', field: 'password'});
        }
        //создаю уникальный код устройства
        const deviceId = uuidv4();
        //создаю версию сессии
        const sessionVersion = 1;
        //создаем аксес рефреш токены, создаем сессию и возвращаем токен
        const accessToken = this.jwtService.sign({userId: user.id.toString(), userLogin: user.login},{secret:ACCESS_SECRET,expiresIn: `${ACCESS_TOKEN_TTL_SEC}s`});
        const refreshToken = this.jwtService.sign(
            {userId: user.id.toString(), userLogin: user.login, deviceId: deviceId, sessionVersion: sessionVersion},{secret: REFRESH_SECRET,expiresIn: `${REFRESH_TOKEN_TTL_SEC}s`});
        //создаём сессию, в которой автоматически создается свойство "протух: false"
        const session = Session.createSession(
            user.id.toString(), deviceId,command.ip,command.userAgent, new Date(),
            addSeconds(new Date(), REFRESH_TOKEN_TTL_SEC), sessionVersion);
        //засовываем сессию в БД
        await this.sessionsRepo.createSession(session);
        //отдаём пользователю готовые AT и RT
        return  {accessToken: accessToken, refreshToken: refreshToken}

    }
}

