import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {User, UserSchema} from "./schemas/user.schema";
import {UsersRepository} from "./users.repository";
import {UsersQueryRepository} from "./usersQuery.repository";
import {BasicGuard} from "../guards/basic.guard";
import {JwtGlobalModule} from "../guards/jwt.module";
import {EmailSenderHelper} from "../helpers/emailSender.helper";

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), JwtGlobalModule],
  providers: [UsersService, UsersRepository, UsersQueryRepository, BasicGuard, EmailSenderHelper],
  controllers: [UsersController],
  exports:[UsersService]
})
export class UsersModule {}
