import {Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, HttpCode} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import {CommentsQueryRepository} from "./commentQuery.repository";
import {CommandBus} from "@nestjs/cqrs";
import {BearerGuard} from "../../../setup/guard/bearer.guard";
import {UserId} from "../../customDecorators/userId.decorator";
import {UserLogin} from "../../customDecorators/userLogin.decorator";
import {ReactionInputDto} from "../../reactionsLogic/dto/reaction-input.dto";
import {ChangeCommentLikeStatusCommand} from "./useCase/changeCommentLikeStatus.use-case";
import {UpdateCommentCommand} from "./useCase/updateCommentCommand.use-case";
import {RemoveCommentCommand} from "./useCase/removeComment.use-case";

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService,
              private readonly commentsQueryRepo: CommentsQueryRepository,
              private readonly commandBus: CommandBus,) {}

  @Get(':id')
  findCommentById(@Param('id') id: string) {
    return this.commentsQueryRepo.findCommentByIdOrFail(id);
  }

  @Put(':commentId/like-status')
  @UseGuards(BearerGuard)
  @HttpCode(204)
  async changeCommentLikeStatus(@UserId()userId:string, @Param('commentId') commentId: string, @Body() dto: ReactionInputDto){
    return this.commandBus.execute(new ChangeCommentLikeStatusCommand(userId, commentId, dto));
  }

  @Put(':commentId')
  @UseGuards(BearerGuard)
  @HttpCode(204)
  async updateCommentByCommentId(@UserId()userId:string, @UserLogin() userLogin: string, @Param('commentId') commentId: string, @Body() dto:UpdateCommentDto){
    return this.commandBus.execute(new UpdateCommentCommand(userId, userLogin, commentId, dto));
  }

  @Delete(':commentId')
  @UseGuards(BearerGuard)
  @HttpCode(204)
  async removeCommentByCommentId(@UserId()userId:string, @UserLogin() userLogin: string, @Param('commentId') commentId: string){
    return this.commandBus.execute(new RemoveCommentCommand(userId, userLogin, commentId));
  }
}
