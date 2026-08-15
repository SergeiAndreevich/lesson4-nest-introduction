import {BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {CommandHandler, ICommandHandler, IQueryHandler, QueryHandler} from "@nestjs/cqrs";
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


export class FindUserQuery{
    constructor(
        public userId: string
    ){}
}

@QueryHandler(FindUserQuery)
export class FindUserUseCase implements IQueryHandler<FindUserQuery>{
    constructor(
        private readonly usersSQLQueryRepo: UsersQuerySqlRepository

    ) {}
    async execute(query: FindUserQuery){
        const user = await this.usersSQLQueryRepo.findUserByIdORM(query.userId);
        if(!user){
            throw new NotFoundException({message: 'User not found', field: 'userId'});
        }
        return {
            email: user.email,
            login: user.login,
            userId: user.id,
        }
    }
}

