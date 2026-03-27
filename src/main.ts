import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {appSetup} from "../setup/app.setup";
import {BadRequestException, ValidationPipe} from "@nestjs/common";
import {ValidationError} from "class-validator";
import {AllExceptionsFilter} from "../setup/exception-filter/exceptionFilter.filter";
import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe({
    //игнорирует все поля, у которых нет декораторов
    whitelist: true,

    //выбрасывает ошибку, если передали те поля, у которых нет декораторов
    forbidNonWhitelisted: false,

    //нужно ли остановить валидацию после обнаружения первой ошибки или продолжить собирать все
    stopAtFirstError: false,

    //эта функция вызывается, когда валидация не пройдена и возвращается какой-то Exception
    exceptionFactory: (errors:ValidationError[]) => {
      //на вход этой функции (даже без нашего вмешательства) подается ValidationError[]
      //у каждого элемента будет property — имя поля, constraints — объект, где ключи — названия правил (например, 'isEmail'), а значения — сообщения об ошибках.
      return new BadRequestException({
        errorsMessages: errors.map(err => ({
          message: Object.values(err.constraints ?? {}).join(', '),
          field: err.property
        }))
      });
    }
  }));
  //ValidationPipe обрабатывает только ошибки, возникшие до входа в контроллер (на этапе валидации входных данных). Но в приложении могут быть и другие исключения:
  app.useGlobalFilters(new AllExceptionsFilter());

  //appSetup(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
