import {Body, Controller, Delete, Get, HttpCode, Injectable, Param, Post, Query, UseGuards} from "@nestjs/common";
import {BasicGuard} from "../../../setup/guard/basic.guard";
import {CreateUserDto} from "./dto/create-user.dto";
import {PaginationQueryDto} from "../../dto/pagination-query.dto";
import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {CreateUserSACommand} from "./useCase/createUserSA.use-case";
import {FindUsersByQuerySAQuery} from "./useCase/findUsersByQuerySA.use-case";
import {RemoveUserSACommand} from "./useCase/removeUserSA.use-case";

@Controller('sa/users')
export class UsersSAController{
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) {}

    @Post()
    @UseGuards(BasicGuard)
    async createUser(@Body() dto: CreateUserDto) {
        return await this.commandBus.execute(new CreateUserSACommand(dto));
    }

    @Get()
    @UseGuards(BasicGuard)
    async findAllUsersByQuery(@Query() query: PaginationQueryDto){
        return await this.queryBus.execute(new FindUsersByQuerySAQuery(query));
    }

    @Delete(':id')
    @UseGuards(BasicGuard)
    @HttpCode(204)
    async removeUserById(@Param('id') id: string){
        await this.commandBus.execute(new RemoveUserSACommand(id));
        return
    }
}