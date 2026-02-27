import {BadRequestException, Injectable, NotFoundException, UnauthorizedException} from '@nestjs/common';
import {UsersRepository} from "./users.repository";
import {UsersQueryRepository} from "./usersQuery.repository";
import {CreateUserDto} from "./dto/create-user.dto";
import {mapUserToView} from "../mappers/user.mapper";
import {PaginationQueryDto} from "../dto/pagination-query.dto";
import {paginationHelper} from "../helpers/paginationQuery.helper";
import {User} from "./schemas/user.schema";
import {CreateAuthDto} from "../auth/dto/create-auth.dto";
import {CodeInputDto} from "../auth/dto/code-input.dto";
import {EmailInputDto} from "../auth/dto/email-input-dto";
import {v4 as uuidv4} from "uuid";
import {JwtService} from "@nestjs/jwt";
import {EmailSenderHelper} from "../helpers/emailSender.helper";
import {EmailService} from "../helpers/emailHelper/mailNotification.service";


@Injectable()
export class UsersService {
    constructor(
       private readonly usersRepo: UsersRepository,
       private readonly usersQueryRepo: UsersQueryRepository,
       private readonly jwtService: JwtService,
       private readonly emailSenderHelper: EmailService,
    ) {}

    async createUser(dto: CreateUserDto | CreateAuthDto) {
        //специально для тестов так. Раньше был один метод
        const userByLogin = await this.usersQueryRepo.findUserByLogin(dto.login);
        if(userByLogin){
            throw new BadRequestException({message: 'User already exists', field: 'login'});
        }
        const userByEmail = await this.usersQueryRepo.findUserByEmail(dto.email);
        if(userByEmail){
            throw new BadRequestException({message: 'User already exists', field: 'email'});
        }
        const userData = User.createNewUser(dto);
        console.log('userData:', userData);
        const createdUser = await this.usersRepo.createUser(userData);
        return mapUserToView(createdUser)
    }
    async registrationConfirmation(codeInputDto: CodeInputDto) {
        //нашли юзера по коду, значит точно код совпадает
        const user = await this.findUserByEmailCode(codeInputDto);
        if(!user){
            throw new BadRequestException({message: 'User not found', field: 'code'});
        }
        //далее проверяем, если почта уже подтверждена или если код истек, то выкидываем ошибку
        if(user.emailConfirmation.isConfirmed === true || user.emailConfirmation.expiresAt < new Date()) {
            throw new BadRequestException({message: 'Incorrect confirmation info', field: 'code'});
        }
        const isConfirmed = await this.usersRepo.confirmEmail(user._id.toString());
        if(!isConfirmed){
            throw new BadRequestException('User have not updated');
        }
        return

    }
    async registrationEmailResending(emailDto: EmailInputDto){
        const user = await this.usersQueryRepo.findUserByEmail(emailDto.email);
        if(!user ||  user.emailConfirmation.isConfirmed === true) {
            throw new BadRequestException({message:'User not found or already confirmed' , field: 'email'});
        }
        const newCode = uuidv4();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 3);

        const isUpdated = await this.usersRepo.updateEmailConfirmationCode(
            user._id.toString(),
            newCode,
            expiresAt
        );
        if(!isUpdated){
            throw new BadRequestException('User have not updated');
        }
        //вероятно здесь нужно добавить больше логики...
        await this.emailSenderHelper.sendConfirmationEmail(user.accountData.email, newCode);
        return
    }
    async sendPasswordRecoveryCode(email: string, confirmationCode: string){
        const isUpdated = await this.usersRepo.recoveryPassword(email, confirmationCode);
        if(!isUpdated){
            throw new BadRequestException('User have not updated');
        }
        //отправляем письмо на почту для подтверждения
        //this.emailSenderHelper.sendPasswordRecovery(email,'password recovery', confirmationCode);
        await this.emailSenderHelper.sendConfirmationEmail(email, confirmationCode);
        return
    }
    async setNewPassword(newPassword: string, recoveryCode: string){
        const isUpdated = await this.usersRepo.setNewPassword(newPassword, recoveryCode);
        if(!isUpdated){
            throw new BadRequestException('User have not updated');
        }
        return
    }


    async findUserByLoginOrEmail(loginOrEmail:string){
        return this.usersQueryRepo.findUserByLoginOrEmail(loginOrEmail);
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
        const user = await this.usersQueryRepo.findUserByEmailCode(confirmationCode.code)
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
