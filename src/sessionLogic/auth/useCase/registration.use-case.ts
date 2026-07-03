import {BadRequestException, UnauthorizedException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {JwtService} from "@nestjs/jwt";
import {SecurityDevicesRepository} from "../../securityDevices/securityDevices.repository";
import {JwtPayload} from "../../../types/session.types";
import {REFRESH_SECRET} from "../../../../setup/globalVariables";
import {User} from "../../users/schema/user.schema";
import {mapUserToView} from "../../../mappers/user.mapper";
import {UsersQuerySqlRepository} from "../../users/usersQuery.sql.repository";
import {UsersSQLRepository} from "../../users/users.sql.repository";
import {CreateAuthDto} from "../dto/create-auth.dto";
import {createUserSQL} from "../../../types/user.types";
import {EmailConfirmationSQLRepository} from "../../users/email-confirmation.sql.repository";
import {PasswordRecoverySQLRepository} from "../../users/password-recovery.sql.repository";


export class RegistrationCommand{
    constructor(
        public dto: CreateAuthDto
    ){}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase implements ICommandHandler<RegistrationCommand>{
    constructor(
        private readonly usersSQLQueryRepo: UsersQuerySqlRepository,
        private readonly usersSQLRepo: UsersSQLRepository,
        private readonly emailConfirmationSQLRepo:EmailConfirmationSQLRepository,
        private readonly passwordRecoverySQLRepo: PasswordRecoverySQLRepository,
        private readonly emailSenderHelper:
    ) {}
    async execute(command: RegistrationCommand){
        const dto = command.dto;
        //проверили на существование таких данных в БД
        const userByLogin = await this.usersSQLQueryRepo.findUserByLogin(dto.login);
        if(userByLogin){
            throw new BadRequestException({message: 'User already exists', field: 'login'});
        }
        const userByEmail = await this.usersSQLQueryRepo.findUserByEmail(dto.email);
        if(userByEmail){
            throw new BadRequestException({message: 'User already exists', field: 'email'});
        }
        //создаём экземпляр юзера и засовываем в БД
        const createdUser = await this.usersSQLRepo.createUser(createUserSQL(dto.login, dto.email, dto.password));
        if(!createdUser){
            throw new BadRequestException({message: 'Something went wrong in postgres', field: 'database'});
        }
        //создаем код подтверждения
        const confirmationCode = user.emailConfirmation.code;
        if(!confirmationCode){
            throw new BadRequestException({message: 'Smth wrong with received user and its emailConfirmationCode', field: 'code'});
        }
        //отсылаем email с кодом подтверждения
        //await this.emailSenderHelper.sendConfirmationEmail(createdUser.email, confirmationCode);
        return
    }
}