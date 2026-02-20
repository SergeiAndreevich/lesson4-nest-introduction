import {Module} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {MongooseModule} from "@nestjs/mongoose";
import {AppRepository} from "./app.repository";
import {BlogsModule} from "./blogs/blogs.module";
import {PostsModule} from "./posts/posts.module";
import {CommentsModule} from "./comments/comments.module";
import {UsersModule} from "./users/users.module";
import { AuthModule } from './auth/auth.module';
import {Blog, BlogSchema} from "./blogs/schemas/blog.schema";
import {Post, PostSchema} from "./posts/schemas/post.schema";
import {User, UserSchema} from "./users/schemas/user.schema";
import {Comment, CommentSchema} from "./comments/schemas/comment.schema";
import {configModule} from "./dynamic-config-module";

@Module({
  imports: [configModule, MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27018/lesson4'),
      MongooseModule.forFeature([
          { name: Blog.name, schema: BlogSchema },
          { name: Post.name, schema: PostSchema },
          { name: Comment.name, schema: CommentSchema },
          { name: User.name, schema: UserSchema },
      ]),
      BlogsModule, PostsModule,CommentsModule,UsersModule, AuthModule
  ],
  controllers: [AppController],
  providers: [AppService, AppRepository],
})
export class AppModule {}
