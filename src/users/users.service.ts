import {BadRequestException, Inject, Injectable, NotFoundException} from '@nestjs/common';
import {UsersRepository} from "./users.repository";
import {UsersQueryRepository} from "./usersQuery.repository";
import {CreateUserDto} from "./dto/create-user.dto";
import {mapUserToView} from "../mappers/user.mapper";
import {PaginationQueryDto} from "../dto/pagination-query.dto";
import {paginationHelper} from "../helpers/paginationQuery.helper";
import {User} from "./schemas/user.schema";
import {CreateAuthDto} from "../auth/dto/create-auth.dto";
import {CodeInputDto} from "../auth/dto/code-input.dto";

@Injectable()
export class UsersService {
    constructor(
       private readonly usersRepo: UsersRepository,
       private readonly usersQueryRepo: UsersQueryRepository,
    ) {}

    async createUser(dto: CreateUserDto | CreateAuthDto) {
        const user = await this.findUserByLoginOrEmail(dto.login, dto.email);
        if(user){
            throw new BadRequestException('User already exists');
        }
        const userData = User.createNewUser(dto);
        const createdUser = await this.usersRepo.createUser(userData);
        //отправить сообщение с кодом подтверждения

        return mapUserToView(createdUser)
    }
    async registrationConfirmation(codeInputDto: CodeInputDto) {
        const user = await this.findUserByEmailCode(codeInputDto);
        if(!user){
            throw new BadRequestException('User not found');
        }
        if(user && user.emailConfirmation.isConfirmed === false && user.emailConfirmation.expiresAt > new Date()) {
            const isConfirmed = await this.usersRepo.confirmEmail(user._id.toString());
            if(!isConfirmed){
                throw new BadRequestException('User have not updated');
            }
            return
        }
        throw new BadRequestException('Incorrect code confirmation');
    }

    async findUserByLoginOrEmail(loginOrEmail:string, emailOrLogin: string){
        return this.usersQueryRepo.findUserByLoginOrEmail(loginOrEmail,emailOrLogin);
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
    async findUserByEmailCode(confirmationCode: CodeInputDto) {
        return this.usersQueryRepo.findUserByEmailCode(confirmationCode.code)
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
