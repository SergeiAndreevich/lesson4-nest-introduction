import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {UsersRepository} from "./users.repository";
import {UsersQueryRepository} from "./usersQuery.repository";
import {JwtGlobalModule} from "../../../setup/guard/jwt.module";
import {NotificationsModule} from "../../helpers/emailHelper/notification.module";
import {User, UserSchema} from "./schema/user.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), JwtGlobalModule, NotificationsModule],
  providers: [UsersService, UsersRepository, UsersQueryRepository ],
  controllers: [UsersController],
  exports:[UsersService, UsersRepository, UsersQueryRepository],
})
export class UsersModule {}
