import { Injectable} from '@nestjs/common';
import {UsersService} from "./sessionLogic/users/users.service";
import {UsersRepository} from "./sessionLogic/users/users.repository";
import {CommentsRepository} from "./blogsLogic/comments/comments.repository";
import {PostsRepository} from "./blogsLogic/posts/posts.repository";
import {BlogsRepository} from "./blogsLogic/blogs/blogs.repository";

@Injectable()
export class AppService {
  constructor(
      private blogsRepo: BlogsRepository,
      private postsRepo: PostsRepository,
      private commentsRepo: CommentsRepository,
      private usersRepo: UsersRepository,
  ) {}
  getHello(): string {
    return 'Hello World! Its my first NestJS app';
  }
  async removeAll() {
    await this.blogsRepo.removeAllBlogsForTest();
    await this.postsRepo.removeAllPostsForTest();
    await this.commentsRepo.removeAllCommentsForTest();
    await this.usersRepo.removeAllUsersForTest();
    return
  }
}
