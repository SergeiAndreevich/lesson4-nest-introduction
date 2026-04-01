import {Controller, Delete, Get, HttpCode, Param, UseGuards} from "@nestjs/common";
import {CommandBus} from "@nestjs/cqrs";
import {BearerGuard} from "../../../setup/guard/bearer.guard";
import {FindAllActiveSessionsForUserCommand} from "./useCase/findAllActiveSessionsForUser.use-case";
import {CloseAllSessionsForUserExcludeCurrentCommand} from "./useCase/closeAllSessionsForUserExcludeCurrent.use-case";
import {CloseSessionForCurrentUserCommand} from "./useCase/closeSessionForCurrentUser.use-case";

@Controller('security')
export class SessionsController {
    constructor(
        private readonly commandBus: CommandBus,
    ) {}

    @Get('devices')
    @UseGuards(BearerGuard)
    @HttpCode(200)
    findActiveSessionsForCurrentUser(){
        return this.commandBus.execute(new FindAllActiveSessionsForUserCommand());
    }

    @Delete('devices')
    @UseGuards(BearerGuard)
    @HttpCode(204)
    terminateAllSessionsForUserExcludeCurrent(){
        return this.commandBus.execute(new CloseAllSessionsForUserExcludeCurrentCommand())
    }

    @Delete('devices/:deviceId')
    @UseGuards(BearerGuard)
    @HttpCode(204)
    terminateSessionForCurrentUser(@Param('deviceId') deviceId:string){
        return this.commandBus.execute(new CloseSessionForCurrentUserCommand())
    }
}
