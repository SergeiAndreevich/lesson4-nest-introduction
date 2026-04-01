import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {SessionsController} from "./securityDevices.controller";
import {FindAllActiveSessionsForUserUseCase} from "./useCase/findAllActiveSessionsForUser.use-case";
import {CqrsModule} from "@nestjs/cqrs";
import {CloseAllSessionsForUserExcludeCurrentUseCase} from "./useCase/closeAllSessionsForUserExcludeCurrent.use-case";
import {CloseSessionForCurrentUserUseCase} from "./useCase/closeSessionForCurrentUser.use-case";


@Module({
    imports: [MongooseModule.forFeature([]),CqrsModule],
    controllers: [SessionsController],
    providers: [FindAllActiveSessionsForUserUseCase, CloseAllSessionsForUserExcludeCurrentUseCase, CloseSessionForCurrentUserUseCase],
    exports: [],
})
export class ReactionsModule {}
