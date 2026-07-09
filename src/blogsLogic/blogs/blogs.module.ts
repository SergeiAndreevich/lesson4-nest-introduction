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
import {CreateBlogSAUseCase} from "./useCase/createNewBlogSA.use-case";
import {CreatePostForBlogSAUseCase} from "../posts/useCase/createPostForBlogSA.use-case";
import {FindAllBlogsSAUseCase} from "./useCase/findAllBlogsSA.use-case";
import {FindBlogSAUseCase} from "./useCase/findBlogSA.use-case";
import {UpdateBlogSAUseCase} from "./useCase/updateBlogSA.use-case";
import {RemoveBlogSAUseCase} from "./useCase/removeBlogSA.use-case";
import {DatabaseModule} from "../../../setup/database/database.module";

@Module({
  imports: [MongooseModule.forFeature([
      {name: Blog.name, schema: BlogSchema}]), CqrsModule, DatabaseModule
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository,
      CreateNewBlogUseCase, FindAllBlogsUseCase,
      CreateBlogSAUseCase, CreatePostForBlogSAUseCase, FindAllBlogsSAUseCase, FindBlogSAUseCase, UpdateBlogSAUseCase, RemoveBlogSAUseCase],
    exports: [BlogsQueryRepository, BlogsRepository],
})
export class BlogsModule {}
