import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {UsersModule} from "../users/users.module";
import {BearerGuard} from "../guards/bearer.guard";
import {JwtGlobalModule} from "../guards/jwt.module";

@Module({
  controllers: [AuthController],
  providers: [AuthService, BearerGuard],
  imports: [UsersModule, JwtGlobalModule],
})
export class AuthModule {}
