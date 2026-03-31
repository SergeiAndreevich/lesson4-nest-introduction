import {Controller, Delete, Get, HttpCode, Param} from "@nestjs/common";
import {CommandBus} from "@nestjs/cqrs";

@Controller('security')
export class SessionsController {
    constructor(
        private readonly commandBus: CommandBus,
    ) {}

    @Get('devices')
    @HttpCode(200)
    findActiveSessionsForCurrentUser(){
        return null;
    }

    @Delete('devices')
    @HttpCode(204)
    terminateAllSessionsForUserExcludeCurrent(){
        return null;
    }

    @Delete('devices/:deviceId')
    @HttpCode(204)
    terminateSessionForCurrentUser(@Param('deviceId') deviceId:string){
        return null;
    }
}
