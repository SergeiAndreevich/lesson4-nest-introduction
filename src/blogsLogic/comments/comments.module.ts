import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import {CommentsRepository} from "./comments.repository";
import {CommentsQueryRepository} from "./commentQuery.repository";
import {MongooseModule} from "@nestjs/mongoose";
import {Comment, CommentSchema} from "./schema/comment.schema";
import {ChangeCommentLikeStatusUseCase} from "./useCase/changeCommentLikeStatus.use-case";
import {CreateCommentForPostUseCase} from "./useCase/createCommentForPost.use-case";
import {UpdateCommentUseCase} from "./useCase/updateCommentCommand.use-case";
import {RemoveCommentUseCase} from "./useCase/removeComment.use-case";
import {PostsModule} from "../posts/posts.module";
import {ReactionsModule} from "../../reactionsLogic/reactions.module";
import {CqrsModule} from "@nestjs/cqrs";

@Module({
  imports: [MongooseModule.forFeature([{name: Comment.name, schema: CommentSchema}]), CqrsModule, PostsModule, ReactionsModule],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository, CommentsQueryRepository,
  ChangeCommentLikeStatusUseCase, CreateCommentForPostUseCase,UpdateCommentUseCase, RemoveCommentUseCase,],
  exports: [CommentsRepository, CommentsQueryRepository],
})
export class CommentsModule {}
