import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import {LoginInputDto} from "./dto/login-input.dto";
import {EmailInputDto} from "./dto/email-input-dto";
import {NewPasswordInputDto} from "./dto/new-password-input.dto";
import {CodeInputDto} from "./dto/code-input.dto";
import {UsersService} from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}
  loginUser(loginInputDto: LoginInputDto) {
    return
  }

  recoveryUserPassword(emailInputDto: EmailInputDto) {
    return
  }

  setNewPassword(newPasswordInputDto: NewPasswordInputDto) {
    return
  }

  registration(createAuthDto: CreateAuthDto) {
    return this.usersService.createUser(createAuthDto);
  }

  registrationConfirmation(codeInputDto: CodeInputDto) {
    return this.usersService.registrationConfirmation(codeInputDto)
  }

  registrationEmailResending(emailInputDto: EmailInputDto) {
    return
  }

  findMe() {
    return
  }
}
