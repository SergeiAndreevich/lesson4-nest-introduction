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

@Injectable()
export class UsersService {
    constructor(
       private readonly usersRepo: UsersRepository,
       private readonly usersQueryRepo: UsersQueryRepository,
       private readonly jwtService: JwtService,
       private readonly emailSenderHelper: EmailSenderHelper,
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
        //console.log('start creating user', dto);
        //console.log('from DB', userByLogin, userByEmail);
        const userData = User.createNewUser(dto);
        //console.log('userData:', userData);
        const createdUser = await this.usersRepo.createUser(userData);
        const confirmationCode = createdUser.emailConfirmation.code;
        //console.log('emailConfirmationCode:', confirmationCode);
        if(!confirmationCode){
            throw new BadRequestException('Smth wrong with received user and its emailConfirmationCode');
        }
        //отправить сообщение с кодом подтверждения
        await this.emailSenderHelper.sendEmailConfirmation(createdUser.accountData.email, confirmationCode);
        //console.log('end of creating user:', createdUser);
        return mapUserToView(createdUser)
    }
    async registrationConfirmation(codeInputDto: CodeInputDto) {
        console.log('CODE_INPUT_DTO', codeInputDto);
        const user = await this.findUserByEmailCode(codeInputDto);
        if(!user){
            throw new BadRequestException({message: 'User not found', field: 'code'});
        }
        console.log('EMAIL_CONFIRMATION', user);
        if(user && user.emailConfirmation.isConfirmed === false &&
            user.emailConfirmation.expiresAt &&
            user.emailConfirmation.expiresAt > new Date()) {
            const isConfirmed = await this.usersRepo.confirmEmail(user._id.toString());
            if(!isConfirmed){
                throw new BadRequestException('User have not updated');
            }
            return
        }
        throw new BadRequestException({message: 'Incorrect code confirmation', field: 'code'});
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
        await this.emailSenderHelper.sendEmailConfirmation(user.accountData.email,newCode);
        return
    }
    async sendPasswordRecoveryCode(email: string, confirmationCode: string){
        const isUpdated = await this.usersRepo.recoveryPassword(email, confirmationCode);
        if(!isUpdated){
            throw new BadRequestException('User have not updated');
        }
        //отправляем письмо на почту для подтверждения
        await this.emailSenderHelper.sendPasswordRecovery(email, confirmationCode);
        return
    }
    async setNewPassword(newPassword: string, recoveryCode: string){
        const isUpdated = await this.usersRepo.setNewPassword(newPassword, recoveryCode);
        if(!isUpdated){
            throw new BadRequestException('User have not updated');
        }
        return
    }
    async loginUser(loginOrEmail:string, password:string){
        console.log('LOGIN_USER_DTO',  loginOrEmail, password);
        //ищем юзера
        const user = await this.findUserByLoginOrEmail(loginOrEmail,loginOrEmail);
        console.log('LOGIN_USER', user)
        if(!user){
            throw new UnauthorizedException({message: 'User not found', field: 'loginOrEmail'});
        }
        //проверяем пароль
        //const isPasswordCorrect = await bcryptHelper.comparePassword(password,user.accountData.password);
        if(user.accountData.password !== password) {
            throw new UnauthorizedException({message: 'Invalid password', field: 'password'});
        }
        //создаем аксес рефреш токены, создаем сессию и возвращаем токен
        const accessToken = this.jwtService.sign({userId: user._id.toString()});
        console.log('accessToken:', accessToken);
        const deviceId = uuidv4();
        return  {accessToken: accessToken}
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
        const user = await this.usersQueryRepo.findUserByEmailCode(confirmationCode.code)
        console.log('USER_BY_EMAIL_CODE',user)
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
