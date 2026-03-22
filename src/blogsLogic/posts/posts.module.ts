import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {PostsRepository} from "./posts.repository";
import {PostsQueryRepository} from "./postsQuery.reposiroty";
import {Post, PostSchema} from "./shema/post.schema";
import {BlogsModule} from "../blogs/blogs.module";
import {FindAllPostsUseCase} from "./useCase/findAllPosts.use-case";
import {CreateNewPostUseCase} from "./useCase/createPost.use-case";
import {ChangePostLikeStatusUseCase} from "./useCase/changePostLikeStatus.use-case";
import {ReactionsModule} from "../../reactionsLogic/reactions.module";
import {FindPostsForBlogUseCase} from "./useCase/findPostsForBlog.use-case";
import {CreatePostForBlogUseCase} from "./useCase/createPostForBlog.use-case";

@Module({
  imports: [MongooseModule.forFeature([{ name: Post.name, schema: PostSchema } // для проверки blogId
  ]), BlogsModule, ReactionsModule],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository, PostsQueryRepository,
  FindAllPostsUseCase, FindPostsForBlogUseCase, CreateNewPostUseCase, CreatePostForBlogUseCase, ChangePostLikeStatusUseCase],
  exports: [PostsRepository,PostsQueryRepository],
})
export class PostsModule {}