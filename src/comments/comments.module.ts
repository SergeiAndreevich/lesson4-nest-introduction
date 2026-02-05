import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import {CommentsRepository} from "./comments.repository";
import {CommentsQueryRepository} from "./commentQuery.repository";
import {MongooseModule} from "@nestjs/mongoose";
import {Comment, CommentSchema} from "./schemas/comment.schema";

@Module({
  imports: [MongooseModule.forFeature([{name: Comment.name, schema: CommentSchema}])],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository, CommentsQueryRepository],
  exports: [CommentsService, CommentsRepository, CommentsQueryRepository],
})
export class CommentsModule {}
