import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsModule } from './blogs/blogs.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import {MongooseModule} from "@nestjs/mongoose";

@Module({
  imports: [BlogsModule, PostsModule, CommentsModule, MongooseModule.forRoot('mongodb://localhost:27018', {dbName: 'mongodb'})],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
