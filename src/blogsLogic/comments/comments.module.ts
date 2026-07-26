import { Module } from '@nestjs/common';
import { CommentsService } from './no-sql/comments.service';
import { CommentsController } from './no-sql/comments.controller';
import {CommentsRepository} from "./no-sql/comments.repository";
import {CommentsQueryRepository} from "./no-sql/commentQuery.repository";
import {MongooseModule} from "@nestjs/mongoose";
import {Comment, CommentSchema} from "./schema/comment.schema";
import {ChangeCommentLikeStatusUseCase} from "./useCase/changeCommentLikeStatus.use-case";
import {CreateCommentForPostUseCase} from "./useCase/createCommentForPost.use-case";
import {UpdateCommentUseCase} from "./useCase/updateCommentCommand.use-case";
import {RemoveCommentUseCase} from "./useCase/removeComment.use-case";
import {PostsModule} from "../posts/posts.module";
import {ReactionsModule} from "../../reactionsLogic/reactions.module";
import {CqrsModule} from "@nestjs/cqrs";
import {FindCommentsForPostUseCase} from "./useCase/findCommentsForPost.use-case";
import {CreateCommentForPostSAUseCase} from "./useCase/createCommentForPostSA.use-case";
import {CommentsSQLRepository} from "./commentsSA.repository";
import {CommentsSQLQueryRepository} from "./commentSAQuery.repository";
import {DatabaseModule} from "../../../setup/database/database.module";
import {FindCommentsForPostSAUseCase} from "./useCase/findCommentsForPostSA.use-case";
import {CommentsSAController} from "./commentsSA.controller";
import {FindCommentSAUseCase} from "./useCase/findComment.use-case";
import {ChangeCommentLikeStatusSAUseCase} from "./useCase/changeCommentLikeStatusSA.use-case";
import {UpdateCommentSAUseCase} from "./useCase/updateCommentCommandSA.use-case";
import {RemoveCommentSAUseCase} from "./useCase/removeCommentSA.use-case";

@Module({
  imports: [MongooseModule.forFeature([{name: Comment.name, schema: CommentSchema}]), CqrsModule, PostsModule, ReactionsModule, DatabaseModule],
  controllers: [CommentsController, CommentsSAController],
  providers: [CommentsService, CommentsRepository, CommentsQueryRepository,CommentsSQLRepository, CommentsSQLQueryRepository,
  ChangeCommentLikeStatusUseCase, CreateCommentForPostUseCase,UpdateCommentUseCase, RemoveCommentUseCase, FindCommentsForPostUseCase,
  CreateCommentForPostSAUseCase, FindCommentsForPostSAUseCase, FindCommentSAUseCase,ChangeCommentLikeStatusSAUseCase,UpdateCommentSAUseCase,RemoveCommentSAUseCase
  ],
  exports: [CommentsRepository, CommentsQueryRepository, CommentsSQLRepository, CommentsSQLQueryRepository],
})
export class CommentsModule {}
