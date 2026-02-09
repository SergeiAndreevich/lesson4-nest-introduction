import {Body, Controller, Inject, Post, Get, Query, Delete, Param, HttpCode} from '@nestjs/common';
import {CreateUserDto} from "./dto/create-user.dto";
import {UsersService} from "./users.service";
import {PaginationQueryDto} from "../dto/pagination-query.dto";

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) {}

    @Post()
    createUser(@Body() dto: CreateUserDto) {
        return this.usersService.createUser(dto)
    }

    @Get()
    findAllUsersByQuery(@Query() query: PaginationQueryDto){
        return this.usersService.findAllUsersByQuery(query)
    }

    @Delete(':id')
    @HttpCode(204)
    removeUserById(@Param('id') id: string){
        return this.usersService.removeUserById(id)
    }
}
