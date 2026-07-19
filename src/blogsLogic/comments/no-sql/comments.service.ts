import { Injectable} from '@nestjs/common';
import {CommentsRepository} from "./comments.repository";


@Injectable()
export class CommentsService {
  constructor(
      private readonly commentsRepo: CommentsRepository,
  ) {}
  async removeAllCommentsForTest(){
    return this.commentsRepo.removeAllCommentsForTest()
  }
}
