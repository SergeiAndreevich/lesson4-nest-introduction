import {Controller, Delete, Get, HttpCode} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Delete('testing/all-data')
  @HttpCode(204)
  removeAll() {
    return this.appService.removeAll()
  }
}
