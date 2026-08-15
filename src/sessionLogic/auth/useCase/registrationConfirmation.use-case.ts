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
import {CodeInputDto} from "../dto/code-input.dto";
import {validate} from "uuid";


export class RegistrationConfirmationCommand{
    constructor(
        public dto: CodeInputDto
    ){}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase implements ICommandHandler<RegistrationConfirmationCommand>{
    constructor(
        private readonly emailConfirmationSQLRepo:EmailConfirmationSQLRepository,
    ){}
    async execute(command: RegistrationConfirmationCommand){
        const dto = command.dto;
        //нашли юзера по коду, значит точно код совпадает
        if (!validate(dto.code)) {
            throw new BadRequestException({message: 'No code or invalid code', field: 'code'});
        }
        const user = await this.emailConfirmationSQLRepo.findUserByEmailCodeORM(dto.code);
        if(!user){
            throw new BadRequestException({message: 'User not found', field: 'code'});
        }
        //далее проверяем, если почта уже подтверждена или если код истек, то выкидываем ошибку
        if(user["is_confirmed"] === true || user["expires_at"] < new Date()) {
            throw new BadRequestException({message: 'Incorrect confirmation info', field: 'code'});
        }
        const isConfirmed = await this.emailConfirmationSQLRepo.confirmEmailORM(user.user_id);
        if(!isConfirmed){
            throw new BadRequestException({message:'User has not been updated' , field: 'email'});
        }
        return
    }
}
