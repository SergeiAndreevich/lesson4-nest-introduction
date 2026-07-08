import {Module} from '@nestjs/common';
import { BlogsService } from './no-sql/blogs.service';
import { BlogsController } from './no-sql/blogs.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {BlogsRepository} from "./no-sql/blogs.repository";
import {BlogsQueryRepository} from "./no-sql/blogsQuery.repository";
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
