import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {UsersModule} from "../users/users.module";
import {BearerGuard} from "../../../setup/guard/bearer.guard";
import {JwtGlobalModule} from "../../../setup/guard/jwt.module";
import {NotificationsModule} from "../../helpers/emailHelper/notification.module";

@Module({
  controllers: [AuthController],
  providers: [AuthService, BearerGuard],
  imports: [UsersModule, JwtGlobalModule, NotificationsModule],
})
export class AuthModule {}
