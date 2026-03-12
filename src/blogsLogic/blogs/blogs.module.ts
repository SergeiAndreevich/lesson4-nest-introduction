import {Module, Post} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {BlogsRepository} from "./blogs.repository";
import {BlogsQueryRepository} from "./blogsQuery.repository";
import {PostsModule} from "../posts/posts.module";
import {Blog, BlogSchema} from "./schema/blog.schema";
import {PostSchema} from "../posts/shema/post.schema";
import {CreateNewBlogUseCase} from "./useCase/createNewBlog.use-case";
import {PostsQueryRepository} from "../posts/postsQuery.reposiroty";

@Module({
  imports: [MongooseModule.forFeature([
      {name: Blog.name, schema: BlogSchema}, {name: Post.name, schema: PostSchema}]),
      PostsModule
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository, PostsQueryRepository,
      CreateNewBlogUseCase]
})
export class BlogsModule {}
