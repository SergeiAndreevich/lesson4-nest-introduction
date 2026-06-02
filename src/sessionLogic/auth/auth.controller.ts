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
import {CommandBus} from "@nestjs/cqrs";
import {RefreshAccessCommand} from "./useCase/refreshAccess.use-case";
import {LogoutCommand} from "./useCase/logout.use-case";
import {REFRESH_TOKEN_TTL_SEC} from "../../../setup/globalVariables";
import {AntiClickerGuard} from "../../rateLimitLogic/antiClicker.guard";


@Controller('auth')
//@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService,
              private readonly commandBus: CommandBus,) {}

  //@Throttle({ default: { limit: 5, ttl: 10000 } })
  @Post('login')
  @UseGuards(AntiClickerGuard)
  @HttpCode(200)
  async login(
      @Req() req: Request,
      @Body() dto: LoginInputDto,
      @Res({ passthrough: true }) res: Response
  ) {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'] || 'unknown device';
    const { accessToken, refreshToken } = await this.authService.loginUser(dto, ip, userAgent);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // true на проде (https)
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_TTL_SEC * 1000 // 7 дней = 1000 * 60 * 60 * 24 * 7
    });
    console.log('SET COOKIE', refreshToken);
    return { accessToken };
  }

  @Post('refresh-token')
  @HttpCode(200)
  async refresh(@Req() req: Request,
                @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies.refreshToken
    console.log('refreshToken', refreshToken)
    const result = await this.commandBus.execute(new RefreshAccessCommand(refreshToken));

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true, // true на проде (https)
      sameSite: 'lax',
      maxAge:  REFRESH_TOKEN_TTL_SEC * 1000 // 7 дней = 1000 * 60 * 60 * 24 * 7
    });
    return {accessToken: result.accessToken}
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request,
         @Res({ passthrough: true }) res: Response){
    await this.commandBus.execute(new LogoutCommand(req.cookies.refreshToken));

    //очищаем куки и возвращаем ответочку
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    });
    return
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

  //@Throttle({ default: { limit: 5, ttl: 10000 } })
  @Post('registration')
  @UseGuards(AntiClickerGuard)
  @HttpCode(204)
  registration(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.registration(createAuthDto);
  }

  //@Throttle({ default: { limit: 5, ttl: 10000 } })
  @Post('registration-confirmation')
  @UseGuards(AntiClickerGuard)
  @HttpCode(204)
  registrationConfirmation(@Body() codeInputDto: CodeInputDto) {
    return this.authService.registrationConfirmation(codeInputDto);
  }

  //@Throttle({ default: { limit: 5, ttl: 10000 } })
  @Post('registration-email-resending')
  @UseGuards(AntiClickerGuard)
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
