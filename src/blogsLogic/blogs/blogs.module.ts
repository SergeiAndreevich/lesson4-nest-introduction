import {Module} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {BlogsRepository} from "./blogs.repository";
import {BlogsQueryRepository} from "./blogsQuery.repository";
import {Blog, BlogSchema} from "./schema/blog.schema";
import {CreateNewBlogUseCase} from "./useCase/createNewBlog.use-case";
import {FindAllBlogsUseCase} from "./useCase/findAllBlogs.use-case";
import {CqrsModule} from "@nestjs/cqrs";

@Module({
  imports: [MongooseModule.forFeature([
      {name: Blog.name, schema: BlogSchema}]), CqrsModule
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository,
      CreateNewBlogUseCase, FindAllBlogsUseCase],
    exports: [BlogsQueryRepository, BlogsRepository],
})
export class BlogsModule {}
