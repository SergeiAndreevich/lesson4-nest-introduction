import {Inject, Injectable} from '@nestjs/common';
import {AppRepository} from "./app.repository";

@Injectable()
export class AppService {
  constructor(
      @Inject(AppRepository) private readonly appRepository: AppRepository,
  ) {}
  getHello(): string {
    return 'Hello World! Its my first NestJS app';
  }
  async removeAll() {
    await this.appRepository.removeAll();
    return
  }
}
