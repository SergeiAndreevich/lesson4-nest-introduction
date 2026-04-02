import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {UsersModule} from "../users/users.module";
import {BearerGuard} from "../../../setup/guard/bearer.guard";
import {JwtGlobalModule} from "../../../setup/guard/jwt.module";
import {NotificationsModule} from "../../helpers/emailHelper/notification.module";
import {CqrsModule} from "@nestjs/cqrs";
import {RefreshAccessUseCase} from "./useCase/refreshAccess.use-case";
import {LogoutUseCase} from "./useCase/logout.use-case";
import {SecurityDevicesModule} from "../securityDevices/securityDevices.module";

@Module({
  controllers: [AuthController],
  providers: [AuthService, RefreshAccessUseCase, LogoutUseCase],
  imports: [UsersModule, NotificationsModule, CqrsModule,SecurityDevicesModule],
})
export class AuthModule {}
