import { Module } from '@nestjs/common';
import { UsersService } from './no-sql/users.service';
import { UsersController } from './no-sql/users.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {UsersRepository} from "./no-sql/users.repository";
import {UsersQueryRepository} from "./no-sql/usersQuery.repository";
import {JwtGlobalModule} from "../../../setup/guard/jwt.module";
import {NotificationsModule} from "../../helpers/emailHelper/notification.module";
import {User as MongoosUser, UserSchema} from "./schema/user.schema";
import {DatabaseModule} from "../../../setup/database/database.module";
import {UsersSQLRepository} from "./users.sql.repository";
import {UsersQuerySqlRepository} from "./usersQuery.sql.repository";
import {UsersSAController} from "./users.sa.controller";
import {CqrsModule} from "@nestjs/cqrs";
import {CreateUserSAUseCase} from "./useCase/createUserSA.use-case";
import {RemoveUserSAUseCase} from "./useCase/removeUserSA.use-case";
import {FindUsersByQuerySAUseCase} from "./useCase/findUsersByQuerySA.use-case";
import {EmailConfirmationSQLRepository} from "./email-confirmation.sql.repository";
import {PasswordRecoverySQLRepository} from "./password-recovery.sql.repository";
import {TypeOrmModule} from "@nestjs/typeorm";
import {PasswordRecovery} from "../auth/Entity/passwordRecovery.entity";
import {EmailConfirmation} from "../auth/Entity/emailConfirmation.entity";
import {User} from "../auth/Entity/user.entity";
import {Session} from "../securityDevices/Entity/session.entity";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MongoosUser.name, schema: UserSchema }]),
    JwtGlobalModule,
    NotificationsModule,
    DatabaseModule,CqrsModule, TypeOrmModule.forFeature([User, PasswordRecovery, EmailConfirmation, Session])
  ],
  providers: [UsersService, UsersRepository, UsersQueryRepository,
    UsersSQLRepository, UsersQuerySqlRepository, EmailConfirmationSQLRepository, PasswordRecoverySQLRepository,
  CreateUserSAUseCase,RemoveUserSAUseCase,FindUsersByQuerySAUseCase,
  ],
  controllers: [UsersController,  UsersSAController],
  exports:[UsersService, UsersRepository, UsersQueryRepository,
    UsersSQLRepository, UsersQuerySqlRepository, EmailConfirmationSQLRepository, PasswordRecoverySQLRepository,],
})
export class UsersModule {}
