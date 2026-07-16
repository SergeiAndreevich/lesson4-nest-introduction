import { Module } from '@nestjs/common';
import { PostsService } from './no-sql/posts.service';
import { PostsController } from './no-sql/posts.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {PostsRepository} from "./no-sql/posts.repository";
import {PostsQueryRepository} from "./no-sql/postsQuery.reposiroty";
import {Post, PostSchema} from "./shema/post.schema";
import {BlogsModule} from "../blogs/blogs.module";
import {FindAllPostsUseCase} from "./useCase/findAllPosts.use-case";
import {CreateNewPostUseCase} from "./useCase/createPost.use-case";
import {ChangePostLikeStatusUseCase} from "./useCase/changePostLikeStatus.use-case";
import {ReactionsModule} from "../../reactionsLogic/reactions.module";
import {FindPostsForBlogUseCase} from "./useCase/findPostsForBlog.use-case";
import {CreatePostForBlogUseCase} from "./useCase/createPostForBlog.use-case";
import {CqrsModule} from "@nestjs/cqrs";
import {DatabaseModule} from "../../../setup/database/database.module";
import {PostsSAController} from "./postsSA.controller";
import {PostsSQLRepository} from "./postsSQL.repository";
import {PostsSQLQueryRepository} from "./postsSQLQuery.reposiroty";
import {CreatePostForBlogSAUseCase} from "./useCase/createPostForBlogSA.use-case";
import {FindPostsForBlogSAUseCase} from "./useCase/findPostsForBlogSA.use-case";
import {RemovePostSAUseCase} from "./useCase/removePostSA.use-case";
import {UpdatePostSACommand, UpdatePostSAUseCase} from "./useCase/updatePostSA.use-case";
import {FindAllPostSAUseCase} from "./useCase/findAllPostsSA.use-case";
import {FindPostSAQuery, FindPostSAUseCase} from "./useCase/findPostSA.use-case";

@Module({
  imports: [MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }
  ]), CqrsModule, BlogsModule, ReactionsModule, DatabaseModule],
  controllers: [PostsController, PostsSAController],
  providers: [PostsService, PostsRepository, PostsQueryRepository, PostsSQLRepository, PostsSQLQueryRepository,
  FindAllPostsUseCase, FindPostsForBlogUseCase, CreateNewPostUseCase, CreatePostForBlogUseCase, ChangePostLikeStatusUseCase,
      CreatePostForBlogSAUseCase, FindPostsForBlogSAUseCase, FindAllPostSAUseCase, FindPostSAUseCase, RemovePostSAUseCase, UpdatePostSAUseCase
  ],
  exports: [PostsRepository,PostsQueryRepository, PostsSQLRepository, PostsSQLQueryRepository],
})
export class PostsModule {}