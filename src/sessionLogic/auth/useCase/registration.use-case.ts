import {BadRequestException, Inject, UnauthorizedException} from "@nestjs/common";
import {CommandHandler, ICommandHandler} from "@nestjs/cqrs";
import {UsersQuerySqlRepository} from "../../users/usersQuery.sql.repository";
import {UsersSQLRepository} from "../../users/users.sql.repository";
import {CreateAuthDto} from "../dto/create-auth.dto";
import {
    createEmailConfirmation,
    createPasswordRecovery,
    createUserSQL,
} from "../../../types/user.types";
import {EmailConfirmationSQLRepository} from "../../users/email-confirmation.sql.repository";
import {PasswordRecoverySQLRepository} from "../../users/password-recovery.sql.repository";
import {EmailService} from "../../../helpers/emailHelper/mailNotification.service";
import {PG_CONNECTION} from "../../../../setup/database/database.constants";
import {Pool} from "pg";
import {DataSource} from "typeorm";


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
        @Inject(PG_CONNECTION) private readonly pool: Pool,
        private readonly dataSource: DataSource,

    ) {}
    async execute(command: RegistrationCommand){
        const dto = command.dto;
        //проверили на существование таких данных в БД
        const userByLogin = await this.usersSQLQueryRepo.findUserByLoginORM(dto.login);
        if(userByLogin){
            throw new BadRequestException({message: 'User already exists', field: 'login'});
        }
        const userByEmail = await this.usersSQLQueryRepo.findUserByEmailORM(dto.email);
        if(userByEmail){
            throw new BadRequestException({message: 'User already exists', field: 'email'});
        }
        //создаём экземпляр юзера и засовываем в БД (ЭТО БЫЛ КУСОК КОДА ПРИ RawSql-Запросах)
        // const client = await this.pool.connect();
        // try {
        //     //начинаем транзакцию
        //     await client.query("BEGIN");
        //     //создаем юзера
        //     const createdUser = await this.usersSQLRepo.createUser(createUserSQL(dto.login, dto.email, dto.password), client);
        //     //для юзера создаем код подтверждения почты
        //     const emailConfirmation = await this.emailConfirmationSQLRepo.createFirstEmailConfirmation(createEmailConfirmation(createdUser.id), client);
        //     //создаем заготовку под восстановление пароля для юзера
        //     await this.passwordRecoverySQLRepo.createPasswordRecoveryFields(createPasswordRecovery(createdUser.id), client);
        //
        //     await client.query("COMMIT");
        //     //отсылаем email с кодом подтверждения
        //     // try {
        //     //     await this.emailSenderHelper.sendConfirmationEmail(
        //     //         createdUser.email,
        //     //         emailConfirmation.confirmation_code,
        //     //     );
        //     //
        //     //     console.log("EMAIL SENT");
        //     // } catch (error) {
        //     //     console.log(error);
        //     // }
        // }catch(e){
        //     await client.query("ROLLBACK");
        //     throw e;
        // }
        // finally{
        //     client.release();
        // }
        const createdUser = await this.dataSource.transaction(
            async (manager) => {

                const user = await this.usersSQLRepo.createUserORM(
                    createUserSQL(
                        dto.login,
                        dto.email,
                        dto.password,
                    ),
                    manager,
                );

                const emailConfirmation = await this.emailConfirmationSQLRepo.createFirstEmailConfirmationORM(
                    createEmailConfirmation(user.id),
                    manager,
                );

                await this.passwordRecoverySQLRepo.createPasswordRecoveryFieldsORM(
                    createPasswordRecovery(user.id),
                    manager,
                );
                    //отсылаем email с кодом подтверждения
                    // try {
                    //     await this.emailSenderHelper.sendConfirmationEmail(
                    //         user.email,
                    //         emailConfirmation.confirmation_code,
                    //     );
                    //
                    //     console.log("EMAIL SENT");
                    // } catch (error) {
                    //     console.log(error);
                    // }
                return user;
            },
        );
        return
    }
}