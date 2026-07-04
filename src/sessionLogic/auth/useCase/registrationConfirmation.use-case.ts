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


export class RegistrationCommand{
    constructor(
        public dto: CodeInputDto
    ){}
}

@CommandHandler(RegistrationCommand)
export class RegistrationUseCase implements ICommandHandler<RegistrationCommand>{
    constructor(
        private readonly usersSQLQueryRepo: UsersQuerySqlRepository,
        private readonly usersSQLRepo: UsersSQLRepository,
        private readonly emailConfirmationSQLRepo:EmailConfirmationSQLRepository,
        private readonly passwordRecoverySQLRepo: PasswordRecoverySQLRepository,
    ){}
    async execute(command: RegistrationCommand){
        const dto = command.dto;

        //нашли юзера по коду, значит точно код совпадает
        const user = await this.emailConfirmationSQLRepo.findUserByEmailCode(dto.code);
        if(!user){
            throw new BadRequestException({message: 'User not found', field: 'code'});
        }

        //далее проверяем, если почта уже подтверждена или если код истек, то выкидываем ошибку
        //из БД приходит строка, надо как-то преобразовать для сравнения ! ! !
        if(user.isConfirmed === true || user.expiresAt < new Date()) {
            throw new BadRequestException({message: 'Incorrect confirmation info', field: 'code'});
        }

        const isConfirmed = await this.emailConfirmationSQLRepo.confirmEmail(user._id.toString());
        if(!isConfirmed){
            throw new BadRequestException({message:'User has not been updated' , field: 'email'});
        }
        return
    }
}
