import {BadRequestException, Inject, Injectable, NotFoundException} from '@nestjs/common';
import {UsersRepository} from "./users.repository";
import {UsersQueryRepository} from "./usersQuery.repository";
import {CreateUserDto} from "./dto/create-user.dto";
import {mapUserToView} from "../mappers/user.mapper";
import {PaginationQueryDto} from "../dto/pagination-query.dto";
import {paginationHelper} from "../helpers/paginationQuery.helper";

@Injectable()
export class UsersService {
    constructor(
       @Inject(UsersRepository) private readonly usersRepo: UsersRepository,
       @Inject(UsersQueryRepository) private readonly usersQueryRepo: UsersQueryRepository,
    ) {}

    async createUser(dto: CreateUserDto) {
        const createdUser = await this.usersRepo.createUser(dto);
        return mapUserToView(createdUser)
    }

    async findAllUsersByQuery(query:PaginationQueryDto) {
        const pagination = paginationHelper(query);
        return this.usersQueryRepo.findAllUsersByQuery(pagination);
    }
    async findUserById(id: string){
        const user = await this.usersQueryRepo.findUserById(id);
        if(!user){
            throw new NotFoundException("User not found");
        }
        return user
    }

    async removeUserById(id: string){
        await this.findUserById(id);
        const deleted = await this.usersRepo.removeUserById(id);
        if (!deleted) {
            //if deletedCount = 0
            throw new BadRequestException('User was not deleted');
        }
        return
    }
}
