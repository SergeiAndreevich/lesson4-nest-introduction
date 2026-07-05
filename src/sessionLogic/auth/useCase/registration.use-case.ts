import {BadRequestException, Inject, UnauthorizedException} from "@nestjs/common";
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
import {
    createEmailConfirmation,
    createPasswordRecovery,
    createUserSQL,
    TypeEmailConfirmation,
    TypeUser
} from "../../../types/user.types";
import {EmailConfirmationSQLRepository} from "../../users/email-confirmation.sql.repository";
import {PasswordRecoverySQLRepository} from "../../users/password-recovery.sql.repository";
import {EmailService} from "../../../helpers/emailHelper/mailNotification.service";
import {PG_CONNECTION} from "../../../../setup/database/database.constants";
import {Pool} from "pg";


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
        private readonly emailSenderHelper: EmailService,
        @Inject(PG_CONNECTION) private readonly pool: Pool

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
        const client = await this.pool.connect();
        let createdUser: TypeUser;
        let emailConfirmation: TypeEmailConfirmation;
        try {
            //начинаем транзакцию
            await client.query("BEGIN");
            //создаем юзера
            const createdUser = await this.usersSQLRepo.createUser(createUserSQL(dto.login, dto.email, dto.password), client);
            //для юзера создаем код подтверждения почты
            const emailConfirmation = await this.emailConfirmationSQLRepo.createFirstEmailConfirmation(createEmailConfirmation(createdUser.id), client);
            //создаем заготовку под восстановление пароля для юзера
            await this.passwordRecoverySQLRepo.createPasswordRecoveryFields(createPasswordRecovery(createdUser.id), client);

            await client.query("COMMIT");
            //отсылаем email с кодом подтверждения
            await this.emailSenderHelper.sendConfirmationEmail(createdUser.email, emailConfirmation.confirmation_code);
        }catch(e){
            await client.query("ROLLBACK");
            throw e;
        }
        finally{
            client.release();
        }
        return
    }
}