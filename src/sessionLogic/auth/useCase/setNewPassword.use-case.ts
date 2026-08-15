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
import {createUserSQL} from "../../../types/user.types";
import {EmailConfirmationSQLRepository} from "../../users/email-confirmation.sql.repository";
import {PasswordRecoverySQLRepository} from "../../users/password-recovery.sql.repository";
import {CodeInputDto} from "../dto/code-input.dto";
import {NewPasswordInputDto} from "../dto/new-password-input.dto";
import {PG_CONNECTION} from "../../../../setup/database/database.constants";
import {Pool} from "pg";
import {DataSource} from "typeorm";


export class SetNewPasswordCommand{
    constructor(
        public dto: NewPasswordInputDto
    ){}
}

@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordUseCase implements ICommandHandler<SetNewPasswordCommand>{
    constructor(
        private readonly usersSQLRepo: UsersSQLRepository,
        private readonly passwordRecoverySQLRepo: PasswordRecoverySQLRepository,
        @Inject(PG_CONNECTION) private readonly pool: Pool,
        private readonly dataSource: DataSource,

    ){}
    async execute(command: SetNewPasswordCommand){
        //newPassword and recoveryCode
        const dto = command.dto;
        //нашли юзера по коду, значит точно код совпадает
        const userId = await this.passwordRecoverySQLRepo.findUserIdByCodeORM(dto.recoveryCode);
        if(!userId){
            throw new BadRequestException({message: 'User not found', field: 'code'});
        }
        //обновляем поля в password_recoveries и users (RAW-SQL)
        // const client = await this.pool.connect();
        // try{
        //     //начинаем транзакцию
        //     await client.query("BEGIN");
        //     //создаем юзера
        //     const isUpdated = await this.passwordRecoverySQLRepo.confirmPassword(userId, client);
        //     //не знаю насколько корректно так писать
        //     if(!isUpdated){
        //         throw new BadRequestException({message:'User has not been updated' , field: 'email'});
        //     }
        //     const updatedUser = await this.usersSQLRepo.setNewPassword(userId, dto.newPassword, client);
        //     if(!updatedUser){
        //         throw new BadRequestException({message:'User has not been updated' , field: 'email'});
        //     }
        //     await client.query("COMMIT");
        // }catch(e){
        //     await client.query("ROLLBACK");
        //     throw e;
        // }
        // finally{
        //     client.release();
        // }
        await this.dataSource.transaction(
            async (manager) => {
                const isUpdated = await this.passwordRecoverySQLRepo.confirmPasswordORM(userId,manager);
                if(!isUpdated){
                    throw new BadRequestException({message:'PasswordRecoveries has not been updated' , field: 'userId'});
                }
                const updatedUser = await this.usersSQLRepo.setNewPasswordORM(userId, dto.newPassword, manager);
                if(!updatedUser){
                    throw new BadRequestException({message:'User has not been updated' , field: 'userId'});
                }
            }
        )

        return
    }
}
