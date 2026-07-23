import {Controller, Get, Post, Body, Param, Delete, Query, Put, Inject, HttpCode, UseGuards} from '@nestjs/common';
import { PostsService } from './no-sql/posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import {PaginationQueryDto} from "../../dto/pagination-query.dto";
import {CommandBus, QueryBus} from "@nestjs/cqrs";
import {PostsQueryRepository} from "./no-sql/postsQuery.reposiroty";
import {TypePostView} from "../../types/post.types";
import {TypePaginatorObject} from "../../types/pagination.types";
import {CreateCommentDto} from "../comments/dto/create-comment.dto";
import {BearerGuard} from "../../../setup/guard/bearer.guard";
import {UserId} from "../../customDecorators/userId.decorator";
import {UserLogin} from "../../customDecorators/userLogin.decorator";
import {ReactionInputDto} from "../../reactionsLogic/dto/reaction-input.dto";
import {ChangePostLikeStatusCommand} from "./useCase/changePostLikeStatus.use-case";
import {FindCommentsForPostCommand} from "../comments/useCase/findCommentsForPost.use-case";
import {BasicGuard} from "../../../setup/guard/basic.guard";
import {OptionalBearerGuard} from "../../../setup/guard/optionalBearer.guard";
import {FindAllPostSAQuery} from "./useCase/findAllPostsSA.use-case";
import {CreatePostSACommand} from "./useCase/createPostSA.use-case";
import {CreateCommentForPostSACommand} from "../comments/useCase/createCommentForPostSA.use-case";
import {FindCommentsForPostSAQuery} from "../comments/useCase/findCommentsForPostSA.use-case";
import {PostsSQLQueryRepository} from "./postsSQLQuery.reposiroty";

@Controller('sa/posts')
export class PostsSAController {
  constructor(private readonly postsService: PostsService,
              private readonly commandBus: CommandBus,
              private readonly queryBus: QueryBus,
              private readonly postsQueryRepo: PostsQueryRepository,
              private readonly postsSQLQueryRepo: PostsSQLQueryRepository) {}

  @Post()
  @UseGuards(BasicGuard)
  @HttpCode(201)
  async createPost(@Body() createPostDto: CreatePostDto):Promise<TypePostView> {
    return await this.commandBus.execute(new CreatePostSACommand(createPostDto))
  }

  @Post(':postId/comments')
  @UseGuards(BearerGuard)
  @HttpCode(201)
  async createCommentForPost(@UserId()userId:string, @UserLogin()userLogin:string, @Param('postId') postId: string, @Body() dto: CreateCommentDto) {
    //return await this.commandBus.execute(new CreateCommentForPostCommand(userId, userLogin, postId, dto));
    return await this.commandBus.execute(new CreateCommentForPostSACommand(userId, userLogin,postId,dto))
  }

  //Вот здесь нужен optionalBearer, тк получаем посты и возможно на каком-то есть наша реакция
  @Get()
  @UseGuards(OptionalBearerGuard)
  async findAllPostsByQuery(@Query()dto:PaginationQueryDto, @UserId() userId?:string):Promise<TypePaginatorObject<TypePostView[]>> {
    //return this.commandBus.execute(new FindAllPostsCommand(dto, userId))
    return await this.queryBus.execute(new FindAllPostSAQuery(dto, userId))
  }

  //Вот здесь нужен optionalBearer, тк получаем посты и возможно на каком-то есть наша реакция
  @Get(':id')
  @UseGuards(OptionalBearerGuard)
  findPostById(@Param('id') id: string, @UserId() userId?: string):Promise<TypePostView> {
    return this.postsQueryRepo.findPostByIdOrFail(id, userId)
  }

  //Вот здесь нужен optionalBearer, тк получаем посты и возможно на каком-то есть наша реакция
  @Get(':postId/comments')
  @UseGuards(OptionalBearerGuard)
  async findCommentsForPost(@Param('postId') postId: string, @Query() dto: PaginationQueryDto, @UserId() userId?:string) {
    //return this.commandBus.execute(new FindCommentsForPostCommand(postId, dto, userId));
    return await this.queryBus.execute(new FindCommentsForPostSAQuery(postId, dto, userId))
  }

  @Put(':postId/like-status')
  @UseGuards(BearerGuard)
  @HttpCode(204)
  async changePostLikeStatus(@UserId()userId:string, @UserLogin()userLogin:string, @Param('postId') postId: string, @Body() dto: ReactionInputDto){
    return this.commandBus.execute(new ChangePostLikeStatusCommand(userId, userLogin, postId, dto));
  }

  @Put(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  updatePostById(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.updatePostById(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(BasicGuard)
  @HttpCode(204)
  removePostById(@Param('id') id: string) {
    return this.postsService.removePostById(id);
  }
}
