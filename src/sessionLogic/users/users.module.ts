import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {UsersRepository} from "./users.repository";
import {UsersQueryRepository} from "./usersQuery.repository";
import {JwtGlobalModule} from "../../../setup/guard/jwt.module";
import {NotificationsModule} from "../../helpers/emailHelper/notification.module";
import {User, UserSchema} from "./schema/user.schema";
import {DatabaseModule} from "../../../setup/database/database.module";
import {UsersSQLRepository} from "./users.sql.repository";
import {UsersQuerySqlRepository} from "./usersQuery.sql.repository";

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtGlobalModule,
    NotificationsModule,
    DatabaseModule
  ],
  providers: [UsersService, UsersRepository, UsersQueryRepository, UsersSQLRepository, UsersQuerySqlRepository ],
  controllers: [UsersController],
  exports:[UsersService, UsersRepository, UsersQueryRepository,UsersSQLRepository, UsersQuerySqlRepository],
})
export class UsersModule {}
