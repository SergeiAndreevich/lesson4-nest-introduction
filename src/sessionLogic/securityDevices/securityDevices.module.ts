import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {SessionsController} from "./securityDevices.controller";
import {FindAllActiveSessionsForUserUseCase} from "./useCase/findAllActiveSessionsForUser.use-case";
import {CqrsModule} from "@nestjs/cqrs";
import {CloseAllSessionsForUserExcludeCurrentUseCase} from "./useCase/closeAllSessionsForUserExcludeCurrent.use-case";
import {CloseSessionForCurrentUserUseCase} from "./useCase/closeSessionForCurrentUser.use-case";
import {Session, SessionSchema} from "./schema/session.schema";
import {SecurityDevicesRepository} from "./securityDevices.repository";
import {SecurityDevicesQueryRepository} from "./securityDevicesQuery.repository";
import {DatabaseModule} from "../../../setup/database/database.module";
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../auth/Entity/user.entity";


@Module({
    imports: [MongooseModule.forFeature([{name: Session.name, schema: SessionSchema}]),CqrsModule, DatabaseModule,
    TypeOrmModule.forFeature([Session])],
    controllers: [SessionsController],
    providers: [FindAllActiveSessionsForUserUseCase, CloseAllSessionsForUserExcludeCurrentUseCase, CloseSessionForCurrentUserUseCase,
        SecurityDevicesRepository, SecurityDevicesQueryRepository],
    exports: [SecurityDevicesRepository, SecurityDevicesQueryRepository],
})
export class SecurityDevicesModule {}
