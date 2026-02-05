import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {MongooseModule} from "@nestjs/mongoose";
import {AppRepository} from "./app.repository";
import {Blog, BlogSchema} from "./blogs/schemas/blog.schema";
import {Post, PostSchema} from "./posts/schemas/post.schema";
import {Comment, CommentSchema} from "./comments/schemas/comment.schema";
import {User, UserSchema} from "./users/schemas/user.schema";

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27018', {dbName: 'mongodb'}),
      MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }, { name: Post.name, schema: PostSchema },
        { name: Comment.name, schema: CommentSchema }, { name: User.name, schema: UserSchema }]),
  ],
  controllers: [AppController],
  providers: [AppService, AppRepository],
})
export class AppModule {}
