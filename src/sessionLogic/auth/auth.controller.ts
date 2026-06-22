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
//import {AntiClickerGuard} from "../../rateLimitLogic/antiClicker.guard";
import {Throttle, ThrottlerGuard} from "@nestjs/throttler";
import {RateLimit, RateLimiterGuard} from "nestjs-rate-limiter";
import {AntiClickerGuard} from "../../rateLimitLogic/antiClicker.guard";

const AUTH_RATE_LIMIT = {
  points: 5,
  duration: 10,
};


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
              private readonly commandBus: CommandBus,) {
  }

  @Post('login')
  @UseGuards(AntiClickerGuard)
  //@UseGuards(RateLimiterGuard)  // ← Добавляем гард
  //@RateLimit(AUTH_RATE_LIMIT)
  @HttpCode(200)
  async login(
      @Req() req: Request,
      @Body() dto: LoginInputDto,
      @Res({passthrough: true}) res: Response
  ) {
    //входящий ip
    const ip = req.ip;
    //входящий браузер
    const userAgent = req.headers['user-agent'] || 'unknown device';
    //на входе получил loginOrEmail, password, на выходе должен получить AT и RT
    const {accessToken, refreshToken} = await this.authService.loginUser(dto, ip, userAgent);


    //отдаем пользователю в куки рефреш токен и в респонсе аксесс токен
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true, // true на проде (https)
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_TTL_SEC * 1000
    });
    return { accessToken };
  }
  //Вроде все четко работает, все логично: если в базе нашелся чел с логином/почтой и пароли совпали, то на 10 секунд
  //выдаем аксесс токен, где есть уникальный юзер айди, и выдаем рефреш токен где уникальный айди юзера, уникальный код устройства и номер сессии
  //кроме того создается сессия, в которой сидит уникальный юзер Айди, уникальный номер устройства и номер версии
  //а еще в сессии сидит свойство протухания revoked: false

  @Post('refresh-token')
  @HttpCode(200)
  async refresh(@Req() req: Request,
                @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies.refreshToken
    //console.log('refreshToken', refreshToken)
    //ищем сессию и если нашли, то удаляем
    const result = await this.commandBus.execute(new RefreshAccessCommand(refreshToken));
    //логика такова, что мне приходит рефреш, я расчехляю из него уникальный юзер Айди, уникальный девайс Айди, версию сессии
    // теперь у меня в БД хранится список из сессий. При рефреше происходит "протухание" старой сессии и создани новой


    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true, // true на проде (https)
      sameSite: 'lax',
      maxAge:  REFRESH_TOKEN_TTL_SEC * 1000
    });
    return {accessToken: result.accessToken}
  }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request,
               @Res({ passthrough: true }) res: Response){
    await this.commandBus.execute(new LogoutCommand(req.cookies.refreshToken));

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

  @Post('registration')
  @UseGuards(AntiClickerGuard)
  //@UseGuards(RateLimiterGuard)  // ← Добавляем гард
  //@RateLimit(AUTH_RATE_LIMIT)
  @HttpCode(204)
  registration(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.registration(createAuthDto);
  }

  @Post('registration-confirmation')
  @UseGuards(AntiClickerGuard)
  //@UseGuards(RateLimiterGuard)  // ← Добавляем гард
  //@RateLimit(AUTH_RATE_LIMIT)
  @HttpCode(204)
  registrationConfirmation(@Body() codeInputDto: CodeInputDto) {
    return this.authService.registrationConfirmation(codeInputDto);
  }

  @Post('registration-email-resending')
  @UseGuards(AntiClickerGuard)
  //@UseGuards(RateLimiterGuard)  // ← Добавляем гард
  //@RateLimit(AUTH_RATE_LIMIT)
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
