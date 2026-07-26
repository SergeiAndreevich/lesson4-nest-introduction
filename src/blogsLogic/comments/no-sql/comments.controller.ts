import {Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, HttpCode} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';
import {CommentsQueryRepository} from "./commentQuery.repository";
import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {BearerGuard} from "../../../../setup/guard/bearer.guard";
import {UserId} from "../../../customDecorators/userId.decorator";
import {UserLogin} from "../../../customDecorators/userLogin.decorator";
import {ReactionInputDto} from "../../../reactionsLogic/dto/reaction-input.dto";
import {ChangeCommentLikeStatusCommand} from "../useCase/changeCommentLikeStatus.use-case";
import {UpdateCommentCommand} from "../useCase/updateCommentCommand.use-case";
import {RemoveCommentCommand} from "../useCase/removeComment.use-case";
import {OptionalBearerGuard} from "../../../../setup/guard/optionalBearer.guard";
import {FindCommentSAQuery} from "../useCase/findComment.use-case";
import {ChangeCommentLikeStatusSACommand} from "../useCase/changeCommentLikeStatusSA.use-case";
import {UpdateCommentSACommand} from "../useCase/updateCommentCommandSA.use-case";
import {RemoveCommentSACommand} from "../useCase/removeCommentSA.use-case";

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService,
              private readonly commentsQueryRepo: CommentsQueryRepository,
              private readonly commandBus: CommandBus,
              private readonly queryBus: QueryBus) {}

  //Вот здесь нужен optionalBearer, тк получаем посты и возможно на каком-то есть наша реакция
  @Get(':id')
  @UseGuards(OptionalBearerGuard)
  async findCommentById(@Param('id') id: string, @UserId() userId?: string) {
    //return this.commentsQueryRepo.findCommentByIdOrFail(id, userId);
    return await this.queryBus.execute(new FindCommentSAQuery(id,userId))
  }

  @Put(':commentId/like-status')
  @UseGuards(BearerGuard)
  @HttpCode(204)
  async changeCommentLikeStatus(@UserId()userId:string, @UserLogin()userLogin: string, @Param('commentId') commentId: string, @Body() dto: ReactionInputDto){
    //return this.commandBus.execute(new ChangeCommentLikeStatusCommand(userId, userLogin, commentId, dto));
    return await this.commandBus.execute(new ChangeCommentLikeStatusSACommand(userId, userLogin, commentId, dto))
  }

  @Put(':commentId')
  @UseGuards(BearerGuard)
  @HttpCode(204)
  async updateCommentByCommentId(@UserId()userId:string, @UserLogin() userLogin: string, @Param('commentId') commentId: string, @Body() dto:UpdateCommentDto){
    //return this.commandBus.execute(new UpdateCommentCommand(userId, userLogin, commentId, dto));
    return await this.commandBus.execute(new UpdateCommentSACommand(userId, userLogin, commentId, dto))
  }

  @Delete(':commentId')
  @UseGuards(BearerGuard)
  @HttpCode(204)
  async removeCommentByCommentId(@UserId()userId:string, @UserLogin() userLogin: string, @Param('commentId') commentId: string){
    //return this.commandBus.execute(new RemoveCommentCommand(userId, userLogin, commentId));
    return await this.commandBus.execute(new RemoveCommentSACommand(userId, userLogin, commentId))
  }
}
