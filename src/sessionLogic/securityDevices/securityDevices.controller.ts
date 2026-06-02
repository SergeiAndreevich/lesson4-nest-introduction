import {Controller, Delete, Get, HttpCode, Param, UseGuards} from "@nestjs/common";
import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {BearerGuard} from "../../../setup/guard/bearer.guard";
import {FindAllActiveSessionsForUserQuery} from "./useCase/findAllActiveSessionsForUser.use-case";
import {CloseAllSessionsForUserExcludeCurrentCommand} from "./useCase/closeAllSessionsForUserExcludeCurrent.use-case";
import {CloseSessionForCurrentUserCommand} from "./useCase/closeSessionForCurrentUser.use-case";
import {UserId} from "../../customDecorators/userId.decorator";
import {DeviceId} from "../../customDecorators/deviceId.decorator";
import {RefreshTokenCookieGuard} from "../../../setup/guard/refreshTokenFromCookies.guard";

@Controller('security')
export class SessionsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Get('devices')
    @UseGuards(RefreshTokenCookieGuard)
    @HttpCode(200)
    findActiveSessionsForCurrentUser(@UserId() userId:string){
        return this.queryBus.execute(new FindAllActiveSessionsForUserQuery(userId));
    }

    @Delete('devices')
    @UseGuards(RefreshTokenCookieGuard)
    @HttpCode(204)
    terminateAllSessionsForUserExcludeCurrent(@UserId() userId:string, @DeviceId() deviceId:string){
        return this.commandBus.execute(new CloseAllSessionsForUserExcludeCurrentCommand(userId, deviceId))
    }

    @Delete('devices/:deviceId')
    @UseGuards(RefreshTokenCookieGuard)
    @HttpCode(204)
    terminateSessionForCurrentUser(@Param('deviceId') deviceId:string, @UserId() userId:string){
        return this.commandBus.execute(new CloseSessionForCurrentUserCommand(deviceId, userId))
    }
}
