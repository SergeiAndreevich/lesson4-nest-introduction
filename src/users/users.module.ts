import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {User, UserSchema} from "./schemas/user.schema";
import {UsersRepository} from "./users.repository";
import {UsersQueryRepository} from "./usersQuery.repository";
import {JwtModule} from "@nestjs/jwt";

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), JwtModule.register({
    secret: process.env.JWT_SECRET || 'secret',
    signOptions: { expiresIn: '5m' },
  }),],
  providers: [UsersService, UsersRepository, UsersQueryRepository],
  controllers: [UsersController]
})
export class UsersModule {}
