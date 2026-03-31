import {Controller, Get, Post, Body, HttpCode, UseGuards, Res, Req} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import {LoginInputDto} from "./dto/login-input.dto";
import {EmailInputDto} from "./dto/email-input-dto";
import {NewPasswordInputDto} from "./dto/new-password-input.dto";
import {CodeInputDto} from "./dto/code-input.dto";
import {BearerGuard} from "../../../setup/guard/bearer.guard";
import {UserId} from "../../customDecorators/userId.decorator";


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(
      @Body() dto: LoginInputDto,
      @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken } = await this.authService.loginUser(dto);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // true на проде (https)
      sameSite: 'strict',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 7 дней
    });

    return { accessToken };
  }

  @Post('refresh-token')
  async refresh(@Req() req: Request) {
    const refreshToken = req.cookies.refreshToken;

    // проверка токена
    return
  }

  @Post('logout')
  @HttpCode(204)
  logout(){

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
