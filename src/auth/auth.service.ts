import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import {LoginInputDto} from "./dto/login-input.dto";
import {EmailInputDto} from "./dto/email-input-dto";
import {NewPasswordInputDto} from "./dto/new-password-input.dto";
import {CodeInputDto} from "./dto/code-input.dto";
import {UsersService} from "../users/users.service";
import { v4 as uuidv4 } from "uuid";
import {mapUserToView} from "../mappers/user.mapper";


@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}
  loginUser(loginInputDto: LoginInputDto) {
    return this.usersService.loginUser(loginInputDto.loginOrEmail, loginInputDto.password);
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

  registration(createAuthDto: CreateAuthDto) {
    return this.usersService.createUser(createAuthDto);
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
