import {Controller, Get, Post, Body, HttpCode, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import {LoginInputDto} from "./dto/login-input.dto";
import {EmailInputDto} from "./dto/email-input-dto";
import {NewPasswordInputDto} from "./dto/new-password-input.dto";
import {CodeInputDto} from "./dto/code-input.dto";
import {BearerGuard} from "../guards/bearer.guard";
import {UserId} from "../customDecorators/userId.decorator";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  loginUser(@Body() loginInputDto: LoginInputDto) {
    return this.authService.loginUser(loginInputDto);
  }

  @Post('password-recovery')
  @HttpCode(204)
  recoveryUserPassword(@Body() emailInputDto: EmailInputDto) {
    return this.authService.recoveryUserPassword(emailInputDto);
  }

  @Post('new-password')
  @HttpCode(204)
  setNewPassword(@Body() newPasswordInputDto: NewPasswordInputDto){
    return this.authService.setNewPassword(newPasswordInputDto);
  }

  @Post('registration')
  @HttpCode(204)
  registration(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.registration(createAuthDto);
  }

  @Post('registration-confirmation')
  @HttpCode(204)
  registrationConfirmation(@Body() codeInputDto: CodeInputDto) {
    return this.authService.registrationConfirmation(codeInputDto);
  }

  @Post('registration-email-resending')
  @HttpCode(204)
  registrationEmailResending(@Body() emailInputDto: EmailInputDto) {
    return this.authService.registrationEmailResending(emailInputDto);
  }

  @Get('me')
  @UseGuards(BearerGuard)
  @HttpCode(200)
  async findMe(@UserId()userId:string ) {
    return this.authService.findMe(userId)
  }
}
