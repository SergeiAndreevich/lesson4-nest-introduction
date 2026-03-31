import { Module } from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {SessionsController} from "./securityDevices.controller";


@Module({
    imports: [MongooseModule.forFeature([])],
    controllers: [SessionsController],
    providers: [],
    exports: [],
})
export class ReactionsModule {}
