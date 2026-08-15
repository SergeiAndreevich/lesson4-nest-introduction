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
import {EmailInputDto} from "../dto/email-input-dto";
import {v4 as uuidv4} from "uuid";
import {EmailService} from "../../../helpers/emailHelper/mailNotification.service";


export class RegistrationEmailResendingCommand{
    constructor(
        public dto: EmailInputDto
    ){}
}

@CommandHandler(RegistrationEmailResendingCommand)
export class RegistrationEmailResendingUseCase implements ICommandHandler<RegistrationEmailResendingCommand>{
    constructor(
        private readonly usersSQLQueryRepo: UsersQuerySqlRepository,
        private readonly emailConfirmationSQLRepo:EmailConfirmationSQLRepository,
        private readonly emailSenderHelper: EmailService,
    ){}
    async execute(command: RegistrationEmailResendingCommand){
        //пришел email. Пользователь говорит: скинь на эту почту код подтверждения ещё раз
        const dto = command.dto;
        //ищу юзера по почте, есть ли вообще такая почта
        const user = await this.usersSQLQueryRepo.findUserByEmailORM(dto.email);
        if(!user) {
            throw new BadRequestException({message:'User not found' , field: 'email'});
        }
        //проверяю, чтобы почта уже не была подтверждена
        const emailConfirmationUser = await this.emailConfirmationSQLRepo.findUserByIdORM(user.id);
        if(!emailConfirmationUser) {
            throw new BadRequestException({message:'User not found' , field: 'userId'});
        }
        if(emailConfirmationUser["is_confirmed"] === true) {
            throw new BadRequestException({message:'User already confirmed' , field: 'email'});
        }
        //генерирую новый код подтверждения, обновляю поле в БД и отправляю письмо со ссылкой
        const newCode = uuidv4();
        const isUpdated = await this.emailConfirmationSQLRepo.setNewEmailConfirmationCodeORM(user.id, newCode);
        if(!isUpdated){
            throw new BadRequestException({message:'User has not been updated' , field: 'email'});
        }
        //await this.emailSenderHelper.sendConfirmationEmail(dto.email, newCode);
        return
    }
}
