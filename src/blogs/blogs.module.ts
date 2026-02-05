import {Module} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Blog, BlogSchema} from "./schemas/blog.schema";
import {BlogsRepository} from "./blogs.repository";
import {BlogsQueryRepository} from "./blogsQuery.repository";
import {PostsModule} from "../posts/posts.module";
import {PostsService} from "../posts/posts.service";
import {Post, PostSchema} from "../posts/schemas/post.schema";

@Module({
  imports: [MongooseModule.forFeature([
      {name: Blog.name, schema: BlogSchema}, {name: Post.name, schema: PostSchema}]),
      PostsModule
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository]
})
export class BlogsModule {}
