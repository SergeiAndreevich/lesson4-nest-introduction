import {Module, Post} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Blog, BlogSchema} from "./schemas/blog.schema";
import {BlogsRepository} from "./blogs.repository";
import {BlogsQueryRepository} from "./blogsQuery.repository";
import {PostSchema} from "../posts/schemas/post.schema";

@Module({
  imports: [MongooseModule.forFeature([{name: Blog.name, schema: BlogSchema}, {name: Post.name, schema: PostSchema}])],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository],
})
export class BlogsModule {}
