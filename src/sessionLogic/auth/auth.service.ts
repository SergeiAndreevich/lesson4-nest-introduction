import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import {LoginInputDto} from "./dto/login-input.dto";
import {EmailInputDto} from "./dto/email-input-dto";
import {NewPasswordInputDto} from "./dto/new-password-input.dto";
import {CodeInputDto} from "./dto/code-input.dto";
import {UsersService} from "../users/users.service";
import { v4 as uuidv4 } from "uuid";
import {mapUserToView} from "../../mappers/user.mapper";
import {EmailService} from "../../helpers/emailHelper/mailNotification.service";
import {JwtService} from "@nestjs/jwt";


@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService,
              private readonly emailSenderHelper: EmailService,
              private readonly jwtService: JwtService,
  ) {}
  async loginUser(loginInputDto: LoginInputDto) {
      //ищем юзера
      const user = await this.usersService.findUserByLoginOrEmail(loginInputDto.loginOrEmail);
      if(!user){
        throw new UnauthorizedException({message: 'User not found', field: 'loginOrEmail'});
      }
      //проверяем пароль
      if(user.accountData.password !== loginInputDto.password) {
        throw new UnauthorizedException({message: 'Invalid password', field: 'password'});
      }
      //создаем аксес рефреш токены, создаем сессию и возвращаем токен
      const accessToken = this.jwtService.sign({userId: user._id.toString(), userLogin: user.accountData.login});
      const refreshToken = this.jwtService.sign({userId: user._id.toString(), userLogin: user.accountData.login}, {
        expiresIn: '7d'
      })
      return  {accessToken: accessToken, refreshToken: refreshToken}
  }

  recoveryUserPassword(emailInputDto: EmailInputDto) {
    const confirmationCode = uuidv4();
    //const token = crypto.randomUUID();
    return this.usersService.sendPasswordRecoveryCode(emailInputDto.email, confirmationCode)
  }

  setNewPassword(newPasswordInputDto: NewPasswordInputDto) {
    //const newPasswordHash = await bcryptHelper.generateHash(newPassword);
    return this.usersService.setNewPassword(newPasswordInputDto.newPassword, newPasswordInputDto.recoveryCode);
  }

  async registration(createAuthDto: CreateAuthDto) {
    const createdUser = await this.usersService.createUser(createAuthDto);
    const user = await this.usersService.findUserById(createdUser.id);
    const confirmationCode = user.emailConfirmation.code;
    if(!confirmationCode){
      throw new BadRequestException({message: 'Smth wrong with received user and its emailConfirmationCode', field: 'code'});
    }
    await this.emailSenderHelper.sendConfirmationEmail(createdUser.email, confirmationCode);
    return
  }

  registrationConfirmation(codeInputDto: CodeInputDto) {
    return this.usersService.registrationConfirmation(codeInputDto)
  }

  registrationEmailResending(emailInputDto: EmailInputDto) {

    return this.usersService.registrationEmailResending(emailInputDto)
  }

  findMe(userId:string) {
    const user = this.usersService.findUserById(userId);
    const viewModel = mapUserToView(user);
    return {
      email: viewModel.email,
      login: viewModel.login,
      userId: viewModel.id,
    }
  }
}
