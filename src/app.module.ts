import {Module} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {MongooseModule} from "@nestjs/mongoose";
import {AppRepository} from "./app.repository";
import {BlogsModule} from "./blogsLogic/blogs/blogs.module";
import {PostsModule} from "./blogsLogic/posts/posts.module";
import {CommentsModule} from "./blogsLogic/comments/comments.module";
import {UsersModule} from "./sessionLogic/users/users.module";
import { AuthModule } from './sessionLogic/auth/auth.module';

import {configModule} from "./dynamic-config-module";
import {APP_FILTER} from "@nestjs/core";
import {DomainHttpExceptionsFilter} from "../setup/exception-filter/domain-filter";
import {OtherHttpExceptionsFilter} from "../setup/exception-filter/other-http-filter";
import {CqrsModule} from "@nestjs/cqrs";
import {Blog, BlogSchema} from "./blogsLogic/blogs/schema/blog.schema";
import {Post, PostSchema} from "./blogsLogic/posts/shema/post.schema";
import {Comment,CommentSchema} from "./blogsLogic/comments/schema/comment.schema";
import {User, UserSchema} from "./sessionLogic/users/schema/user.schema";
import { ReactionsModule } from './reactionsLogic/reactions.module';

@Module({
  imports: [configModule, MongooseModule.forRoot('mongodb://localhost:27018/lesson4'),
      MongooseModule.forFeature([
          { name: Blog.name, schema: BlogSchema },
          { name: Post.name, schema: PostSchema },
          { name: Comment.name, schema: CommentSchema },
          { name: User.name, schema: UserSchema },
      ]),
      BlogsModule, PostsModule,CommentsModule,UsersModule, AuthModule, CqrsModule, ReactionsModule
  ],
  controllers: [AppController],
  providers: [AppService, AppRepository,
      // {
      //     provide: APP_FILTER,
      //     useClass: OtherHttpExceptionsFilter,
      // },
      // {
      //     provide: APP_FILTER,
      //     useClass: DomainHttpExceptionsFilter,
      // },
  ],
})
export class AppModule {}


//MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27018/lesson4'),