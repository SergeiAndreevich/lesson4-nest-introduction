import {BadRequestException, NotFoundException, UnauthorizedException} from "@nestjs/common";
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
import {add} from "date-fns";
import {EmailService} from "../../../helpers/emailHelper/mailNotification.service";


export class RecoveryPasswordCommand{
    constructor(
        public dto: EmailInputDto
    ){}
}

@CommandHandler(RecoveryPasswordCommand)
export class RecoveryPasswordUseCase implements ICommandHandler<RecoveryPasswordCommand>{
    constructor(
        private readonly usersSQLQueryRepo: UsersQuerySqlRepository,
        private readonly passwordRecoverySQLRepo: PasswordRecoverySQLRepository,
        private readonly emailSenderHelper: EmailService,

    ){}
    async execute(command: RecoveryPasswordCommand){
        const dto = command.dto;
        //нашли юзера по почте
        const user = await this.usersSQLQueryRepo.findUserByEmailORM(dto.email);
        if(!user){
            throw new NotFoundException({message: 'No user', field: 'email'});
        }
        //создали код восстановления
        const confirmationCode = uuidv4();
        //обновили записи в БД для конкретного юзера (сбросили isConfirmed, обновили код и время)
        const isUpdated = await this.passwordRecoverySQLRepo.updateRecoveryCodeORM(user.id, confirmationCode);
        if(!isUpdated){
            throw new BadRequestException({message: 'User has not been updated', field: 'emailCode'});
        }
        //отправляем письмо на почту для подтверждения
        await this.emailSenderHelper.sendConfirmationEmail(dto.email, confirmationCode);
        return
    }
}
