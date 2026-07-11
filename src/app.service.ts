import { Injectable} from '@nestjs/common';
import {UsersService} from "./sessionLogic/users/no-sql/users.service";
import {UsersRepository} from "./sessionLogic/users/no-sql/users.repository";
import {CommentsRepository} from "./blogsLogic/comments/comments.repository";
import {PostsRepository} from "./blogsLogic/posts/no-sql/posts.repository";
import {BlogsRepository} from "./blogsLogic/blogs/no-sql/blogs.repository";
import {UsersSQLRepository} from "./sessionLogic/users/users.sql.repository";
import {BlogsSQLRepository} from "./blogsLogic/blogs/blogsSA.repository";
import {PostsSQLRepository} from "./blogsLogic/posts/postsSQL.repository";

@Injectable()
export class AppService {
  constructor(
      private blogsRepo: BlogsRepository,
      private postsRepo: PostsRepository,
      private commentsRepo: CommentsRepository,
      private usersRepo: UsersRepository,
      private usersSQLRepo: UsersSQLRepository,
      private blogsSQLRepository: BlogsSQLRepository,
      private postsSQLRepository: PostsSQLRepository
  ) {}
  getHello(): string {
    return 'Hello World! Its my first NestJS app';
  }
  async removeAll() {
    await this.blogsRepo.removeAllBlogsForTest();
    await this.postsRepo.removeAllPostsForTest();
    await this.commentsRepo.removeAllCommentsForTest();
    await this.usersRepo.removeAllUsersForTest();

    await this.usersSQLRepo.removeAllUsersForTest();
    await this.blogsSQLRepository.removeAllBlogsForTest();
    await this.postsSQLRepository.removeAllPostsForTest();
    return
  }
}
