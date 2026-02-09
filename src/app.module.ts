import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {MongooseModule} from "@nestjs/mongoose";
import {AppRepository} from "./app.repository";

import {BlogsModule} from "./blogs/blogs.module";
import {PostsModule} from "./posts/posts.module";
import {CommentsModule} from "./comments/comments.module";
import {UsersModule} from "./users/users.module";
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27018', {dbName: 'lesson4'}),
      BlogsModule, PostsModule,CommentsModule,UsersModule, AuthModule
  ],
  controllers: [AppController],
  providers: [AppService, AppRepository],
})
export class AppModule {}
