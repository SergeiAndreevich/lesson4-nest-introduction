import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {UsersModule} from "../users/users.module";
import {BearerGuard} from "../../../setup/guard/bearer.guard";
//import {JwtGlobalModule} from "../../../setup/guard/jwt.module";
import {NotificationsModule} from "../../helpers/emailHelper/notification.module";
import {CqrsModule} from "@nestjs/cqrs";
import {RefreshAccessUseCase} from "./useCase/refreshAccess.use-case";
import {LogoutUseCase} from "./useCase/logout.use-case";
import {SecurityDevicesModule} from "../securityDevices/securityDevices.module";
import {AntiClickerModule} from "../../rateLimitLogic/rateLimit.module";
import {NestRateLimiterModule} from "../../rateLimitLogic/nestRateLimiter.module";
import {LoginUseCase} from "./useCase/login.use-case";
import {RegistrationUseCase} from "./useCase/registration.use-case";
import {RegistrationConfirmationUseCase} from "./useCase/registrationConfirmation.use-case";
import {RecoveryPasswordUseCase} from "./useCase/recoveryPassword.use-case";
import {SetNewPasswordUseCase} from "./useCase/setNewPassword.use-case";
import {RegistrationEmailResendingUseCase} from "./useCase/registrationEmailResending.use-case";
import {FindUserUseCase} from "./useCase/findUser.use-case";
import {DatabaseModule} from "../../../setup/database/database.module";

@Module({
  controllers: [AuthController],
  providers: [AuthService, RefreshAccessUseCase, LogoutUseCase, LoginUseCase, RegistrationUseCase, RegistrationConfirmationUseCase,
  RecoveryPasswordUseCase, SetNewPasswordUseCase, RegistrationEmailResendingUseCase, FindUserUseCase],
  imports: [UsersModule, NotificationsModule, CqrsModule,SecurityDevicesModule,
    AntiClickerModule,
    NestRateLimiterModule,DatabaseModule],
})
export class AuthModule {}
