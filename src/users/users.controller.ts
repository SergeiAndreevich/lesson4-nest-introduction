import {Body, Controller, Inject, Post, Get, Query, Delete, Param, HttpCode, UseGuards} from '@nestjs/common';
import {CreateUserDto} from "./dto/create-user.dto";
import {UsersService} from "./users.service";
import {PaginationQueryDto} from "../dto/pagination-query.dto";
import {BasicGuard} from "../guards/basic.guard";

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) {}

    @Post()
    @UseGuards(BasicGuard)
    createUser(@Body() dto: CreateUserDto) {
        return this.usersService.createUser(dto)
    }

    @Get()
    @UseGuards(BasicGuard)
    findAllUsersByQuery(@Query() query: PaginationQueryDto){
        return this.usersService.findAllUsersByQuery(query)
    }

    @Delete(':id')
    @UseGuards(BasicGuard)
    @HttpCode(204)
    removeUserById(@Param('id') id: string){
        return this.usersService.removeUserById(id)
    }
}
