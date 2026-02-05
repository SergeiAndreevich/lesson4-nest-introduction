import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import {Post, PostSchema} from "./schemas/post.schema";
import {MongooseModule} from "@nestjs/mongoose";
import {PostsRepository} from "./posts.repository";
import {PostsQueryRepository} from "./postsQuery.reposiroty";
import {CommentsModule} from "../comments/comments.module";
import {Blog, BlogSchema} from "../blogs/schemas/blog.schema";
import {BlogsQueryRepository} from "../blogs/blogsQuery.repository";

@Module({
  imports: [MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }, { name: Blog.name, schema: BlogSchema } // для проверки blogId
  ]),
  CommentsModule],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository, PostsQueryRepository, BlogsQueryRepository],
  exports: [PostsService,PostsRepository,PostsQueryRepository],
})
export class PostsModule {}
